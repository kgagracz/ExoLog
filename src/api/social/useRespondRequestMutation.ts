import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

interface AcceptRequestData {
    requestId: string;
    fromUserId: string;
    fromDisplayName: string;
    toDisplayName: string;
}

export function useAcceptRequestMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: AcceptRequestData) =>
            unwrapServiceWithMeta(socialService.acceptFriendRequest(
                data.requestId,
                data.fromUserId,
                user!.uid,
                data.fromDisplayName,
                data.toDisplayName,
            )),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.requests.incoming(user!.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.friends(user!.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.social.friendshipStatus(user!.uid, variables.fromUserId) });
        },
    });
}

export function useRejectRequestMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (requestId: string) =>
            unwrapServiceWithMeta(socialService.rejectFriendRequest(requestId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.requests.incoming(user!.uid) });
        },
    });
}
