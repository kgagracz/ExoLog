import { useQuery } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useFeedingHistoryQuery(animalId: string | undefined) {
    return useQuery<any[]>({
        queryKey: queryKeys.feeding.history(animalId ?? ''),
        queryFn: () => unwrapService(animalsService.getFeedingHistory(animalId!)),
        enabled: !!animalId,
    });
}
