import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useDeleteFeedingMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ feedingId, animalId }: { feedingId: string; animalId: string }) =>
            unwrapServiceWithMeta(animalsService.deleteFeedingRecord(feedingId, animalId)),
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.feeding.history(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
