import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';
import { scheduleCocoonHatchReminder } from '../../services/notificationService';

interface AddCocoonData {
    animalId: string;
    date: string;
    eventData: {
        femaleId: string;
        estimatedHatchDate?: string;
        cocoonStatus: 'laid' | 'incubating' | 'hatched' | 'failed';
        eggCount?: number;
    };
    description?: string;
    photos?: string[];
    setReminder?: boolean;
    animalName?: string;
}

export function useAddCocoonMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: AddCocoonData) =>
            unwrapServiceWithMeta(eventsService.addCocoon({
                ...data,
                userId: user!.uid,
            })),
        onSuccess: (_data, { animalId, setReminder, eventData, animalName }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.cocoon.history(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.events.cocoon.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });

            if (setReminder && eventData.estimatedHatchDate && animalName) {
                scheduleCocoonHatchReminder(animalName, eventData.estimatedHatchDate).catch(() => {});
            }
        },
    });
}
