import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

export function useUnfollowMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (followingId: string) =>
            unwrapServiceWithMeta(socialService.unfollowUser(user!.uid, followingId)),
        onSuccess: (_data, followingId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.followStatus(user!.uid, followingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.following(user!.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.followers(followingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.profile(followingId) });
        },
    });
}
