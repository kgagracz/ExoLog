import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoltingEventData } from '../../types/events';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';
import { scheduleMoltReminder } from '../../services/notificationService';

interface AddMoltingData {
    animalId: string;
    date: string;
    eventData: MoltingEventData;
    description?: string;
    photos?: string[];
    animalName?: string;
}

export function useAddMoltingMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: AddMoltingData) =>
            unwrapServiceWithMeta(eventsService.addMolting({
                ...data,
                userId: user!.uid,
            })),
        onSuccess: (_data, { animalId, animalName, date }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.molting.history(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.events.molting.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });

            if (animalName) {
                scheduleMoltReminder(animalName, date).catch(() => {});
            }
        },
    });
}
