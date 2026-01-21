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
import {Theme} from "../../styles/theme";
import {useEvents} from "../../hooks/useEvents";
import {MoltingEvent} from "../../types/events";
import MoltingHistoryCard from "./MoltingHistoryScreen";

export default function AnimalDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { getAnimal, getFeedingHistory, deleteAnimalCompletely } = useAnimals();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [feedingHistory, setFeedingHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [moltingHistory, setMoltingHistory] = useState<MoltingEvent[]>([]);
    const { getMoltingHistory } = useEvents();

    useEffect(() => {
        loadAnimalDetails();
    }, [animalId]);

    const loadMoltingHistory = async () => {
        const result = await getMoltingHistory(animalId, 5); // 5 ostatnich
        if (result.success && result.data) {
            setMoltingHistory(result.data);
        }
    };

    useEffect(() => {
        if (animal) {
            loadMoltingHistory();
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
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Podstawowe informacje */}
                <SectionCard>
                    <AnimalHeader animal={animal} />
                </SectionCard>

                {/* Pomiary i wiek */}
                <SectionCard>
                    <MeasurementsSection animal={animal} />
                </SectionCard>

                {/* Terrarium */}
                {animal.housing && (
                    <SectionCard>
                        <TerrariumSection animal={animal} />
                    </SectionCard>
                )}

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

                {/* Zachowanie */}
                {animal.specificData && (
                    <SectionCard>
                        <BehaviorSection animal={animal} />
                    </SectionCard>
                )}

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

                {/* Status zdrowia */}
                <SectionCard>
                    <HealthStatusSection animal={animal} />
                </SectionCard>

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
                ]}
                onStateChange={({ open }) => setFabOpen(open)}
                fabStyle={styles.fab}
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
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: theme.colors.primary,
    },
});
