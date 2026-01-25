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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
        }
    };

    // Interfejs danych dla addSpider
    interface SpiderData {
        name?: string;
        species: string;
        sex?: 'male' | 'female' | 'unknown';
        stage?: 'baby' | 'juvenile' | 'subadult' | 'adult';
        currentStage?: number; // L1-L9
        dateAcquired?: string;
        dateOfBirth?: string;
        notes?: string;
        // Opcjonalne szczegóły
        weight?: number;
        bodyLength?: number;
        temperament?: string;
        // Terrarium
        terrariumLength?: number;
        terrariumWidth?: number;
        terrariumHeight?: number;
        substrate?: string;
        temperature?: number;
        humidity?: number;
        // Karmienie
        feedingSchedule?: string;
        foodType?: string;
        // Powiązania (dla potomstwa)
        parentFemaleId?: string;
        cocoonId?: string;
    }

    // Uniwersalna funkcja dodawania pająka
    const addSpider = async (spiderData: SpiderData) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            // Znajdź kategorię i typ
            const arachnidsCategory = 'tsXnqoMTNElLOrIplWhn'; // ID kategorii arachnids
            const tarantulaType = 'E2VPLNh0lSYNxQuzJvS8'; // ID typu tarantula

            // Przygotuj pełne dane zwierzęcia
            const fullAnimalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.uid,
                categoryId: arachnidsCategory,
                animalTypeId: tarantulaType,
                name: spiderData.name || spiderData.species,
                species: spiderData.species,
                sex: spiderData.sex || 'unknown',
                stage: spiderData.stage || 'baby',
                dateAcquired: spiderData.dateAcquired || new Date().toISOString().split('T')[0],
                dateOfBirth: spiderData.dateOfBirth,
                measurements: {
                    weight: spiderData.weight,
                    length: spiderData.bodyLength,
                    lastMeasured: new Date().toISOString().split('T')[0],
                },
                specificData: {
                    currentStage: spiderData.currentStage || 1,
                    webType: 'minimal',
                    urticatingHairs: false,
                    temperament: spiderData.temperament || 'unknown',
                    legSpan: spiderData.bodyLength,
                    parentFemaleId: spiderData.parentFemaleId,
                    cocoonId: spiderData.cocoonId,
                },
                healthStatus: 'healthy',
                isActive: true,
                housing: {
                    type: 'terrarium',
                    dimensions: {
                        length: spiderData.terrariumLength,
                        width: spiderData.terrariumWidth,
                        height: spiderData.terrariumHeight,
                    },
                    substrate: spiderData.substrate || 'coconut_fiber',
                    temperature: {
                        day: spiderData.temperature,
                    },
                    humidity: spiderData.humidity,
                    accessories: [],
                },
                feeding: {
                    schedule: spiderData.feedingSchedule || 'weekly',
                    foodType: spiderData.foodType || 'cricket',
                },
                photos: [],
                notes: spiderData.notes || '',
                behavior: spiderData.temperament || 'unknown',
                tags: ['tarantula'],
                veterinary: {
                    vaccinations: [],
                    medications: [],
                    allergies: [],
                },
            };

            const result = await addAnimal(fullAnimalData);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Dodaj wiele pająków (np. z kokonu)
    const addMultipleSpiders = async (
        baseSpiderData: Omit<SpiderData, 'name'>,
        quantity: number,
        nameGenerator: (index: number, total: number) => string
    ) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated', added: 0, failed: 0 };
        }

        const results: string[] = [];
        const errors: Array<{ name: string; error: string }> = [];

        for (let i = 1; i <= quantity; i++) {
            const spiderName = nameGenerator(i, quantity);

            const result = await addSpider({
                ...baseSpiderData,
                name: spiderName,
            });

            if (result.success) {
                results.push(spiderName);
            } else {
                errors.push({ name: spiderName, error: result.error || 'Unknown error' });
            }

            // Przerwa co 10 pająków
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return {
            success: errors.length === 0 || results.length > 0,
            added: results.length,
            failed: errors.length,
            names: results,
            errors: errors.length > 0 ? errors : undefined,
        };
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
            return { success: false, error: err.message, data: null };
        }
    };

    // Oznacz zwierzę jako martwe
    const markAsDeceased = async (animalId: string, deathDate?: string, deathReason?: string) => {
        try {
            const updateData: Partial<Animal> = {
                healthStatus: 'deceased',
                isActive: false,
            };

            // Pobierz aktualne dane zwierzęcia aby zachować specificData
            const animalResult = await animalsService.getById(animalId);
            if (animalResult.success && animalResult.data) {
                updateData.specificData = {
                    ...animalResult.data.specificData,
                    deathDate: deathDate || new Date().toISOString().split('T')[0],
                    // deathReason: deathReason || undefined,
                };
            }

            const result = await animalsService.update(animalId, updateData);

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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
        }
    };

    // Pobierz jedno zwierzę
    const getAnimal = async (animalId: string) => {
        try {
            const result = await animalsService.getById(animalId);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
        }
    };

    const getFeedingHistory = async (animalId: string) => {
        try {
            const result = await animalsService.getFeedingHistory(animalId);
            return result;
        } catch (err: any) {
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
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
            return { success: false, error: err.message, data: null };
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
        addSpider,
        addMultipleSpiders,
        updateAnimal,
        getAnimal,
        getAnimalsByCategory,
        deleteAnimal,
        deleteAnimalCompletely,
        markAsDeceased,
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