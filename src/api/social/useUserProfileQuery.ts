import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import type { PublicUserProfile } from '../../types/social';

export function useUserProfileQuery(userId: string | undefined) {
    return useQuery<PublicUserProfile | null>({
        queryKey: queryKeys.social.profile(userId ?? ''),
        queryFn: async () => {
            const result = await socialService.getUserProfile(userId!);
            if (!result.success) throw new Error(result.error || 'Nieznany błąd');
            return result.data ?? null;
        },
        enabled: !!userId,
    });
}
