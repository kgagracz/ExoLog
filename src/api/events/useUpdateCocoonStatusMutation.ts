import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useUpdateCocoonStatusMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, newStatus, hatchedCount }: {
            eventId: string;
            newStatus: 'laid' | 'incubating' | 'hatched' | 'failed';
            hatchedCount?: number;
        }) => unwrapServiceWithMeta(eventsService.updateCocoonStatus(eventId, newStatus, hatchedCount)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.cocoon.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
        },
    });
}
