import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useUpdateAnimalMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ animalId, updates }: { animalId: string; updates: Partial<Animal> }) =>
            unwrapServiceWithMeta(animalsService.update(animalId, updates)),
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
