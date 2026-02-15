import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

export function useRemoveFriendMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (friendshipId: string) =>
            unwrapServiceWithMeta(socialService.removeFriend(friendshipId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.friends(user!.uid) });
        },
    });
}
