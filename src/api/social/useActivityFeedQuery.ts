import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useFollowingQuery } from './useFollowingQuery';
import type { ActivityItem } from '../../types/social';

export function useActivityFeedQuery() {
    const { user, isAuthenticated } = useAuth();
    const { data: following = [] } = useFollowingQuery();

    const followedUserIds = following.map((f) => f.followingId);

    return useQuery<ActivityItem[]>({
        queryKey: queryKeys.social.activityFeed(user?.uid ?? ''),
        queryFn: () => unwrapService(socialService.getActivityFeed(followedUserIds)),
        enabled: !!user && isAuthenticated && followedUserIds.length > 0,
        staleTime: 60 * 1000,
    });
}
