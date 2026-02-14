import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useMatingHistoryQuery(animalId: string | undefined, limit?: number) {
    return useQuery<any[]>({
        queryKey: queryKeys.events.mating.history(animalId ?? ''),
        queryFn: () => unwrapService(eventsService.getMatingHistory(animalId!, limit)),
        enabled: !!animalId,
    });
}
