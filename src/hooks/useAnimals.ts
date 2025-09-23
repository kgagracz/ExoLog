import { useState, useEffect, useCallback } from 'react';
import { animalsService } from "../services/firebase";
import { Animal } from "../types";
import { useAuth } from './useAuth';
import {removeUndefined, removeUndefinedDeep} from "../utils/objectService";

export const useAnimals = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user, isAuthenticated } = useAuth();

    // Załaduj zwierzęta
    const loadAnimals = useCallback(async () => {
        if (!user || !isAuthenticated) {
            setAnimals([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await animalsService.getUserAnimals(user.uid);

            if (result.success && result.data) {
                setAnimals(result.data);
            } else {
                setError(result.error || 'Failed to load animals');
                setAnimals([]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load animals');
            setAnimals([]);
        } finally {
            setLoading(false);
        }
    }, [user, isAuthenticated]);

    // Dodaj nowe zwierzę
    const addAnimal = async (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const body = removeUndefinedDeep(animalData)
            const result = await animalsService.add({
                ...body,
                userId: user.uid
            });

            if (result.success) {
                await loadAnimals(); // Odśwież listę
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Funkcja addNewAnimal używana w screen
    const addNewAnimal = async (basicData: {
        name: string;
        species: string;
        type: 'tarantula' | 'scorpion' | 'other';
        age: number;
    }) => {
        if (!user || !isAuthenticated) {
            throw new Error('User not authenticated');
        }

        // Mapuj podstawowe dane na pełną strukturę Animal
        const fullAnimalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: user.uid, // PRAWDZIWY USER ID
            categoryId: 'temp-category-id', // Będzie zastąpione prawdziwym ID
            animalTypeId: 'temp-type-id', // Będzie zastąpione prawdziwym ID
            name: basicData.name,
            species: basicData.species,
            sex: 'unknown',
            stage: basicData.age === 0 ? 'baby' : 'adult',
            dateAcquired: new Date().toISOString().split('T')[0],
            measurements: {
                lastMeasured: new Date().toISOString().split('T')[0]
            },
            specificData: {
                webType: basicData.type === 'tarantula' ? 'minimal' : undefined,
                temperament: 'unknown'
            },
            healthStatus: 'healthy',
            isActive: true,
            housing: {
                type: 'terrarium',
                dimensions: {},
                accessories: []
            },
            feeding: {
                schedule: 'weekly',
                foodType: basicData.type === 'tarantula' ? 'cricket' : 'unknown'
            },
            photos: [],
            notes: `Dodano automatycznie: ${basicData.name}`,
            behavior: 'unknown',
            tags: [basicData.type],
            veterinary: {
                vaccinations: [],
                medications: [],
                allergies: []
            }
        };

        const result = await addAnimal(fullAnimalData);

        if (!result.success) {
            throw new Error(result.error || 'Failed to add animal');
        }

        return result;
    };

    // Usuń zwierzę
    const removeAnimal = async (animalId: string) => {
        try {
            const result = await animalsService.deactivate(animalId);

            if (result.success) {
                await loadAnimals(); // Odśwież listę
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Refresh - alias dla loadAnimals używany w screen
    const refresh = useCallback(async () => {
        await loadAnimals();
    }, [loadAnimals]);

    // Aktualizuj zwierzę
    const updateAnimal = async (animalId: string, updates: Partial<Animal>) => {
        try {
            const result = await animalsService.update(animalId, updates);

            if (result.success) {
                await loadAnimals(); // Odśwież listę
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Pobierz jedno zwierzę
    const getAnimal = async (animalId: string) => {
        try {
            const result = await animalsService.getById(animalId);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Pobierz zwierzęta według kategorii
    const getAnimalsByCategory = async (categoryId: string) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const result = await animalsService.getByCategory(user.uid, categoryId);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Załaduj dane przy pierwszym renderze lub zmianie użytkownika
    useEffect(() => {
        loadAnimals();
    }, [loadAnimals]);

    // Statystyki (przydatne dla dashboard)
    const stats = {
        total: animals.length,
        active: animals.filter(animal => animal.isActive).length,
        byType: animals.reduce((acc, animal) => {
            const type = animal.specificData?.webType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        byHealthStatus: animals.reduce((acc, animal) => {
            acc[animal.healthStatus] = (acc[animal.healthStatus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        recentlyAdded: animals.filter(animal => {
            const addedDate = new Date(animal.dateAcquired);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return addedDate > weekAgo;
        }).length
    };

    return {
        // Dane
        animals,
        loading,
        error,
        stats,

        // Funkcje używane w AnimalsListScreen
        addNewAnimal,
        removeAnimal,
        refresh,

        // Dodatkowe funkcje
        addAnimal,
        updateAnimal,
        getAnimal,
        getAnimalsByCategory,
        refetch: loadAnimals,

        // Pomocnicze
        reload: loadAnimals,
        clearError: () => setError(null),

        // Status uwierzytelnienia
        isAuthenticated,
        currentUser: user
    };
};