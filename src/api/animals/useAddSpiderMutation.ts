import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';
import { removeUndefinedDeep } from '../../utils/objectService';

export interface SpiderData {
    name?: string;
    species: string;
    sex?: 'male' | 'female' | 'unknown';
    stage?: 'baby' | 'juvenile' | 'subadult' | 'adult';
    currentStage?: number;
    dateAcquired?: string;
    dateOfBirth?: string;
    notes?: string;
    weight?: number;
    bodyLength?: number;
    temperament?: string;
    terrariumLength?: number;
    terrariumWidth?: number;
    terrariumHeight?: number;
    substrate?: string;
    temperature?: number;
    humidity?: number;
    feedingSchedule?: string;
    foodType?: string;
    parentFemaleId?: string;
    cocoonId?: string;
}

const ARACHNIDS_CATEGORY_ID = 'tsXnqoMTNElLOrIplWhn';
const TARANTULA_TYPE_ID = 'E2VPLNh0lSYNxQuzJvS8';

function mapSpiderToAnimal(spiderData: SpiderData, userId: string): Omit<Animal, 'id' | 'createdAt' | 'updatedAt'> {
    return {
        userId,
        categoryId: ARACHNIDS_CATEGORY_ID,
        animalTypeId: TARANTULA_TYPE_ID,
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
            temperature: { day: spiderData.temperature },
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
}

export function useAddSpiderMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (spiderData: SpiderData) => {
            const animalData = mapSpiderToAnimal(spiderData, user!.uid);
            const body = removeUndefinedDeep(animalData);
            return unwrapServiceWithMeta(animalsService.add(body));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}

export function useAddMultipleSpidersMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ baseData, quantity, nameGenerator }: {
            baseData: Omit<SpiderData, 'name'>;
            quantity: number;
            nameGenerator: (index: number, total: number) => string;
        }) => {
            const results: string[] = [];
            const errors: Array<{ name: string; error: string }> = [];

            for (let i = 1; i <= quantity; i++) {
                const spiderName = nameGenerator(i, quantity);
                const animalData = mapSpiderToAnimal({ ...baseData, name: spiderName }, user!.uid);
                const body = removeUndefinedDeep(animalData);

                try {
                    const result = await animalsService.add(body);
                    if (result.success) {
                        results.push(spiderName);
                    } else {
                        errors.push({ name: spiderName, error: result.error || 'Unknown error' });
                    }
                } catch (err: any) {
                    errors.push({ name: spiderName, error: err.message });
                }

                if (i % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            if (results.length === 0) {
                throw new Error(`Nie udało się dodać żadnego pająka`);
            }

            return {
                success: true,
                added: results.length,
                failed: errors.length,
                names: results,
                errors: errors.length > 0 ? errors : undefined,
            };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
