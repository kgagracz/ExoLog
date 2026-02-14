import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';
import { removeUndefinedDeep } from '../../utils/objectService';

export function useAddAnimalMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
            const body = removeUndefinedDeep(animalData);
            return unwrapServiceWithMeta(animalsService.add({
                ...body,
                userId: user!.uid,
            }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
