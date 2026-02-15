import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { socialService } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

interface UpdateProfileData {
    displayName: string;
    email: string;
    photoURL?: string;
    bio?: string;
    isPublic?: boolean;
    totalAnimals?: number;
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: UpdateProfileData) =>
            unwrapServiceWithMeta(socialService.createOrUpdateProfile({
                uid: user!.uid,
                ...data,
            })),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.social.profile(user!.uid) });
        },
    });
}
