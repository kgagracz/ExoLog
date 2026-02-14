import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';

export function useLastMoltDatesQuery(animalIds: string[]) {
    return useQuery<Record<string, string>>({
        queryKey: queryKeys.events.molting.lastDates(animalIds),
        queryFn: () => unwrapService(eventsService.getLastMoltDateForAnimals(animalIds)),
        enabled: animalIds.length > 0,
    });
}

export function useMatingStatusesQuery(animalIds: string[]) {
    return useQuery<Record<string, any>>({
        queryKey: queryKeys.events.mating.statuses(animalIds),
        queryFn: () => unwrapService(eventsService.getMatingStatusForAnimals(animalIds)),
        enabled: animalIds.length > 0,
    });
}

export function useCocoonStatusesQuery(animalIds: string[]) {
    return useQuery<Record<string, any>>({
        queryKey: queryKeys.events.cocoon.statuses(animalIds),
        queryFn: () => unwrapService(eventsService.getCocoonStatusForAnimals(animalIds)),
        enabled: animalIds.length > 0,
    });
}

export function useUpcomingHatchesQuery(daysAhead: number = 365) {
    const { user, isAuthenticated } = useAuth();
    return useQuery<any[]>({
        queryKey: queryKeys.events.cocoon.upcoming(user?.uid ?? ''),
        queryFn: () => unwrapService(eventsService.getUpcomingHatches(user!.uid, daysAhead)),
        enabled: !!user && isAuthenticated,
    });
}
