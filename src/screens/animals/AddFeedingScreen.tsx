import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
    Text,
    Card,
    Appbar,
    Button,
    SegmentedButtons,
    Checkbox,
    List,
    Divider,
    FAB,
    ActivityIndicator,
    Snackbar
} from 'react-native-paper';
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";

interface AddFeedingScreenProps {
    navigation?: any;
}

type FeedingMode = 'all' | 'select';

export const AddFeedingScreen: React.FC<AddFeedingScreenProps> = ({ navigation }) => {
    const {
        animals,
        loading,
        feedMultipleAnimals,
        quickFeed,
        stats
    } = useAnimals();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [feedingMode, setFeedingMode] = useState<FeedingMode>('all');
    const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
    const [allSelected, setAllSelected] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    // Automatycznie zaznacz wszystkie zwierzęta gdy zmieni się tryb na "all"
    useEffect(() => {
        if (feedingMode === 'all') {
            setSelectedAnimals(new Set(animals.map(animal => animal.id)));
            setAllSelected(true);
        } else {
            // W trybie select wyczyść zaznaczenia
            setSelectedAnimals(new Set());
            setAllSelected(false);
        }
    }, [feedingMode, animals]);

    // Obsługa zaznaczania pojedynczego zwierzęcia
    const toggleAnimalSelection = (animalId: string) => {
        const newSelected = new Set(selectedAnimals);
        if (newSelected.has(animalId)) {
            newSelected.delete(animalId);
        } else {
            newSelected.add(animalId);
        }
        setSelectedAnimals(newSelected);
        setAllSelected(newSelected.size === animals.length);
    };

    // Obsługa zaznaczania wszystkich
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedAnimals(new Set());
            setAllSelected(false);
        } else {
            setSelectedAnimals(new Set(animals.map(animal => animal.id)));
            setAllSelected(true);
        }
    };

    // Główna funkcja zapisywania karmienia
    const handleSave = async () => {
        if (selectedAnimals.size === 0) {
            Alert.alert('Błąd', 'Wybierz przynajmniej jedno zwierzę do nakarmienia');
            return;
        }
        await performSave()
    };

    const performSave = async () => {
        setIsSubmitting(true);
        try {
            const result = await quickFeed(
                Array.from(selectedAnimals),
                'cricket',
                1,
                `Karmienie z dnia ${new Date().toLocaleDateString('pl-PL')}`
            );

            if (result.success) {
                setSnackbarMessage(`Pomyślnie nakarmiono ${selectedAnimals.size} zwierząt!`);
                setSnackbarVisible(true);
                // Automatyczny powrót po 2 sekundach
                setTimeout(() => {
                    navigation?.goBack();
                }, 2000);
            } else {
                Alert.alert('Błąd', result.error || 'Nie udało się zapisać karmienia');
            }
        } catch (error: any) {
            Alert.alert('Błąd', error.message || 'Wystąpił nieoczekiwany błąd');
        } finally {
            setIsSubmitting(false);
        }
    };

    const segmentedButtonsData = [
        {
            value: 'all',
            label: 'Wszystkie',
            icon: 'select-all'
        },
        {
            value: 'select',
            label: 'Wybierz',
            icon: 'checkbox-marked-outline'
        }
    ];

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Ładowanie zwierząt...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation?.goBack()} />
                <Appbar.Content title="🍽️ Dodaj karmienie" />
            </Appbar.Header>

            <View style={styles.content}>
                {/* Statystyki szybkie */}
                {stats.feeding && (
                    <Card style={styles.statsCard}>
                        <Card.Content>
                            <Text variant="titleSmall" style={styles.statsTitle}>
                                📊 Status karmienia
                            </Text>
                            <View style={styles.statsRow}>
                                <Text variant="bodySmall">
                                    Nakarmione dzisiaj: {stats.feeding.fedToday}
                                </Text>
                                <Text variant="bodySmall" style={styles.statsError}>
                                    Wymagają karmienia: {stats.feeding.dueForFeeding}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Wybór trybu karmienia */}
                <Card style={styles.modeCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Tryb karmienia
                        </Text>
                        <Text variant="bodyMedium" style={styles.sectionDescription}>
                            Wybierz czy chcesz nakarmić wszystkie zwierzęta, czy tylko wybrane
                        </Text>

                        <SegmentedButtons
                            value={feedingMode}
                            onValueChange={(value) => setFeedingMode(value as FeedingMode)}
                            buttons={segmentedButtonsData}
                            style={styles.segmentedButtons}
                        />
                    </Card.Content>
                </Card>

                {/* Lista zwierząt */}
                <Card style={styles.animalsCard}>
                    <Card.Content>
                        <View style={styles.headerRow}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Zwierzęta ({selectedAnimals.size}/{animals.length})
                            </Text>

                            {feedingMode === 'select' && animals.length > 0 && (
                                <Button
                                    mode="text"
                                    onPress={toggleSelectAll}
                                    compact
                                >
                                    {allSelected ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                                </Button>
                            )}
                        </View>

                        {animals.length === 0 ? (
                            <Text variant="bodyMedium" style={styles.emptyText}>
                                Brak zwierząt do nakarmienia
                            </Text>
                        ) : (
                            <ScrollView style={styles.animalsList} showsVerticalScrollIndicator={false}>
                                {animals.map((animal, index) => (
                                    <View key={animal.id}>
                                        <List.Item
                                            title={animal.name}
                                            description={`${animal.species || 'Nieznany gatunek'} • L${animal.stage || '?'}`}
                                            left={() =>
                                                <Checkbox
                                                    status={selectedAnimals.has(animal.id) ? 'checked' : 'unchecked'}
                                                    onPress={() => feedingMode === 'select' ? toggleAnimalSelection(animal.id) : null}
                                                    disabled={feedingMode === 'all'}
                                                />
                                            }
                                            right={() => animal.feeding?.lastFed ? (
                                                <View style={styles.lastFeedingContainer}>
                                                    <Text variant="bodySmall" style={styles.lastFeedingText}>
                                                        Ostatnie karmienie:
                                                    </Text>
                                                    <Text variant="bodySmall" style={styles.lastFeedingDate}>
                                                        {new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text variant="bodySmall" style={styles.neverFedText}>
                                                    Nigdy nie karmione
                                                </Text>
                                            )}
                                            onPress={() => feedingMode === 'select' ? toggleAnimalSelection(animal.id) : null}
                                            style={[
                                                styles.animalItem,
                                                selectedAnimals.has(animal.id) && styles.selectedAnimalItem
                                            ]}
                                        />
                                        {index < animals.length - 1 && <Divider />}
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </Card.Content>
                </Card>

                {/* Informacja o wybranych zwierzętach */}
                {selectedAnimals.size > 0 && (
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Text variant="titleSmall" style={styles.summaryTitle}>
                                📝 Podsumowanie
                            </Text>
                            <Text variant="bodyMedium">
                                Wybrano {selectedAnimals.size} zwierząt do nakarmienia
                            </Text>
                            {feedingMode === 'all' && (
                                <Text variant="bodySmall" style={styles.summaryNote}>
                                    Wszystkie zwierzęta zostaną nakarmione jednocześnie
                                </Text>
                            )}
                        </Card.Content>
                    </Card>
                )}
            </View>

            {/* FAB zapisz */}
            <FAB
                icon="content-save"
                style={[
                    styles.fab,
                    { backgroundColor: selectedAnimals.size > 0 ? theme.colors.primary : theme.colors.disabled }
                ]}
                onPress={handleSave}
                label="Zapisz karmienie"
                disabled={selectedAnimals.size === 0 || isSubmitting}
            />

            {/* Loader overlay */}
            {isSubmitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingOverlayText}>Zapisywanie karmienia...</Text>
                </View>
            )}

            {/* Snackbar dla powiadomień */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingText: {
        marginTop: 16,
        color: theme.colors.textSecondary,
    },
    statsCard: {
        marginBottom: 16,
        backgroundColor: theme.colors.secondaryContainer,
    },
    statsTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statsError: {
        color: theme.colors.error,
    },
    modeCard: {
        marginBottom: 16,
    },
    animalsCard: {
        flex: 1,
        marginBottom: 16,
    },
    summaryCard: {
        backgroundColor: theme.colors.primaryContainer,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    sectionDescription: {
        color: theme.colors.textSecondary,
        marginBottom: 16,
    },
    segmentedButtons: {
        marginTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    animalsList: {
        maxHeight: 300,
    },
    animalItem: {
        paddingHorizontal: 0,
    },
    selectedAnimalItem: {
        backgroundColor: theme.colors.primaryContainer,
        borderRadius: 8,
    },
    lastFeedingContainer: {
        alignItems: 'flex-end',
    },
    lastFeedingText: {
        color: theme.colors.textSecondary,
    },
    lastFeedingDate: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    neverFedText: {
        color: theme.colors.error,
        fontStyle: 'italic',
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 32,
    },
    summaryTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summaryNote: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingOverlayText: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});

export default AddFeedingScreen;