import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

export function useFollowStatusQuery(otherUserId: string | undefined) {
    const { user, isAuthenticated } = useAuth();

    return useQuery<boolean>({
        queryKey: queryKeys.social.followStatus(user?.uid ?? '', otherUserId ?? ''),
        queryFn: () => unwrapService(socialService.checkFollowStatus(user!.uid, otherUserId!)),
        enabled: !!user && isAuthenticated && !!otherUserId && user.uid !== otherUserId,
    });
}
