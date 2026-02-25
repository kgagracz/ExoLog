import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import type { Animal } from '../../types';

export function usePublicAnimalsQuery(userId: string | undefined, maxResults?: number) {
    return useQuery<Animal[]>({
        queryKey: queryKeys.social.publicAnimals(userId ?? '', maxResults),
        queryFn: () => unwrapService(socialService.getPublicAnimals(userId!, maxResults)),
        enabled: !!userId,
    });
}
