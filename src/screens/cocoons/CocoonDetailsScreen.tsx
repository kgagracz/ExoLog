import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Card, Button, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import { useEvents } from "../../hooks/useEvents";
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import { CocoonEvent } from "../../types/events";
import { Animal } from "../../types";

export default function CocoonDetailsScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { cocoonId, animalId } = route.params;

    const { getCocoonHistory, updateCocoonStatus } = useEvents();
    const { getAnimal } = useAnimals();

    const [cocoon, setCocoon] = useState<CocoonEvent | null>(null);
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [cocoonId, animalId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Pobierz dane zwierzęcia
            const animalResult = await getAnimal(animalId);
            if (animalResult.success && animalResult.data) {
                setAnimal(animalResult.data);
            }

            // Pobierz dane kokonu
            const cocoonsResult = await getCocoonHistory(animalId, 20);
            if (cocoonsResult.success && cocoonsResult.data) {
                const foundCocoon = cocoonsResult.data.find(c => c.id === cocoonId);
                if (foundCocoon) {
                    setCocoon(foundCocoon);
                }
            }
        } catch (error) {
            console.error('Error loading cocoon data:', error);
            Alert.alert('Błąd', 'Nie udało się załadować danych kokonu');
        } finally {
            setLoading(false);
        }
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

    const getWeeksSinceLaid = (date: string): number => {
        const days = getDaysSinceLaid(date);
        return Math.floor(days / 7);
    };

    const handleOpenCocoon = () => {
        navigation.navigate('OpenCocoon', {
            cocoonId,
            animalId,
            animalName: animal?.name,
            species: animal?.species,
        });
    };

    const handleMarkAsFailed = () => {
        Alert.alert(
            'Oznacz jako nieudany',
            'Czy na pewno chcesz oznaczyć ten kokon jako nieudany? Ta operacja jest nieodwracalna.',
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Oznacz',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await updateCocoonStatus(cocoonId, 'failed');
                        if (result.success) {
                            Alert.alert('Sukces', 'Kokon oznaczony jako nieudany.');
                            navigation.goBack();
                        } else {
                            Alert.alert('Błąd', 'Nie udało się zaktualizować statusu kokonu.');
                        }
                    }
                }
            ]
        );
    };

    const handleChangeToIncubating = async () => {
        const result = await updateCocoonStatus(cocoonId, 'incubating');
        if (result.success) {
            loadData();
        } else {
            Alert.alert('Błąd', 'Nie udało się zaktualizować statusu kokonu.');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Szczegóły kokonu" />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    if (!cocoon) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Szczegóły kokonu" />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <Text>Nie znaleziono kokonu</Text>
                </View>
            </View>
        );
    }

    const daysSinceLaid = getDaysSinceLaid(cocoon.date);
    const weeksSinceLaid = getWeeksSinceLaid(cocoon.date);
    const daysUntilHatch = getDaysUntilHatch(cocoon.eventData?.estimatedHatchDate);

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Szczegóły kokonu" />
            </Appbar.Header>

            <ScrollView style={styles.content}>
                {/* Informacje o samicy */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            🕷️ Samica
                        </Text>
                        <Text variant="headlineSmall" style={styles.animalName}>
                            {animal?.name || 'Nieznana'}
                        </Text>
                        <Text variant="bodyLarge" style={styles.speciesName}>
                            {animal?.species || ''}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Status kokonu */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            📊 Status
                        </Text>

                        <View style={styles.statusContainer}>
                            {cocoon.eventData?.cocoonStatus === 'laid' && (
                                <Chip icon="egg" style={styles.statusChip} textStyle={styles.statusChipText}>
                                    Złożony
                                </Chip>
                            )}
                            {cocoon.eventData?.cocoonStatus === 'incubating' && (
                                <Chip icon="thermometer" style={styles.incubatingChip} textStyle={styles.incubatingChipText}>
                                    W inkubacji
                                </Chip>
                            )}
                        </View>

                        {cocoon.eventData?.cocoonStatus === 'laid' && (
                            <Button
                                mode="outlined"
                                onPress={handleChangeToIncubating}
                                style={styles.statusButton}
                                icon="thermometer"
                            >
                                Zmień na inkubację
                            </Button>
                        )}
                    </Card.Content>
                </Card>

                {/* Daty i czas */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            📅 Harmonogram
                        </Text>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium" style={styles.infoLabel}>
                                Data złożenia:
                            </Text>
                            <Text variant="bodyLarge" style={styles.infoValue}>
                                {new Date(cocoon.date).toLocaleDateString('pl-PL')}
                            </Text>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium" style={styles.infoLabel}>
                                Dni od złożenia:
                            </Text>
                            <Text variant="headlineMedium" style={styles.daysValue}>
                                {daysSinceLaid}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium" style={styles.infoLabel}>
                                Tygodnie od złożenia:
                            </Text>
                            <Text variant="titleLarge" style={styles.weeksValue}>
                                {weeksSinceLaid}
                            </Text>
                        </View>

                        {cocoon.eventData?.estimatedHatchDate && (
                            <>
                                <Divider style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <Text variant="bodyMedium" style={styles.infoLabel}>
                                        Przewidywany wylęg:
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.infoValue}>
                                        {new Date(cocoon.eventData.estimatedHatchDate).toLocaleDateString('pl-PL')}
                                    </Text>
                                </View>

                                {daysUntilHatch !== null && (
                                    <View style={styles.infoRow}>
                                        <Text variant="bodyMedium" style={styles.infoLabel}>
                                            Pozostało dni:
                                        </Text>
                                        <Text variant="headlineMedium" style={[
                                            styles.daysValue,
                                            daysUntilHatch <= 0 && styles.overdueValue,
                                            daysUntilHatch > 0 && daysUntilHatch <= 7 && styles.urgentValue,
                                        ]}>
                                            {daysUntilHatch <= 0 ? 'Termin minął!' : daysUntilHatch}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </Card.Content>
                </Card>

                {/* Notatki */}
                {cocoon.description && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                📝 Notatki
                            </Text>
                            <Text variant="bodyMedium" style={styles.notesText}>
                                {cocoon.description}
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Przyciski akcji */}
                <View style={styles.actionsContainer}>
                    <Button
                        mode="contained"
                        onPress={handleOpenCocoon}
                        icon="egg-easter"
                        style={styles.openButton}
                        contentStyle={styles.openButtonContent}
                    >
                        Otwórz kokon
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={handleMarkAsFailed}
                        icon="close-circle"
                        textColor={theme.colors.error}
                        style={styles.failButton}
                    >
                        Oznacz jako nieudany
                    </Button>
                </View>

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
    content: {
        flex: 1,
    },
    card: {
        margin: 16,
        marginBottom: 0,
        backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 12,
    },
    animalName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    speciesName: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statusChip: {
        backgroundColor: theme.colors.events.cocoon.background,
    },
    statusChipText: {
        color: theme.colors.events.cocoon.color,
    },
    incubatingChip: {
        backgroundColor: theme.colors.primaryContainer,
    },
    incubatingChipText: {
        color: theme.colors.primary,
    },
    statusButton: {
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        color: theme.colors.onSurfaceVariant,
    },
    infoValue: {
        color: theme.colors.onSurface,
        fontWeight: '500',
    },
    daysValue: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    weeksValue: {
        color: theme.colors.primary,
    },
    urgentValue: {
        color: theme.colors.warning,
    },
    overdueValue: {
        color: theme.colors.error,
    },
    divider: {
        marginVertical: 8,
    },
    notesText: {
        color: theme.colors.onSurface,
        lineHeight: 22,
    },
    actionsContainer: {
        padding: 16,
        gap: 12,
    },
    openButton: {
        backgroundColor: theme.colors.events.cocoon.color,
    },
    openButtonContent: {
        paddingVertical: 8,
    },
    failButton: {
        borderColor: theme.colors.error,
    },
    bottomSpacer: {
        height: 24,
    },
});