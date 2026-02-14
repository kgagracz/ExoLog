import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useDeleteMoltingMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) =>
            unwrapServiceWithMeta(eventsService.deleteMolting(eventId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.molting.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
        },
    });
}
