import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../services/firebase/eventsService';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';

interface AddMatingData {
    animalId: string;
    date: string;
    eventData: {
        maleId: string;
        femaleId: string;
        result: 'success' | 'failure' | 'in_progress' | 'unknown';
    };
    description?: string;
    photos?: string[];
}

export function useAddMatingMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: AddMatingData) =>
            unwrapServiceWithMeta(eventsService.addMating({
                ...data,
                userId: user!.uid,
            })),
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.mating.history(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.events.mating.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
        },
    });
}
