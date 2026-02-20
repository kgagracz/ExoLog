import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

interface FollowData {
    followingId: string;
    followingDisplayName: string;
}

export function useFollowMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: FollowData) =>
            unwrapServiceWithMeta(socialService.followUser({
                followerId: user!.uid,
                followingId: data.followingId,
                followerDisplayName: user!.displayName || user!.email?.split('@')[0] || 'Użytkownik',
                followingDisplayName: data.followingDisplayName,
            })),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.followStatus(user!.uid, variables.followingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.following(user!.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.followers(variables.followingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.profile(variables.followingId) });
        },
    });
}
