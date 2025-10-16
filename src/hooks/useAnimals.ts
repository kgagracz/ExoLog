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

    // Dodaj wiele zwierząt jednocześnie
    const addMultipleAnimals = async (
        baseAnimalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'name'>,
        quantity: number,
        namePrefix: string
    ) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        if (quantity < 1 || quantity > 999) {
            return { success: false, error: 'Quantity must be between 1 and 999' };
        }

        try {
            const results: string[] = [];
            const errors: Array<{ name: string; error: string }> = [];

            // Dodaj zwierzęta w pętli
            for (let i = 0; i < quantity; i++) {
                const animalName = `${namePrefix}-${i + 1}`;

                const animalData = {
                    ...baseAnimalData,
                    name: animalName,
                    userId: user.uid
                };

                const body = removeUndefinedDeep(animalData);
                const result = await animalsService.add(body);

                if (result.success) {
                    results.push(animalName);
                } else {
                    errors.push({
                        name: animalName,
                        error: result.error || 'Unknown error'
                    });
                }
            }

            // Odśwież listę po zakończeniu
            await loadAnimals();

            // Zwróć podsumowanie
            if (errors.length === 0) {
                return {
                    success: true,
                    data: {
                        names: results,
                        count: results.length,
                        failed: 0
                    }
                };
            } else if (results.length > 0) {
                // Częściowy sukces
                return {
                    success: true,
                    data: {
                        names: results,
                        count: results.length,
                        failed: errors.length,
                        errors: errors
                    }
                };
            } else {
                // Całkowita porażka
                return {
                    success: false,
                    error: `Failed to add all animals. Errors: ${errors.map(e => `${e.name}: ${e.error}`).join(', ')}`
                };
            }
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
            userId: user.uid,
            categoryId: 'temp-category-id',
            animalTypeId: 'temp-type-id',
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

    // Usuń zwierzę (deaktywacja)
    const removeAnimal = async (animalId: string) => {
        try {
            const result = await animalsService.deactivate(animalId);

            if (result.success) {
                await loadAnimals();
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Usuń zwierzę na stałe
    const deleteAnimal = async (animalId: string) => {
        try {
            const result = await animalsService.deleteAnimal(animalId);

            if (result.success) {
                await loadAnimals();
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Usuń zwierzę kompletnie (wraz z historią)
    const deleteAnimalCompletely = async (animalId: string) => {
        try {
            const result = await animalsService.deleteAnimalCompletely(animalId);

            if (result.success) {
                await loadAnimals();
                return {
                    success: true,
                    deletedRecords: result.deletedRecords
                };
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
                await loadAnimals();
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

    // ================== FUNKCJE KARMIENIA ==================

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
                await loadAnimals();
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

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
                await loadAnimals();
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const getFeedingHistory = async (animalId: string) => {
        try {
            const result = await animalsService.getFeedingHistory(animalId);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

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

    const deleteFeedingRecord = async (feedingId: string, animalId: string) => {
        try {
            const result = await animalsService.deleteFeedingRecord(feedingId, animalId);

            if (result.success) {
                await loadAnimals();
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

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

    // Statystyki
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
        addMultipleAnimals,
        updateAnimal,
        getAnimal,
        getAnimalsByCategory,
        deleteAnimal,
        deleteAnimalCompletely,
        refetch: loadAnimals,

        // Funkcje karmienia
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