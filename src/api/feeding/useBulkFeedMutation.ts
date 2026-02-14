import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';

interface BulkFeedingData {
    animalIds: string[];
    foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
    foodSize: 'small' | 'medium' | 'large';
    quantity: number;
    date: string;
    notes?: string;
}

export function useBulkFeedMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: BulkFeedingData) =>
            unwrapServiceWithMeta(animalsService.feedMultipleAnimals({
                ...data,
                userId: user!.uid,
            })),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.feeding.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
        },
    });
}
