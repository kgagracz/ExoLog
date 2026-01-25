import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {Text, ActivityIndicator, FAB, Card, IconButton} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import {useAnimals} from "../../hooks";
import {useTheme} from "../../context/ThemeContext";
import {Animal} from "../../types";
import AnimalDetailsHeader from "../../components/molecules/AnimalDetailsHeader";
import SectionCard from "../../components/atoms/SectionCard";
import AnimalHeader from "../../components/molecules/AnimalHeader";
import MeasurementsSection from "../../components/molecules/MeasurementsSection";
import TerrariumSection from "../../components/molecules/TerrariumSection";
import FeedingSection from "../../components/molecules/FeedingSection";
import BehaviorSection from "../../components/molecules/BehaviorSection";
import HealthStatusSection from "../../components/molecules/HealthStatusSection";
import QRCodeModal from "../../components/organisms/QRCodeModal";
import {Theme} from "../../styles/theme";
import {useEvents} from "../../hooks/useEvents";
import {MoltingEvent} from "../../types/events";
import MoltingHistoryCard from "./MoltingHistoryScreen";

export default function AnimalDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { getAnimal, getFeedingHistory, deleteAnimalCompletely, markAsDeceased } = useAnimals();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [feedingHistory, setFeedingHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [moltingHistory, setMoltingHistory] = useState<MoltingEvent[]>([]);
    const [matingStatus, setMatingStatus] = useState<{
        hasMating: boolean;
        lastMatingDate?: string;
        lastMatingResult?: string;
    } | undefined>(undefined);
    const [cocoonStatus, setCocoonStatus] = useState<{
        hasCocoon: boolean;
        lastCocoonDate?: string;
        cocoonStatus?: string;
        estimatedHatchDate?: string;
    } | undefined>(undefined);
    const { getMoltingHistory, getMatingHistory, getCocoonHistory } = useEvents();

    useEffect(() => {
        loadAnimalDetails();
    }, [animalId]);

    const loadMoltingHistory = async () => {
        const result = await getMoltingHistory(animalId, 5); // 5 ostatnich
        if (result.success && result.data) {
            setMoltingHistory(result.data);
        }
    };

    const loadMatingStatus = async () => {
        if (animal?.sex !== 'female') return;

        const result = await getMatingHistory(animalId, 1);
        if (result.success && result.data && result.data.length > 0) {
            const lastMating = result.data[0];
            setMatingStatus({
                hasMating: true,
                lastMatingDate: lastMating.date,
                lastMatingResult: lastMating.eventData?.result,
            });
        }
    };

    const loadCocoonStatus = async () => {
        if (animal?.sex !== 'female') return;

        const result = await getCocoonHistory(animalId, 1);
        if (result.success && result.data && result.data.length > 0) {
            const lastCocoon = result.data[0];
            // Tylko aktywne kokony (laid lub incubating)
            if (lastCocoon.eventData?.cocoonStatus === 'laid' || lastCocoon.eventData?.cocoonStatus === 'incubating') {
                setCocoonStatus({
                    hasCocoon: true,
                    lastCocoonDate: lastCocoon.date,
                    cocoonStatus: lastCocoon.eventData?.cocoonStatus,
                    estimatedHatchDate: lastCocoon.eventData?.estimatedHatchDate,
                });
            }
        }
    };

    useEffect(() => {
        if (animal) {
            loadMoltingHistory();
            loadMatingStatus();
            loadCocoonStatus();
        }
    }, [animal]);

    const loadAnimalDetails = async () => {
        setLoading(true);
        try {
            const [animalResult, feedingResult] = await Promise.all([
                getAnimal(animalId),
                getFeedingHistory(animalId)
            ]);

            if (animalResult.success && animalResult.data) {
                setAnimal(animalResult.data);
            }

            if (feedingResult.success && feedingResult.data) {
                setFeedingHistory(feedingResult.data);
            }
        } catch (error) {
            console.error('Błąd ładowania szczegółów:', error);
            Alert.alert('Błąd', 'Nie udało się załadować szczegółów zwierzęcia');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Usuń zwierzę',
            `Czy na pewno chcesz trwale usunąć ${animal?.name}?\n\nTa operacja jest nieodwracalna i usunie także całą historię karmienia.`,
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Usuń',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteAnimalCompletely(animalId);
                        navigation.navigate('AnimalsList');
                    }
                }
            ]
        );
    };

    const handleMarkDeceased = () => {
        Alert.alert(
            '💀 Oznacz zgon',
            `Czy na pewno chcesz oznaczyć ${animal?.name} jako martwe?\n\nZwierzę zostanie usunięte z listy, ale jego dane zostaną zachowane w historii.`,
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Oznacz zgon',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await markAsDeceased(animalId);
                        if (result.success) {
                            Alert.alert(
                                'Zapisano',
                                `${animal?.name} został oznaczony jako martwy.`,
                                [{ text: 'OK', onPress: () => navigation.navigate('AnimalsList') }]
                            );
                        } else {
                            Alert.alert('Błąd', result.error || 'Nie udało się zapisać zmian.');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        setMenuVisible(false);
        navigation.navigate('EditAnimal', { animalId });
    };

    const handleAddFeeding = () => {
        setMenuVisible(false);
        setFabOpen(false);
        navigation.navigate('AddFeeding', { preSelectedAnimal: animalId });
    };

    const handleAddMolting = () => {
        setFabOpen(false);
        navigation.navigate('AddMolting', { animalId });
    };

    const handleAddMating = () => {
        setFabOpen(false);
        if (animal?.sex === 'unknown') {
            Alert.alert(
                'Nieznana płeć',
                'Aby dodać kopulację, zwierzę musi mieć określoną płeć (samiec lub samica).'
            );
            return;
        }
        navigation.navigate('AddMating', { animalId });
    };

    const handleAddCocoon = () => {
        setFabOpen(false);
        if (animal?.sex !== 'female') {
            Alert.alert(
                'Tylko samice',
                'Tylko samice mogą składać kokony.'
            );
            return;
        }
        navigation.navigate('AddCocoon', { animalId });
    };

    const handleFeedingHistory = () => {
        setMenuVisible(false);
        navigation.navigate('FeedingHistory', { animalId });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <AnimalDetailsHeader
                    animalName="Szczegóły zwierzęcia"
                    menuVisible={false}
                    onMenuToggle={() => {}}
                    onGoBack={() => navigation.goBack()}
                    onEdit={() => {}}
                    onAddFeeding={() => {}}
                    onShowHistory={() => {}}
                    onDelete={() => {}}

                />
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Ładowanie szczegółów...</Text>
            </View>
        );
    }

    if (!animal) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <AnimalDetailsHeader
                    animalName="Szczegóły zwierzęcia"
                    menuVisible={false}
                    onMenuToggle={() => {}}
                    onGoBack={() => navigation.goBack()}
                    onEdit={() => {}}
                    onAddFeeding={() => {}}
                    onShowHistory={() => {}}
                    onDelete={() => {}}
                />
                <Text>Nie znaleziono zwierzęcia</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AnimalDetailsHeader
                animalName={animal.name}
                menuVisible={menuVisible}
                onMenuToggle={setMenuVisible}
                onGoBack={() => navigation.goBack()}
                onEdit={handleEdit}
                onAddFeeding={handleAddFeeding}
                onShowHistory={handleFeedingHistory}
                onDelete={handleDelete}
                onShowQR={() => setQrModalVisible(true)}
                onMarkDeceased={handleMarkDeceased}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Podstawowe informacje */}
                <SectionCard>
                    <AnimalHeader animal={animal} matingStatus={matingStatus} cocoonStatus={cocoonStatus} />
                </SectionCard>

                {/* Pomiary i wiek */}
                <SectionCard>
                    <MeasurementsSection animal={animal} />
                </SectionCard>

                {/*/!* Terrarium *!/*/}
                {/*{animal.housing && (*/}
                {/*    <SectionCard>*/}
                {/*        <TerrariumSection animal={animal} />*/}
                {/*    </SectionCard>*/}
                {/*)}*/}

                {/* Karmienie */}
                <SectionCard>
                    <FeedingSection
                        animal={animal}
                        feedingHistory={feedingHistory}
                        onShowHistory={handleFeedingHistory}
                    />
                </SectionCard>

                <SectionCard>
                    <Card.Title
                        title="Historia wyliniek"
                        right={(props) => (
                            <IconButton
                                {...props}
                                icon="plus"
                                onPress={() => navigation.navigate('AddMolting', { animalId })}
                            />
                        )}
                    />
                    <Card.Content>
                        {moltingHistory.length > 0 ? (
                            moltingHistory.map((molting) => (
                                <MoltingHistoryCard
                                    key={molting.id}
                                    molting={molting}
                                />
                            ))
                        ) : (
                            <Text variant="bodyMedium">
                                Brak historii wyliniek
                            </Text>
                        )}
                    </Card.Content>
                </SectionCard>

                {/*/!* Zachowanie *!/*/}
                {/*{animal.specificData && (*/}
                {/*    <SectionCard>*/}
                {/*        <BehaviorSection animal={animal} />*/}
                {/*    </SectionCard>*/}
                {/*)}*/}

                {/* Notatki */}
                {animal.notes && (
                    <SectionCard>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            📝 Notatki
                        </Text>
                        <Text variant="bodyMedium" style={styles.notesText}>
                            {animal.notes}
                        </Text>
                    </SectionCard>
                )}

                {/*/!* Status zdrowia *!/*/}
                {/*<SectionCard>*/}
                {/*    <HealthStatusSection animal={animal} />*/}
                {/*</SectionCard>*/}

                {/* Spacer dla FAB */}
                <View style={styles.fabSpacer} />
            </ScrollView>

            {/* FAB do dodawania wydarzeń */}
            <FAB.Group
                open={fabOpen}
                visible
                icon={fabOpen ? 'close' : 'plus'}
                actions={[
                    {
                        icon: 'food-apple',
                        label: 'Karmienie',
                        onPress: handleAddFeeding,
                        color: theme.colors.events.feeding.color,
                        style: { backgroundColor: theme.colors.events.feeding.background },
                    },
                    {
                        icon: 'sync',
                        label: 'Wylinka',
                        onPress: handleAddMolting,
                        color: theme.colors.events.molting.color,
                        style: { backgroundColor: theme.colors.events.molting.background },
                    },
                    {
                        icon: 'heart',
                        label: 'Kopulacja',
                        onPress: handleAddMating,
                        color: theme.colors.events.mating.color,
                        style: { backgroundColor: theme.colors.events.mating.background },
                    },
                    {
                        icon: 'egg',
                        label: 'Kokon',
                        onPress: handleAddCocoon,
                        color: theme.colors.events.cocoon.color,
                        style: { backgroundColor: theme.colors.events.cocoon.background },
                    },
                ]}
                onStateChange={({ open }) => setFabOpen(open)}
                fabStyle={styles.fab}
                style={styles.fabGroup}
            />

            {/* Modal z kodem QR */}
            <QRCodeModal
                visible={qrModalVisible}
                onClose={() => setQrModalVisible(false)}
                animal={animal}
            />
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    loadingText: {
        marginTop: 16,
        color: theme.colors.onSurfaceVariant,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    notesText: {
        lineHeight: 20,
        color: theme.colors.onSurfaceVariant,
    },
    fabSpacer: {
        height: 80,
    },
    fabGroup: {
        paddingBottom: 8,
    },
    fab: {
        backgroundColor: theme.colors.primary,
    },
});