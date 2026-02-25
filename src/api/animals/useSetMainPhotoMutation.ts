import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

interface SetMainPhotoParams {
    animalId: string;
    photoId: string;
}

export function useSetMainPhotoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ animalId, photoId }: SetMainPhotoParams) => {
            const freshAnimal = await unwrapService(animalsService.getById(animalId));
            const currentPhotos = freshAnimal.photos || [];

            const updatedPhotos = currentPhotos.map(p => ({
                ...p,
                isMain: p.id === photoId,
            }));

            const mainPhoto = updatedPhotos.find(p => p.isMain);

            await animalsService.update(animalId, {
                photos: updatedPhotos,
                mainPhotoUrl: mainPhoto?.url,
            });
        },
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
