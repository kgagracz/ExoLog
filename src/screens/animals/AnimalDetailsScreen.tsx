import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, FAB, Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../context/ThemeContext";
import AnimalDetailsHeader from "../../components/molecules/AnimalDetailsHeader";
import SectionCard from "../../components/atoms/SectionCard";
import AnimalHeader from "../../components/molecules/AnimalHeader";
import MeasurementsSection from "../../components/molecules/MeasurementsSection";
import FeedingSection from "../../components/molecules/FeedingSection";
import PhotosSection from "../../components/molecules/PhotoSection";
import QRCodeModal from "../../components/organisms/QRCodeModal";
import {Theme} from "../../styles/theme";
import MoltingHistoryCard from "./MoltingHistoryScreen";
import { useAnimalQuery } from "../../api/animals";
import { useDeleteAnimalMutation, useMarkDeceasedMutation } from "../../api/animals";
import { useFeedingHistoryQuery } from "../../api/feeding";
import { useMoltingHistoryQuery, useMatingHistoryQuery, useCocoonHistoryQuery } from "../../api/events";

export default function AnimalDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const { data: animal, isLoading: loading } = useAnimalQuery(animalId);
    const { data: feedingHistory = [] } = useFeedingHistoryQuery(animalId);
    const { data: moltingHistory = [] } = useMoltingHistoryQuery(animalId, 5);
    const { data: matingHistoryData = [] } = useMatingHistoryQuery(animal?.sex === 'female' ? animalId : undefined);
    const { data: cocoonHistoryData = [] } = useCocoonHistoryQuery(animal?.sex === 'female' ? animalId : undefined);
    const deleteAnimalMutation = useDeleteAnimalMutation();
    const markDeceasedMutation = useMarkDeceasedMutation();

    const [menuVisible, setMenuVisible] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    const matingStatus = matingHistoryData.length > 0
        ? {
            hasMating: true,
            lastMatingDate: matingHistoryData[0].date,
            lastMatingResult: matingHistoryData[0].eventData?.result,
        }
        : undefined;

    const cocoonStatus = (() => {
        if (cocoonHistoryData.length > 0) {
            const lastCocoon = cocoonHistoryData[0];
            if (lastCocoon.eventData?.cocoonStatus === 'laid' || lastCocoon.eventData?.cocoonStatus === 'incubating') {
                return {
                    hasCocoon: true,
                    lastCocoonDate: lastCocoon.date,
                    cocoonStatus: lastCocoon.eventData?.cocoonStatus,
                    estimatedHatchDate: lastCocoon.eventData?.estimatedHatchDate,
                };
            }
        }
        return undefined;
    })();

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
                        await deleteAnimalMutation.mutateAsync(animalId);
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
                        try {
                            await markDeceasedMutation.mutateAsync({ animalId });
                            Alert.alert(
                                'Zapisano',
                                `${animal?.name} został oznaczony jako martwy.`,
                                [{ text: 'OK', onPress: () => navigation.navigate('AnimalsList') }]
                            );
                        } catch (err: any) {
                            Alert.alert('Błąd', err.message || 'Nie udało się zapisać zmian.');
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

    const handlePhotos = () => {
        setFabOpen(false);
        navigation.navigate('AnimalPhotos', {
            animalId,
            animalName: animal?.name || 'Zwierzę'
        });
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

    const isOwner = !!user && animal?.userId === user.uid;

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
                onShowQR={isOwner ? () => setQrModalVisible(true) : undefined}
                onMarkDeceased={handleMarkDeceased}
                isOwner={isOwner}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero ze zdjęciem głównym */}
                <AnimalHeader
                    animal={animal}
                    matingStatus={matingStatus}
                    cocoonStatus={cocoonStatus}
                    lastMoltDate={moltingHistory[0]?.date}
                />

                {/* Pomiary i wiek */}
                <SectionCard title="Pomiary" icon="📏">
                    <MeasurementsSection animal={animal} />
                </SectionCard>

                {/*/!* Terrarium *!/*/}
                {/*{animal.housing && (*/}
                {/*    <SectionCard title="Terrarium" icon="🏠">*/}
                {/*        <TerrariumSection animal={animal} />*/}
                {/*    </SectionCard>*/}
                {/*)}*/}

                {/* Karmienie */}
                <SectionCard
                    title="Karmienie"
                    icon="🦗"
                    rightAction={{
                        icon: 'history',
                        onPress: handleFeedingHistory
                    }}
                >
                    <FeedingSection
                        animal={animal}
                        feedingHistory={feedingHistory}
                        onShowHistory={handleFeedingHistory}
                    />
                </SectionCard>

                {/* Historia wyliniek */}
                <SectionCard
                    title="Historia wyliniek"
                    icon="🔄"
                    rightAction={isOwner ? {
                        icon: 'plus',
                        onPress: () => navigation.navigate('AddMolting', { animalId })
                    } : undefined}
                >
                    {moltingHistory.length > 0 ? (
                        moltingHistory.map((molting) => (
                            <MoltingHistoryCard
                                key={molting.id}
                                molting={molting}
                            />
                        ))
                    ) : (
                        <Text variant="bodyMedium" style={styles.emptyText}>
                            Brak historii wyliniek
                        </Text>
                    )}
                </SectionCard>

                {/*/!* Zachowanie *!/*/}
                {/*{animal.specificData && (*/}
                {/*    <SectionCard title="Zachowanie" icon="🧠">*/}
                {/*        <BehaviorSection animal={animal} />*/}
                {/*    </SectionCard>*/}
                {/*)}*/}

                {/* Notatki */}
                {animal.notes && (
                    <SectionCard title="Notatki" icon="📝">
                        <Text variant="bodyMedium" style={styles.notesText}>
                            {animal.notes}
                        </Text>
                    </SectionCard>
                )}

                {/* Zdjęcia */}
                {user && (
                    <PhotosSection
                        userId={animal.userId}
                        animalId={animalId}
                        editable={isOwner}
                        maxDisplay={4}
                        onSeeAll={isOwner ? handlePhotos : undefined}
                    />
                )}

                {/*/!* Status zdrowia *!/*/}
                {/*<SectionCard>*/}
                {/*    <HealthStatusSection animal={animal} />*/}
                {/*</SectionCard>*/}

                {/* Spacer dla FAB */}
                <View style={styles.fabSpacer} />
            </ScrollView>

            {/* FAB do dodawania wydarzeń — tylko dla właściciela */}
            <FAB.Group
                open={fabOpen}
                visible={isOwner}
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
                    {
                        icon: 'camera',
                        label: 'Zdjęcie',
                        onPress: handlePhotos,
                        color: theme.colors.events.photo.color,
                        style: { backgroundColor: theme.colors.events.photo.background },
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
    notesText: {
        lineHeight: 20,
        color: theme.colors.onSurfaceVariant,
    },
    emptyText: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
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