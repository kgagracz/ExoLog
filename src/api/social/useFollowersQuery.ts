import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { Follow } from '../../types/social';

export function useFollowersQuery(userId?: string) {
    const { user, isAuthenticated } = useAuth();
    const targetId = userId ?? user?.uid;

    return useQuery<Follow[]>({
        queryKey: queryKeys.social.followers(targetId ?? ''),
        queryFn: () => unwrapService(socialService.getFollowers(targetId!)),
        enabled: !!targetId && isAuthenticated,
    });
}
