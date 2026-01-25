import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Appbar, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import { useEvents } from "../../hooks/useEvents";
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import { CocoonEvent } from "../../types/events";
import { Animal } from "../../types";

export default function CocoonsListScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();

    const { getUpcomingHatches } = useEvents();
    const { animals } = useAnimals();

    const [cocoons, setCocoons] = useState<CocoonEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCocoons = async () => {
        try {
            // Pobierz wszystkie aktywne kokony (duży zakres dni)
            const result = await getUpcomingHatches(365);
            if (result.success && result.data) {
                setCocoons(result.data);
            }
        } catch (error) {
            console.error('Error loading cocoons:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCocoons();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadCocoons();
    };

    const getAnimalById = (animalId: string): Animal | undefined => {
        return animals.find(a => a.id === animalId);
    };

    const getDaysSinceLaid = (date: string): number => {
        const laid = new Date(date);
        const today = new Date();
        const diffTime = today.getTime() - laid.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysUntilHatch = (estimatedHatchDate?: string): number | null => {
        if (!estimatedHatchDate) return null;
        const today = new Date();
        const hatchDate = new Date(estimatedHatchDate);
        const diffTime = hatchDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatusChip = (cocoon: CocoonEvent) => {
        const daysUntil = getDaysUntilHatch(cocoon.eventData?.estimatedHatchDate);

        if (daysUntil !== null && daysUntil <= 0) {
            return (
                <Chip
                    icon="alert"
                    style={styles.warningChip}
                    textStyle={styles.warningChipText}
                >
                    Termin minął!
                </Chip>
            );
        }

        if (daysUntil !== null && daysUntil <= 7) {
            return (
                <Chip
                    icon="clock-alert"
                    style={styles.urgentChip}
                    textStyle={styles.urgentChipText}
                >
                    {daysUntil} dni do wylęgu
                </Chip>
            );
        }

        if (cocoon.eventData?.cocoonStatus === 'incubating') {
            return (
                <Chip
                    icon="thermometer"
                    style={styles.incubatingChip}
                    textStyle={styles.incubatingChipText}
                >
                    Inkubacja
                </Chip>
            );
        }

        return (
            <Chip
                icon="egg"
                style={styles.laidChip}
                textStyle={styles.laidChipText}
            >
                Złożony
            </Chip>
        );
    };

    const handleCocoonPress = (cocoon: CocoonEvent) => {
        navigation.navigate('CocoonDetails', { cocoonId: cocoon.id, animalId: cocoon.animalId });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title="🥚 Kokony" />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Ładowanie kokonów...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="🥚 Kokony" />
            </Appbar.Header>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {cocoons.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="headlineMedium" style={styles.emptyIcon}>🥚</Text>
                        <Text variant="titleMedium" style={styles.emptyTitle}>
                            Brak aktywnych kokonów
                        </Text>
                        <Text variant="bodyMedium" style={styles.emptyDescription}>
                            Gdy samica złoży kokon, pojawi się tutaj
                        </Text>
                    </View>
                ) : (
                    cocoons.map(cocoon => {
                        const animal = getAnimalById(cocoon.animalId);
                        const daysSinceLaid = getDaysSinceLaid(cocoon.date);
                        const daysUntil = getDaysUntilHatch(cocoon.eventData?.estimatedHatchDate);

                        return (
                            <Card
                                key={cocoon.id}
                                style={styles.cocoonCard}
                                onPress={() => handleCocoonPress(cocoon)}
                            >
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardTitleContainer}>
                                            <Text variant="titleMedium" style={styles.animalName}>
                                                {animal?.name || 'Nieznana samica'}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.speciesName}>
                                                {animal?.species || ''}
                                            </Text>
                                        </View>
                                        {getStatusChip(cocoon)}
                                    </View>

                                    <View style={styles.cardDetails}>
                                        <View style={styles.detailRow}>
                                            <Text variant="bodySmall" style={styles.detailLabel}>
                                                📅 Złożony:
                                            </Text>
                                            <Text variant="bodyMedium" style={styles.detailValue}>
                                                {new Date(cocoon.date).toLocaleDateString('pl-PL')} ({daysSinceLaid} dni temu)
                                            </Text>
                                        </View>

                                        {cocoon.eventData?.estimatedHatchDate && (
                                            <View style={styles.detailRow}>
                                                <Text variant="bodySmall" style={styles.detailLabel}>
                                                    🐣 Przewidywany wylęg:
                                                </Text>
                                                <Text variant="bodyMedium" style={[
                                                    styles.detailValue,
                                                    daysUntil !== null && daysUntil <= 7 && styles.urgentText
                                                ]}>
                                                    {new Date(cocoon.eventData.estimatedHatchDate).toLocaleDateString('pl-PL')}
                                                    {daysUntil !== null && daysUntil > 0 && ` (za ${daysUntil} dni)`}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        );
                    })
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: theme.colors.onSurfaceVariant,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        color: theme.colors.onSurface,
        marginBottom: 8,
    },
    emptyDescription: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
    },
    cocoonCard: {
        marginBottom: 12,
        backgroundColor: theme.colors.surface,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 8,
    },
    animalName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    speciesName: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 2,
    },
    cardDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        color: theme.colors.onSurfaceVariant,
        marginRight: 8,
        minWidth: 120,
    },
    detailValue: {
        color: theme.colors.onSurface,
        flex: 1,
    },
    urgentText: {
        color: theme.colors.error,
        fontWeight: '600',
    },
    laidChip: {
        backgroundColor: theme.colors.events.cocoon.background,
    },
    laidChipText: {
        color: theme.colors.events.cocoon.color,
    },
    incubatingChip: {
        backgroundColor: theme.colors.primaryContainer,
    },
    incubatingChipText: {
        color: theme.colors.primary,
    },
    urgentChip: {
        backgroundColor: theme.colors.warning + '30',
    },
    urgentChipText: {
        color: theme.colors.warning,
    },
    warningChip: {
        backgroundColor: theme.colors.errorContainer,
    },
    warningChipText: {
        color: theme.colors.error,
    },
    bottomSpacer: {
        height: 24,
    },
});