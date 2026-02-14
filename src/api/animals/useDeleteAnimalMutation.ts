import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useDeleteAnimalMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (animalId: string) =>
            unwrapServiceWithMeta(animalsService.deleteAnimalCompletely(animalId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.feeding.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
        },
    });
}
