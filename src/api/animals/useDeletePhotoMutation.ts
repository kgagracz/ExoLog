import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService } from '../../services/firebase/storageService';
import { animalsService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

interface DeletePhotoParams {
    animalId: string;
    photoId: string;
    photoPath: string;
}

export function useDeletePhotoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ animalId, photoId, photoPath }: DeletePhotoParams) => {
            const deleteResult = await storageService.deletePhoto(photoPath);

            if (!deleteResult.success) {
                throw new Error(deleteResult.error || 'Nie udało się usunąć zdjęcia');
            }

            const freshAnimal = await unwrapService(animalsService.getById(animalId));
            const currentPhotos = freshAnimal.photos || [];
            const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);

            await animalsService.update(animalId, { photos: updatedPhotos });
        },
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
