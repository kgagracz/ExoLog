import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { storageService } from '../services/firebase/storageService';
import { animalsService } from '../services/firebase';
import { useAnimalQuery } from '../api/animals/useAnimalQuery';
import { useUploadPhotosMutation } from '../api/animals/useUploadPhotosMutation';
import { useDeletePhotoMutation } from '../api/animals/useDeletePhotoMutation';
import { useSetMainPhotoMutation } from '../api/animals/useSetMainPhotoMutation';
import { queryKeys } from '../api/queryKeys';
import { Animal, Photo } from '../types';

interface UploadPhotosOptions {
    mainIndex?: number;
    description?: string;
    bodyLength?: number | null;
    stage?: number | null;
    currentMeasurements?: Animal['measurements'];
}

interface UseAnimalPhotosReturn {
    photos: Photo[];
    loading: boolean;
    uploading: boolean;
    error: string | null;
    loadPhotos: () => Promise<void>;
    uploadPhotos: (imageUris: string[], options?: UploadPhotosOptions) => Promise<boolean>;
    uploadMainPhoto: (imageUri: string) => Promise<string | null>;
    deletePhoto: (photoId: string, photoPath: string) => Promise<boolean>;
    setMainPhoto: (photoId: string) => Promise<boolean>;
}

export const useAnimalPhotos = (
    userId: string,
    animalId: string
): UseAnimalPhotosReturn => {
    const queryClient = useQueryClient();
    const animalQuery = useAnimalQuery(animalId);
    const uploadMutation = useUploadPhotosMutation();
    const deleteMutation = useDeletePhotoMutation();
    const setMainMutation = useSetMainPhotoMutation();

    const photos = animalQuery.data?.photos || [];
    const loading = animalQuery.isLoading;
    const uploading = uploadMutation.isPending;

    const error =
        (uploadMutation.error as Error)?.message ??
        (deleteMutation.error as Error)?.message ??
        (setMainMutation.error as Error)?.message ??
        (uploadMutation.data?.partialError) ??
        null;

    const loadPhotos = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
    }, [queryClient, animalId]);

    const uploadPhotos = useCallback(async (
        imageUris: string[],
        options: UploadPhotosOptions = {}
    ): Promise<boolean> => {
        if (!userId || !animalId || imageUris.length === 0) return false;

        try {
            await uploadMutation.mutateAsync({ userId, animalId, imageUris, options });
            return true;
        } catch {
            return false;
        }
    }, [userId, animalId, uploadMutation]);

    const uploadMainPhoto = useCallback(async (imageUri: string): Promise<string | null> => {
        if (!userId || !animalId) return null;

        try {
            const result = await storageService.uploadMainPhoto(userId, animalId, imageUri);

            if (result.success && result.url) {
                await animalsService.update(animalId, { mainPhotoUrl: result.url });
                await queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
                await queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
                return result.url;
            }

            return null;
        } catch {
            return null;
        }
    }, [userId, animalId, queryClient]);

    const deletePhoto = useCallback(async (
        photoId: string,
        photoPath: string
    ): Promise<boolean> => {
        if (!userId || !animalId) return false;

        try {
            await deleteMutation.mutateAsync({ animalId, photoId, photoPath });
            return true;
        } catch {
            return false;
        }
    }, [userId, animalId, deleteMutation]);

    const setMainPhoto = useCallback(async (photoId: string): Promise<boolean> => {
        if (!userId || !animalId) return false;

        try {
            await setMainMutation.mutateAsync({ animalId, photoId });
            return true;
        } catch {
            return false;
        }
    }, [userId, animalId, setMainMutation]);

    return {
        photos,
        loading,
        uploading,
        error,
        loadPhotos,
        uploadPhotos,
        uploadMainPhoto,
        deletePhoto,
        setMainPhoto,
    };
};
