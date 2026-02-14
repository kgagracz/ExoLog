import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useCocoonHistoryQuery(animalId: string | undefined, limit?: number) {
    return useQuery<any[]>({
        queryKey: queryKeys.events.cocoon.history(animalId ?? ''),
        queryFn: () => unwrapService(eventsService.getCocoonHistory(animalId!, limit)),
        enabled: !!animalId,
    });
}
