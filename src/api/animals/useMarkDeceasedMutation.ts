import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useMarkDeceasedMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ animalId, deathDate }: { animalId: string; deathDate?: string }) => {
            const animalResult = await animalsService.getById(animalId);

            const updateData: Partial<Animal> = {
                healthStatus: 'deceased',
                isActive: false,
            };

            if (animalResult.success && animalResult.data) {
                updateData.specificData = {
                    ...animalResult.data.specificData,
                    deathDate: deathDate || new Date().toISOString().split('T')[0],
                };
            }

            return unwrapServiceWithMeta(animalsService.update(animalId, updateData));
        },
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
