import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { FriendRequest } from '../../types/social';

export function useIncomingRequestsQuery() {
    const { user, isAuthenticated } = useAuth();

    return useQuery<FriendRequest[]>({
        queryKey: queryKeys.social.requests.incoming(user?.uid ?? ''),
        queryFn: () => unwrapService(socialService.getIncomingRequests(user!.uid)),
        enabled: !!user && isAuthenticated,
    });
}

export function useOutgoingRequestsQuery() {
    const { user, isAuthenticated } = useAuth();

    return useQuery<FriendRequest[]>({
        queryKey: queryKeys.social.requests.outgoing(user?.uid ?? ''),
        queryFn: () => unwrapService(socialService.getOutgoingRequests(user!.uid)),
        enabled: !!user && isAuthenticated,
    });
}
