import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

interface SendRequestData {
    toUserId: string;
    toDisplayName: string;
}

export function useSendRequestMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: SendRequestData) =>
            unwrapServiceWithMeta(socialService.sendFriendRequest({
                fromUserId: user!.uid,
                fromDisplayName: user!.displayName || user!.email?.split('@')[0] || 'Użytkownik',
                toUserId: data.toUserId,
                toDisplayName: data.toDisplayName,
            })),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.requests.outgoing(user!.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.friendshipStatus(user!.uid, variables.toUserId) });
        },
    });
}
