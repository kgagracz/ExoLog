import { useQuery } from '@tanstack/react-query';
import { EventType } from '../../types';
import { eventTypesService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useEventTypesQuery(animalTypeId?: string) {
    return useQuery<EventType[]>({
        queryKey: animalTypeId
            ? queryKeys.lookup.eventTypes.byAnimalType(animalTypeId)
            : queryKeys.lookup.eventTypes.all(),
        queryFn: () => animalTypeId
            ? unwrapService(eventTypesService.getForAnimalType(animalTypeId))
            : unwrapService(eventTypesService.getAll()),
    });
}
