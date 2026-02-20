import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { Follow } from '../../types/social';

export function useFollowingQuery(userId?: string) {
    const { user, isAuthenticated } = useAuth();
    const targetId = userId ?? user?.uid;

    return useQuery<Follow[]>({
        queryKey: queryKeys.social.following(targetId ?? ''),
        queryFn: () => unwrapService(socialService.getFollowing(targetId!)),
        enabled: !!targetId && isAuthenticated,
    });
}
