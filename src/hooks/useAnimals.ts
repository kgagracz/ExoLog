import { useState, useEffect, useCallback } from 'react';
import { getAnimals, addAnimal, getAnimalTemplate, updateAnimal, deleteAnimal } from '../services/firebase/firebaseService';

// Typy
interface Animal {
    id: string;
    name: string;
    species: string;
    type: 'tarantula' | 'scorpion' | 'other';
    dateAdded: Date;
    eventsCount: number;
    age: number; // w miesiącach
    imageUrl?: string;
    notes?: string;
    sex?: 'male' | 'female' | 'unknown';
    weight?: number; // w gramach
    legSpan?: number; // w centymetrach
}

interface AddAnimalFormData {
    name: string;
    species: string;
    type: 'tarantula' | 'scorpion' | 'other';
    age?: number;
    imageUrl?: string;
    notes?: string;
    sex?: 'male' | 'female' | 'unknown';
    weight?: number;
    legSpan?: number;
}

interface UpdateAnimalData extends Partial<Omit<Animal, 'id' | 'dateAdded'>> {}

interface UseAnimalsReturn {
    animals: Animal[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addNewAnimal: (animalData: AddAnimalFormData) => Promise<Animal>;
    updateExistingAnimal: (id: string, updates: UpdateAnimalData) => Promise<void>;
    removeAnimal: (id: string) => Promise<void>;
    getAnimalById: (id: string) => Animal | undefined;
    searchAnimals: (query: string) => Animal[];
    getAnimalsByType: (type: Animal['type']) => Animal[];
    getTotalCount: () => number;
    clearError: () => void;
}

// Hook Configuration
interface UseAnimalsConfig {
    enableAutoRefresh?: boolean;
    refreshInterval?: number; // w milisekundach
    enableOfflineMode?: boolean;
}

export const useAnimals = (config: UseAnimalsConfig = {}): UseAnimalsReturn => {
    const {
        enableAutoRefresh = false,
        refreshInterval = 30000, // 30 sekund
        enableOfflineMode = true,
    } = config;

    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Mock data - usuń gdy podłączysz Firebase
    const mockAnimals: Animal[] = [
        {
            id: '1',
            name: 'Aragog',
            species: 'Lasiodora parahybana',
            type: 'tarantula',
            dateAdded: new Date('2023-06-15'),
            eventsCount: 7,
            age: 12,
            sex: 'male',
            weight: 45,
            legSpan: 18,
            notes: 'Bardzo aktywny, lubi się pokazywać.',
        },
        {
            id: '2',
            name: 'Charlotte',
            species: 'Brachypelma hamorii',
            type: 'tarantula',
            dateAdded: new Date('2023-08-10'),
            eventsCount: 4,
            age: 8,
            sex: 'female',
            weight: 30,
            legSpan: 15,
            notes: 'Spokojna, często się chowa.',
        },
        {
            id: '3',
            name: 'Shelob',
            species: 'Theraphosa blondi',
            type: 'tarantula',
            dateAdded: new Date('2023-04-22'),
            eventsCount: 15,
            age: 18,
            sex: 'female',
            weight: 85,
            legSpan: 22,
            notes: 'Największa w kolekcji, bardzo ostrożna.',
        },
        {
            id: '4',
            name: 'Stinger',
            species: 'Pandinus imperator',
            type: 'scorpion',
            dateAdded: new Date('2023-09-05'),
            eventsCount: 2,
            age: 6,
            sex: 'male',
            weight: 15,
            notes: 'Skorpion cesarski, nocny tryb życia.',
        },
    ];

    // Funkcja ładująca dane
    const loadAnimals = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            // Uncomment when Firebase is ready:
            // const animalsData = await getAnimals();
            // setAnimals(animalsData);

            // Mock implementation - simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Simulate potential error (5% chance)
            if (Math.random() < 0.05 && !enableOfflineMode) {
                throw new Error('Network error: Failed to load animals');
            }

            setAnimals(mockAnimals);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error loading animals:', err);

            // Offline mode fallback
            if (enableOfflineMode && animals.length === 0) {
                setAnimals(mockAnimals);
                setError('Offline mode: Showing cached data');
            }
        } finally {
            setLoading(false);
        }
    }, [enableOfflineMode, animals.length]);

    // Funkcja dodająca nowe zwierzę
    const addNewAnimal = useCallback(async (animalData: AddAnimalFormData): Promise<Animal> => {
        try {
            setError(null);

            const template = getAnimalTemplate(animalData.type);
            const newAnimalData = {
                ...template,
                ...animalData,
            };

            // Uncomment when Firebase is ready:
            // const result = await addAnimal(newAnimalData);
            // const newAnimal = { ...newAnimalData, ...result };

            // Mock implementation
            const newAnimal: Animal = {
                ...newAnimalData,
                id: `mock_${Date.now()}`,
                dateAdded: new Date(),
                eventsCount: 0,
                age: animalData.age || 0,
            };

            setAnimals(prev => [...prev, newAnimal]);
            return newAnimal;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add animal';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // Funkcja aktualizująca zwierzę
    const updateExistingAnimal = useCallback(async (id: string, updates: UpdateAnimalData): Promise<void> => {
        try {
            setError(null);

            // Uncomment when Firebase is ready:
            // await updateAnimal(id, updates);

            // Mock implementation
            setAnimals(prev =>
                prev.map(animal =>
                    animal.id === id ? { ...animal, ...updates } : animal
                )
            );

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update animal';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // Funkcja usuwająca zwierzę
    const removeAnimal = useCallback(async (id: string): Promise<void> => {
        try {
            setError(null);

            // Uncomment when Firebase is ready:
            // await deleteAnimal(id);

            // Mock implementation
            setAnimals(prev => prev.filter(animal => animal.id !== id));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete animal';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // Funkcja znajdująca zwierzę po ID
    const getAnimalById = useCallback((id: string): Animal | undefined => {
        return animals.find(animal => animal.id === id);
    }, [animals]);

    // Funkcja wyszukująca zwierzęta
    const searchAnimals = useCallback((query: string): Animal[] => {
        if (!query.trim()) return animals;

        const lowercaseQuery = query.toLowerCase().trim();
        return animals.filter(animal =>
            animal.name.toLowerCase().includes(lowercaseQuery) ||
            animal.species.toLowerCase().includes(lowercaseQuery) ||
            animal.notes?.toLowerCase().includes(lowercaseQuery)
        );
    }, [animals]);

    // Funkcja filtrująca po typie
    const getAnimalsByType = useCallback((type: Animal['type']): Animal[] => {
        return animals.filter(animal => animal.type === type);
    }, [animals]);

    // Funkcja zwracająca liczbę zwierząt
    const getTotalCount = useCallback((): number => {
        return animals.length;
    }, [animals]);

    // Funkcja czyszcząca error
    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    // Auto-refresh setup
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (enableAutoRefresh && refreshInterval > 0) {
            intervalId = setInterval(() => {
                if (!loading) {
                    loadAnimals();
                }
            }, refreshInterval);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [enableAutoRefresh, refreshInterval, loading, loadAnimals]);

    // Initial load
    useEffect(() => {
        loadAnimals();
    }, [loadAnimals]);

    return {
        animals,
        loading,
        error,
        refresh: loadAnimals,
        addNewAnimal,
        updateExistingAnimal,
        removeAnimal,
        getAnimalById,
        searchAnimals,
        getAnimalsByType,
        getTotalCount,
        clearError,
    };
};
