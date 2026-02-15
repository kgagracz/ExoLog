import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapService } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { PublicUserProfile } from '../../types/social';

export function useSearchUsersQuery(term: string) {
    const { user } = useAuth();

    return useQuery<PublicUserProfile[]>({
        queryKey: queryKeys.social.search(term),
        queryFn: () => unwrapService(socialService.searchUsers(term, user!.uid)),
        enabled: term.length >= 2 && !!user,
    });
}
