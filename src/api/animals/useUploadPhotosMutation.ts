import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService } from '../../services/firebase/storageService';
import { animalsService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { Animal } from '../../types';

interface UploadPhotosParams {
    userId: string;
    animalId: string;
    imageUris: string[];
    options?: {
        mainIndex?: number;
        description?: string;
        bodyLength?: number | null;
        stage?: number | null;
        currentMeasurements?: Animal['measurements'];
    };
}

export function useUploadPhotosMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, animalId, imageUris, options = {} }: UploadPhotosParams) => {
            const { mainIndex = 0, description, bodyLength, stage, currentMeasurements } = options;

            const uploadResult = await storageService.uploadMultiplePhotos(
                userId,
                animalId,
                imageUris,
                mainIndex,
            );

            if (uploadResult.photos.length === 0) {
                throw new Error(uploadResult.errors.join(', '));
            }

            const photosWithDescription = description
                ? uploadResult.photos.map(p => ({ ...p, description }))
                : uploadResult.photos;

            const freshAnimal = await unwrapService(animalsService.getById(animalId));
            const existingPhotos = freshAnimal.photos || [];

            const hasNewMain = photosWithDescription.some(p => p.isMain);
            const currentPhotos = hasNewMain
                ? existingPhotos.map(p => ({ ...p, isMain: false }))
                : [...existingPhotos];
            const newPhotos = [...currentPhotos, ...photosWithDescription];

            const updateData: Record<string, any> = {
                photos: newPhotos,
                ...(hasNewMain && {
                    mainPhotoUrl: photosWithDescription.find(p => p.isMain)?.url,
                }),
            };

            if (bodyLength != null) {
                const mergedMeasurements = { ...(currentMeasurements || {}) };
                mergedMeasurements.length = bodyLength;
                mergedMeasurements.lastMeasured = new Date().toISOString().split('T')[0];
                updateData.measurements = mergedMeasurements;
            }

            if (stage != null) {
                updateData['specificData.currentStage'] = stage;
            }

            await animalsService.update(animalId, updateData);

            if (uploadResult.errors.length > 0) {
                return { partialError: `Część zdjęć nie została przesłana: ${uploadResult.errors.join(', ')}` };
            }

            return { partialError: null };
        },
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
