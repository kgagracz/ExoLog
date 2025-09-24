import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
    Text,
    Card,
    Appbar,
    Button,
    Chip,
    Divider,
    List,
    ActivityIndicator,
    FAB,
    Portal,
    Menu
} from 'react-native-paper';
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";
import { Animal } from "../../types";

interface AnimalDetailsScreenProps {
    route: {
        params: {
            animalId: string;
        }
    };
    navigation: any;
}

const AnimalDetailsScreen: React.FC<AnimalDetailsScreenProps> = ({ route, navigation }) => {
    const { animalId } = route.params;
    const { getAnimal, getFeedingHistory } = useAnimals();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [feedingHistory, setFeedingHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        loadAnimalDetails();
    }, [animalId]);

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

    const handleEdit = () => {
        setMenuVisible(false);
        navigation.navigate('EditAnimal', { animalId });
    };

    const handleAddFeeding = () => {
        setMenuVisible(false);
        navigation.navigate('AddFeeding', { preSelectedAnimal: animalId });
    };

    const handleFeedingHistory = () => {
        setMenuVisible(false);
        navigation.navigate('FeedingHistory', { animalId });
    };

    const getStageCategory = (stage: number | null): string => {
        if (!stage) return 'Nieznane';
        if (stage <= 3) return 'Młode (L1-L3)';
        if (stage <= 6) return 'Juvenile (L4-L6)';
        if (stage <= 8) return 'Subadult (L7-L8)';
        return 'Adult (L9+)';
    };

    const getSexDisplay = (sex: string): string => {
        switch (sex) {
            case 'male': return '♂ Samiec';
            case 'female': return '♀ Samica';
            default: return 'Nieznana płeć';
        }
    };

    const calculateAge = (dateAcquired: string, dateOfBirth?: string): string => {
        const referenceDate = dateOfBirth ? new Date(dateOfBirth) : new Date(dateAcquired);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - referenceDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return `${diffDays} dni`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} miesięcy`;
        return `${Math.floor(diffDays / 365)} lat`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Szczegóły zwierzęcia" />
                </Appbar.Header>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Ładowanie szczegółów...</Text>
            </View>
        );
    }

    if (!animal) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Szczegóły zwierzęcia" />
                </Appbar.Header>
                <Text>Nie znaleziono zwierzęcia</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={animal.name} />
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Appbar.Action
                            icon="dots-vertical"
                            onPress={() => setMenuVisible(true)}
                        />
                    }
                >
                    <Menu.Item onPress={handleEdit} title="Edytuj" leadingIcon="pencil" />
                    <Menu.Item onPress={handleAddFeeding} title="Dodaj karmienie" leadingIcon="food-apple" />
                    <Menu.Item onPress={handleFeedingHistory} title="Historia karmienia" leadingIcon="history" />
                </Menu>
            </Appbar.Header>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Podstawowe informacje */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineSmall" style={styles.animalName}>
                            {animal.name}
                        </Text>
                        <Text variant="titleMedium" style={styles.species}>
                            {animal.species || 'Nieznany gatunek'}
                        </Text>

                        <View style={styles.chipContainer}>
                            <Chip icon="gender-male-female" style={styles.chip}>
                                {getSexDisplay(animal.sex)}
                            </Chip>
                            {animal.stage && (
                                <Chip icon="arrow-up-bold" style={styles.chip}>
                                    L{animal.stage} - {getStageCategory(animal.stage)}
                                </Chip>
                            )}
                            {animal.isAdult && (
                                <Chip icon="star" style={[styles.chip, styles.adultChip]}>
                                    Dorosły
                                </Chip>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                {/* Pomiary i wiek */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            📏 Pomiary i wiek
                        </Text>
                        <List.Item
                            title="Długość ciała"
                            description={animal.measurements?.length ? `${animal.measurements.length} cm` : 'Nie zmierzono'}
                            left={() => <List.Icon icon="ruler" />}
                        />
                        <List.Item
                            title="Wiek"
                            description={calculateAge(animal.dateAcquired, animal.dateOfBirth)}
                            left={() => <List.Icon icon="calendar" />}
                        />
                        <List.Item
                            title="Data nabycia"
                            description={new Date(animal.dateAcquired).toLocaleDateString('pl-PL')}
                            left={() => <List.Icon icon="calendar-plus" />}
                        />
                        {animal.dateOfBirth && (
                            <List.Item
                                title="Data urodzenia"
                                description={new Date(animal.dateOfBirth).toLocaleDateString('pl-PL')}
                                left={() => <List.Icon icon="cake" />}
                            />
                        )}
                    </Card.Content>
                </Card>

                {/* Terrarium */}
                {animal.housing && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                🏠 Terrarium
                            </Text>
                            <List.Item
                                title="Wymiary"
                                description={
                                    animal.housing.dimensions?.length && animal.housing.dimensions?.width && animal.housing.dimensions?.height
                                        ? `${animal.housing.dimensions.length} × ${animal.housing.dimensions.width} × ${animal.housing.dimensions.height} cm`
                                        : 'Nie określono'
                                }
                                left={() => <List.Icon icon="cube-outline" />}
                            />
                            <List.Item
                                title="Podłoże"
                                description={animal.housing.substrate || 'Nie określono'}
                                left={() => <List.Icon icon="layers" />}
                            />
                            {animal.housing.temperature?.day && (
                                <List.Item
                                    title="Temperatura"
                                    description={`${animal.housing.temperature.day}°C`}
                                    left={() => <List.Icon icon="thermometer" />}
                                />
                            )}
                            {animal.housing.humidity && (
                                <List.Item
                                    title="Wilgotność"
                                    description={`${animal.housing.humidity}%`}
                                    left={() => <List.Icon icon="water-percent" />}
                                />
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* Karmienie */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            🍽️ Karmienie
                        </Text>
                        <List.Item
                            title="Ostatnie karmienie"
                            description={
                                animal.feeding?.lastFed
                                    ? new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')
                                    : 'Nigdy nie karmione'
                            }
                            left={() => <List.Icon icon="food-apple" />}
                        />
                        <List.Item
                            title="Harmonogram"
                            description={animal.feeding?.schedule || 'Nie określono'}
                            left={() => <List.Icon icon="calendar-clock" />}
                        />
                        <List.Item
                            title="Preferowany pokarm"
                            description={animal.feeding?.foodType || 'Nie określono'}
                            left={() => <List.Icon icon="bug" />}
                        />

                        {feedingHistory.length > 0 && (
                            <>
                                <Divider style={styles.divider} />
                                <Text variant="titleSmall" style={styles.subsectionTitle}>
                                    Ostatnie karmienia
                                </Text>
                                {feedingHistory.slice(0, 3).map((feeding, index) => (
                                    <List.Item
                                        key={feeding.id}
                                        title={`${feeding.foodType} × ${feeding.quantity}`}
                                        description={new Date(feeding.date).toLocaleDateString('pl-PL')}
                                        left={() => <List.Icon icon="circle-small" />}
                                    />
                                ))}
                                {feedingHistory.length > 3 && (
                                    <Button
                                        mode="text"
                                        onPress={handleFeedingHistory}
                                        style={styles.moreButton}
                                    >
                                        Zobacz wszystkie ({feedingHistory.length})
                                    </Button>
                                )}
                            </>
                        )}
                    </Card.Content>
                </Card>

                {/* Zachowanie i temperament */}
                {animal.specificData && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                🕷️ Zachowanie
                            </Text>
                            <List.Item
                                title="Temperament"
                                description={animal.specificData.temperament || 'Nieznany'}
                                left={() => <List.Icon icon="emoticon-outline" />}
                            />
                            <List.Item
                                title="Typ sieci"
                                description={animal.specificData.webType || 'Nieznany'}
                                left={() => <List.Icon icon="web" />}
                            />
                            {animal.specificData.urticatingHairs !== undefined && (
                                <List.Item
                                    title="Włoski żądlące"
                                    description={animal.specificData.urticatingHairs ? 'Tak' : 'Nie'}
                                    left={() => <List.Icon icon="alert" />}
                                />
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* Notatki */}
                {animal.notes && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                📝 Notatki
                            </Text>
                            <Text variant="bodyMedium" style={styles.notesText}>
                                {animal.notes}
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Status zdrowia */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            ❤️ Status zdrowia
                        </Text>
                        <List.Item
                            title="Stan zdrowia"
                            description={animal.healthStatus || 'Nieznany'}
                            left={() => <List.Icon icon="heart-pulse" />}
                        />
                        <List.Item
                            title="Status aktywności"
                            description={animal.isActive ? 'Aktywne' : 'Nieaktywne'}
                            left={() => <List.Icon icon="power" />}
                        />
                    </Card.Content>
                </Card>

                {/* Spacer dla FAB */}
                <View style={styles.fabSpacer} />
            </ScrollView>

            {/* FAB do szybkich akcji */}
            <FAB
                icon="food-apple"
                style={styles.fab}
                onPress={handleAddFeeding}
                label="Nakarm"
            />
        </View>
    );
};

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
    card: {
        margin: 16,
        marginBottom: 8,
        backgroundColor: theme.colors.surface,
    },
    animalName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: 8,
    },
    species: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginBottom: 16,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
    },
    adultChip: {
        backgroundColor: theme.colors.tertiaryContainer,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    subsectionTitle: {
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 8,
    },
    divider: {
        marginVertical: 8,
    },
    moreButton: {
        alignSelf: 'flex-start',
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

export default AnimalDetailsScreen;