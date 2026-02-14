import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useMoltingHistoryQuery(animalId: string | undefined, limit?: number) {
    return useQuery<any[]>({
        queryKey: queryKeys.events.molting.history(animalId ?? ''),
        queryFn: () => unwrapService(eventsService.getMoltingHistory(animalId!, limit)),
        enabled: !!animalId,
    });
}
