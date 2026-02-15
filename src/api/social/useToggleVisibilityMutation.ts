import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

export function useToggleVisibilityMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (isPublic: boolean) =>
            unwrapServiceWithMeta(socialService.updateProfileVisibility(user!.uid, isPublic)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.profile(user!.uid) });
        },
    });
}
