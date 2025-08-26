import React, {useState, useEffect, JSX} from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ListRenderItem,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Layout from '../../components/Layout/Layout';
import { useTheme } from '../../context/ThemeContext';
import { getAnimals, addAnimal, getAnimalTemplate } from '../../services/firebase/firebaseService';
import { Theme } from '../../theme/themes';

// Typy dla zwierząt
interface Animal {
    id: string;
    name: string;
    species: string;
    type: 'tarantula' | 'scorpion' | 'other';
    dateAdded: Date;
    eventsCount: number;
    age: number; // w miesiącach
}

interface AnimalsListScreenProps {
    navigation?: any; // Dodaj właściwy typ nawigacji jeśli używasz React Navigation
}

const AnimalsListScreen: React.FC<AnimalsListScreenProps> = ({ navigation }) => {
    const {theme} = useTheme();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const styles = createStyles(theme);

    // Ładowanie listy zwierząt
    useEffect(() => {
        loadAnimals();
    }, []);

    const loadAnimals = async (): Promise<void> => {
        try {
            setLoading(true);
            // const animalsData = await getAnimals();
            // setAnimals(animalsData);

            // Tymczasowe dane mock dla demonstracji
            const mockAnimals: Animal[] = [
                {
                    id: '1',
                    name: 'Aragog',
                    species: 'Lasiodora parahybana',
                    type: 'tarantula',
                    dateAdded: new Date(),
                    eventsCount: 7,
                    age: 12,
                },
                {
                    id: '2',
                    name: 'Charlotte',
                    species: 'Brachypelma hamorii',
                    type: 'tarantula',
                    dateAdded: new Date(),
                    eventsCount: 4,
                    age: 8,
                },
                {
                    id: '3',
                    name: 'Shelob',
                    species: 'Theraphosa blondi',
                    type: 'tarantula',
                    dateAdded: new Date(),
                    eventsCount: 15,
                    age: 18,
                },
            ];

            setAnimals(mockAnimals);
        } catch (error) {
            console.error('Error loading animals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnimal = async (): Promise<void> => {
        try {
            const newTarantula = getAnimalTemplate("tarantula");
            newTarantula.name = "Nowy Ptasznik";
            newTarantula.species = "Gatunek do określenia";

            // await addAnimal(newTarantula);
            console.log('Dodawanie nowego ptasznika:', newTarantula);

            // Tymczasowo dodaj do lokalnej listy
            const newAnimal: Animal = {
                ...newTarantula,
                id: Date.now().toString(),
                dateAdded: new Date(),
                eventsCount: 0,
                age: 0,
                type: 'tarantula',
            };
            setAnimals(prev => [...prev, newAnimal]);
        } catch (error) {
            console.error('Error adding animal:', error);
        }
    };

    const handleAnimalPress = (animal: Animal): void => {
        // navigation?.navigate('AnimalDetail', { animalId: animal.id });
        console.log('Przejście do szczegółów:', animal.name);
    };

    const filteredAnimals = animals.filter(animal =>
        animal.name.toLowerCase().includes(searchText.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderAnimalCard: ListRenderItem<Animal> = ({item}) => (
        <TouchableOpacity
            style={styles.animalCard}
            onPress={() => handleAnimalPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.animalHeader}>
                <View style={styles.animalInfo}>
                    <Text style={styles.animalName}>{item.name}</Text>
                    <Text style={styles.animalSpecies}>{item.species}</Text>
                </View>
                <View style={styles.animalAvatar}>
                    <Text style={styles.animalEmoji}>🕷️</Text>
                </View>
            </View>

            <View style={styles.animalStats}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.age}</Text>
                    <Text style={styles.statLabel}>miesięcy</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.eventsCount}</Text>
                    <Text style={styles.statLabel}>wydarzeń</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = (): JSX.Element => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🕷️</Text>
            <Text style={styles.emptyStateTitle}>Brak ptaszników</Text>
            <Text style={styles.emptyStateDescription}>
                Dodaj swojego pierwszego ptasznika, aby rozpocząć zarządzanie hodowlą
            </Text>
        </View>
    );

    const renderLoadingState = (): JSX.Element => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator
                size="large"
                color={theme.colors.primary}
            />
            <Text style={styles.loadingText}>Ładowanie ptaszników...</Text>
        </View>
    );

    const renderSeparator = () => <View style={styles.separator} />;

    const keyExtractor = (item: Animal): string => item.id;

    // Pokazuj loading state gdy ładuje dane
    if (loading && animals.length === 0) {
        return (
            <Layout
                title="🕷️ Moje Ptaszniki"
                showAddButton={true}
                onAddPress={handleAddAnimal}
                scrollable={false}
            >
                {renderLoadingState()}
            </Layout>
        );
    }

    return (
        <Layout
            title="🕷️ Moje Ptaszniki"
            showAddButton={true}
            onAddPress={handleAddAnimal}
            scrollable={false} // Używamy FlatList zamiast ScrollView
        >
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Szukaj ptaszników..."
                    placeholderTextColor={theme.colors.textLight}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {/* Animals List */}
            <FlatList
                data={filteredAnimals}
                renderItem={renderAnimalCard}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={renderSeparator}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={[
                    styles.flatListContent,
                    filteredAnimals.length === 0 && { flex: 1 }
                ]}
                showsVerticalScrollIndicator={false}
                onRefresh={loadAnimals}
                refreshing={loading && animals.length > 0}
                removeClippedSubviews={true} // Optymalizacja wydajności
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={8}
            />
        </Layout>
    );
};

// Style components
const createStyles = (theme: Theme) => StyleSheet.create({
    // Container dla paska wyszukiwania
    searchContainer: {
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.small,
        backgroundColor: theme.colors.backgroundSecondary,
    },

    // Input wyszukiwania
    searchInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.medium,
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.small + 2, // 10px
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
        // Platform specific adjustments
        ...Platform.select({
            ios: {
                paddingVertical: theme.spacing.medium - 2, // 14px on iOS for better visual alignment
            },
            android: {
                paddingVertical: theme.spacing.small + 2, // 10px on Android
            },
        }),
    },

    // Karta pojedynczego zwierzęcia
    animalCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.medium,
        marginHorizontal: theme.spacing.medium,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },

    // Header karty (nazwa, gatunek i avatar)
    animalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.small + 2, // 10px
    },

    // Kontener informacji o zwierzęciu
    animalInfo: {
        flex: 1,
        marginRight: theme.spacing.small,
    },

    // Nazwa zwierzęcia
    animalName: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginBottom: 3,
        letterSpacing: 0.3,
    },

    // Gatunek zwierzęcia
    animalSpecies: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.tight,
    },

    // Avatar zwierzęcia (okrągły kontener z emoji)
    animalAvatar: {
        width: theme.sizes.avatar.large,
        height: theme.sizes.avatar.large,
        borderRadius: theme.sizes.avatar.large / 2,
        backgroundColor: theme.colors.primary + '15', // 15% opacity
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary + '30', // 30% opacity
    },

    // Emoji w avatarze
    animalEmoji: {
        fontSize: 24,
        lineHeight: 28, // Lepsze wyśrodkowanie emoji
    },

    // Kontener ze statystykami
    animalStats: {
        flexDirection: 'row',
        marginTop: theme.spacing.small,
        gap: theme.spacing.small,
    },

    // Pojedyncza statystyka
    stat: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
        padding: theme.spacing.small,
        borderRadius: theme.borderRadius.medium,
        alignItems: 'center',
        minHeight: 50, // Zapewnia jednolity wygląd
    },

    // Wartość statystyki (liczba)
    statValue: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },

    // Label statystyki (opis)
    statLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontWeight: theme.typography.fontWeight.medium,
    },

    // Stan pusty - główny kontener
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.large,
        paddingVertical: theme.spacing.xl + theme.spacing.large, // 56px
        minHeight: 300, // Minimum height for better UX
    },

    // Emoji w stanie pustym
    emptyStateEmoji: {
        fontSize: 80,
        marginBottom: theme.spacing.large,
        opacity: 0.7,
    },

    // Tytuł stanu pustego
    emptyStateTitle: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.small + 2, // 10px
        textAlign: 'center',
    },

    // Opis stanu pustego
    emptyStateDescription: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
        maxWidth: 280, // Ogranicza szerokość tekstu dla lepszej czytelności
    },

    // Dodatkowe style dla FlatList
    flatListContent: {
        paddingBottom: theme.spacing.large, // Extra padding na dole listy
    },

    // Style dla separatora między elementami
    separator: {
        height: theme.spacing.xs,
    },

    // Style dla stanu ładowania
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },

    loadingText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.medium,
        fontWeight: theme.typography.fontWeight.medium,
    },
});

export default AnimalsListScreen;