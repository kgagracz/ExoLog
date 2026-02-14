import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';

interface FeedingData {
    animalId: string;
    foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
    foodSize: 'small' | 'medium' | 'large';
    quantity: number;
    date: string;
    notes?: string;
}

export function useFeedAnimalMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (feedingData: FeedingData) =>
            unwrapServiceWithMeta(animalsService.feedAnimal({
                ...feedingData,
                userId: user!.uid,
            })),
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.feeding.history(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
