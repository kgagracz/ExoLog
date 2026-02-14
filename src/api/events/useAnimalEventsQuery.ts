import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useAnimalEventsQuery(animalId: string | undefined, eventTypeId?: string, limit?: number) {
    return useQuery<any[]>({
        queryKey: queryKeys.events.animal(animalId ?? ''),
        queryFn: () => unwrapService(eventsService.getAnimalEvents(animalId!, eventTypeId, limit)),
        enabled: !!animalId,
    });
}
