import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { FriendshipStatus } from '../../types/social';

export function useFriendshipStatusQuery(otherUserId: string | undefined) {
    const { user, isAuthenticated } = useAuth();

    return useQuery<FriendshipStatus>({
        queryKey: queryKeys.social.friendshipStatus(user?.uid ?? '', otherUserId ?? ''),
        queryFn: () => unwrapService(socialService.checkFriendshipStatus(user!.uid, otherUserId!)),
        enabled: !!user && isAuthenticated && !!otherUserId,
    });
}
