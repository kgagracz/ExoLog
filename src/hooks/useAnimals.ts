import { useState, useEffect, useCallback } from 'react';
import { animalsService } from "../services/firebase";
import { Animal } from "../types";
import { useAuth } from './useAuth';
import { removeUndefined, removeUndefinedDeep } from "../utils/objectService";

// Typy dla karmienia (z serwisu)
interface FeedingData {
    animalId: string;
    foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
    foodSize: 'small' | 'medium' | 'large';
    quantity: number;
    date: string;
    notes?: string;
    userId: string;
}

interface BulkFeedingData {
    animalIds: string[];
    foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
    foodSize: 'small' | 'medium' | 'large';
    quantity: number;
    date: string;
    notes?: string;
    userId: string;
}

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

    // ================== NOWE FUNKCJE KARMIENIA ==================

    /**
     * Nakarm pojedyncze zwierzę
     */
    const feedAnimal = async (feedingData: Omit<FeedingData, 'userId'>) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const result = await animalsService.feedAnimal({
                ...feedingData,
                userId: user.uid
            });

            if (result.success) {
                await loadAnimals(); // Odśwież listę zwierząt
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Nakarm wiele zwierząt jednocześnie
     */
    const feedMultipleAnimals = async (bulkFeedingData: Omit<BulkFeedingData, 'userId'>) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const result = await animalsService.feedMultipleAnimals({
                ...bulkFeedingData,
                userId: user.uid
            });

            if (result.success) {
                await loadAnimals(); // Odśwież listę zwierząt
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Pobierz historię karmienia dla zwierzęcia
     */
    const getFeedingHistory = async (animalId: string) => {
        try {
            const result = await animalsService.getFeedingHistory(animalId);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Pobierz wszystkie karmienia użytkownika
     */
    const getUserFeedings = async (limit?: number) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const result = await animalsService.getUserFeedings(user.uid, limit);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Usuń rekord karmienia
     */
    const deleteFeedingRecord = async (feedingId: string, animalId: string) => {
        try {
            const result = await animalsService.deleteFeedingRecord(feedingId, animalId);

            if (result.success) {
                await loadAnimals(); // Odśwież listę zwierząt
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Pobierz zwierzęta wymagające karmienia
     */
    const getAnimalsDueForFeeding = async (daysSinceLastFeeding: number = 7) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const result = await animalsService.getAnimalsDueForFeeding(user.uid, daysSinceLastFeeding);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Szybka funkcja do nakarmienia wybranych zwierząt z podstawowymi parametrami
     */
    const quickFeed = async (
        animalIds: string[],
        foodType: FeedingData['foodType'] = 'cricket',
        quantity: number = 1,
        notes?: string
    ) => {
        const feedingData = {
            animalIds,
            foodType,
            foodSize: 'medium' as const,
            quantity,
            date: new Date().toISOString().split('T')[0],
            notes: notes || `Szybkie karmienie - ${foodType} x${quantity}`
        };

        if (animalIds.length === 1) {
            return await feedAnimal({
                animalId: animalIds[0],
                ...feedingData
            });
        } else {
            return await feedMultipleAnimals(feedingData);
        }
    };

    // Załaduj dane przy pierwszym renderze lub zmianie użytkownika
    useEffect(() => {
        loadAnimals();
    }, [loadAnimals]);

    // Statystyki (rozszerzone o informacje o karmieniu)
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
        }).length,
        // Nowe statystyki karmienia
        feeding: {
            fedToday: animals.filter(animal => {
                const today = new Date().toISOString().split('T')[0];
                return animal.feeding?.lastFed === today;
            }).length,
            fedThisWeek: animals.filter(animal => {
                if (!animal.feeding?.lastFed) return false;
                const lastFed = new Date(animal.feeding.lastFed);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastFed > weekAgo;
            }).length,
            neverFed: animals.filter(animal => !animal.feeding?.lastFed).length,
            dueForFeeding: animals.filter(animal => {
                if (!animal.feeding?.lastFed) return true;
                const lastFed = new Date(animal.feeding.lastFed);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastFed <= weekAgo;
            }).length
        }
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

        // Funkcje zarządzania zwierzętami
        addAnimal,
        updateAnimal,
        getAnimal,
        getAnimalsByCategory,
        refetch: loadAnimals,

        // NOWE: Funkcje karmienia
        feedAnimal,
        feedMultipleAnimals,
        getFeedingHistory,
        getUserFeedings,
        deleteFeedingRecord,
        getAnimalsDueForFeeding,
        quickFeed,

        // Pomocnicze
        reload: loadAnimals,
        clearError: () => setError(null),

        // Status uwierzytelnienia
        isAuthenticated,
        currentUser: user
    };
};