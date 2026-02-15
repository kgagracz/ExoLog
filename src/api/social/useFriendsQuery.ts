import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { Friendship } from '../../types/social';

export function useFriendsQuery() {
    const { user, isAuthenticated } = useAuth();

    return useQuery<Friendship[]>({
        queryKey: queryKeys.social.friends(user?.uid ?? ''),
        queryFn: () => unwrapService(socialService.getFriends(user!.uid)),
        enabled: !!user && isAuthenticated,
    });
}
