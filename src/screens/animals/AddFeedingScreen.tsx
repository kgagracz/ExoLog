import React, { useState, useEffect, useMemo } from 'react';
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
import { useAnimalsQuery } from "../../api/animals";
import { useBulkFeedMutation, useFeedAnimalMutation } from "../../api/feeding";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface AddFeedingScreenProps {
    navigation?: any;
}

type FeedingMode = 'all' | 'select';

export const AddFeedingScreen: React.FC<AddFeedingScreenProps> = ({ navigation }) => {
    const { t } = useAppTranslation('animals');
    const { data: animals = [], isLoading: loading } = useAnimalsQuery();
    const feedAnimalMutation = useFeedAnimalMutation();
    const bulkFeedMutation = useBulkFeedMutation();

    const stats = useMemo(() => ({
        feeding: {
            fedToday: animals.filter(animal => {
                const today = new Date().toISOString().split('T')[0];
                return animal.feeding?.lastFed === today;
            }).length,
            dueForFeeding: animals.filter(animal => {
                if (!animal.feeding?.lastFed) return true;
                const lastFed = new Date(animal.feeding.lastFed);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastFed <= weekAgo;
            }).length
        }
    }), [animals]);

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
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
            Alert.alert(t('common:error'), t('addFeeding.selectAtLeastOne'));
            return;
        }

        Alert.alert(
            t('addFeeding.confirmTitle'),
            t('addFeeding.confirmMessage', { count: selectedAnimals.size }),
            [
                { text: t('common:cancel'), style: 'cancel' },
                { text: t('common:save'), onPress: performSave }
            ]
        );
    };

    const performSave = async () => {
        setIsSubmitting(true);
        try {
            const selectedIds = Array.from(selectedAnimals);
            if (selectedIds.length === 1) {
                await feedAnimalMutation.mutateAsync({
                    animalId: selectedIds[0],
                    foodType: 'cricket',
                    foodSize: 'medium',
                    quantity: 1,
                    date: new Date().toISOString().split('T')[0],
                    notes: t('addFeeding.feedingNote', { date: new Date().toLocaleDateString('pl-PL') }),
                });
            } else {
                await bulkFeedMutation.mutateAsync({
                    animalIds: selectedIds,
                    foodType: 'cricket',
                    foodSize: 'medium',
                    quantity: 1,
                    date: new Date().toISOString().split('T')[0],
                    notes: t('addFeeding.feedingNote', { date: new Date().toLocaleDateString('pl-PL') }),
                });
            }
            setSnackbarMessage(t('addFeeding.successMessage', { count: selectedAnimals.size }));
            setSnackbarVisible(true);
            setTimeout(() => {
                navigation?.goBack();
            }, 2000);
        } catch (error: any) {
            Alert.alert(t('common:error'), error.message || t('common:unexpectedError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const segmentedButtonsData = [
        {
            value: 'all',
            label: t('addFeeding.modeAll'),
            icon: 'select-all'
        },
        {
            value: 'select',
            label: t('addFeeding.modeSelect'),
            icon: 'checkbox-marked-outline'
        }
    ];

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>{t('addFeeding.loadingAnimals')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation?.goBack()} />
                    <Appbar.Content title={t('addFeeding.title')} />
                </Appbar.Header>

                <View style={styles.content}>
                    {/* Statystyki szybkie */}
                    {stats.feeding && (
                        <Card style={styles.statsCard}>
                            <Card.Content>
                                <Text variant="titleSmall" style={styles.statsTitle}>
                                    {t('addFeeding.feedingStatus')}
                                </Text>
                                <View style={styles.statsRow}>
                                    <Text variant="bodySmall">
                                        {t('addFeeding.fedToday', { count: stats.feeding.fedToday })}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.statsError}>
                                        {t('addFeeding.dueForFeeding', { count: stats.feeding.dueForFeeding })}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Wybór trybu karmienia */}
                    <Card style={styles.modeCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                {t('addFeeding.feedingMode')}
                            </Text>
                            <Text variant="bodyMedium" style={styles.sectionDescription}>
                                {t('addFeeding.feedingModeDescription')}
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
                                    {t('addFeeding.animalsCount', { selected: selectedAnimals.size, total: animals.length })}
                                </Text>

                                {feedingMode === 'select' && animals.length > 0 && (
                                    <Button
                                        mode="text"
                                        onPress={toggleSelectAll}
                                        compact
                                    >
                                        {allSelected ? t('addFeeding.deselectAll') : t('addFeeding.selectAll')}
                                    </Button>
                                )}
                            </View>

                            {animals.length === 0 ? (
                                <Text variant="bodyMedium" style={styles.emptyText}>
                                    {t('addFeeding.noAnimals')}
                                </Text>
                            ) : (
                                <ScrollView style={styles.animalsList} showsVerticalScrollIndicator={false}>
                                    {animals.map((animal, index) => (
                                        <View key={animal.id}>
                                            <List.Item
                                                title={animal.name}
                                                description={`${animal.species || t('addFeeding.unknownSpecies')} • L${animal.stage || '?'}`}
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
                                                            {t('addFeeding.lastFeeding')}
                                                        </Text>
                                                        <Text variant="bodySmall" style={styles.lastFeedingDate}>
                                                            {new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text variant="bodySmall" style={styles.neverFedText}>
                                                        {t('addFeeding.neverFed')}
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

                </View>
            </ScrollView>

            {/* FAB zapisz - poza ScrollView */}
            <FAB
                icon="content-save"
                style={[
                    styles.fab,
                    { bottom: 16 + insets.bottom, backgroundColor: selectedAnimals.size > 0 ? theme.colors.primary : theme.colors.disabled }
                ]}
                onPress={handleSave}
                label={t('addFeeding.saveFeeding')}
                disabled={selectedAnimals.size === 0 || isSubmitting}
            />

            {/* Loader overlay */}
            {isSubmitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingOverlayText}>{t('addFeeding.savingFeeding')}</Text>
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
    scrollContainer: {
        flex: 1,
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
        flexGrow: 0,
        flexShrink: 1,
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