import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useDeleteMultipleAnimalsMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (animalIds: string[]) =>
            unwrapServiceWithMeta(animalsService.deleteMultipleAnimals(animalIds)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.feeding.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
        },
    });
}
