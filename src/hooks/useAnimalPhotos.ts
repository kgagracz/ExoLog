import { useState, useCallback } from 'react';
import { storageService } from '../services/firebase/storageService';
import { animalsService } from "../services/firebase";
import { Animal, Photo } from "../types";

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
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Załaduj zdjęcia zwierzęcia z Firestore
    const loadPhotos = useCallback(async () => {
        if (!userId || !animalId) return;

        setLoading(true);
        setError(null);
        try {
            const result = await animalsService.getById(animalId);
            if (result.success && result.data) {
                const animalPhotos = result.data.photos || [];
                setPhotos(animalPhotos);
            } else {
                setError(result.error || 'Nie udało się pobrać zdjęć');
            }
        } catch (err: any) {
            setError(err.message || 'Błąd podczas ładowania zdjęć');
        } finally {
            setLoading(false);
        }
    }, [userId, animalId]);

    // Upload wielu zdjęć
    const uploadPhotos = useCallback(async (
        imageUris: string[],
        options: UploadPhotosOptions = {}
    ): Promise<boolean> => {
        const { mainIndex = 0, description, bodyLength, stage, currentMeasurements } = options;
        if (!userId || !animalId || imageUris.length === 0) return false;

        setUploading(true);
        setError(null);
        try {
            // Upload do Storage
            const uploadResult = await storageService.uploadMultiplePhotos(
                userId,
                animalId,
                imageUris,
                mainIndex
            );

            if (uploadResult.photos.length > 0) {
                // Dodaj opis do zdjęć jeśli podano
                const photosWithDescription = description
                    ? uploadResult.photos.map(p => ({ ...p, description }))
                    : uploadResult.photos;

                // Zaktualizuj dokument zwierzęcia w Firestore
                const currentPhotos = [...photos];
                const newPhotos = [...currentPhotos, ...photosWithDescription];

                const updateData: Record<string, any> = {
                    photos: newPhotos,
                    // Jeśli to pierwsze zdjęcie główne, ustaw mainPhotoUrl
                    ...(photosWithDescription.some(p => p.isMain) && {
                        mainPhotoUrl: photosWithDescription.find(p => p.isMain)?.url,
                    }),
                };

                // Zaktualizuj pomiary jeśli podano długość ciała
                if (bodyLength != null) {
                    const mergedMeasurements = { ...(currentMeasurements || {}) };
                    mergedMeasurements.length = bodyLength;
                    mergedMeasurements.lastMeasured = new Date().toISOString().split('T')[0];
                    updateData.measurements = mergedMeasurements;
                }

                // Zaktualizuj numer wylinki jeśli podano
                if (stage != null) {
                    updateData['specificData.currentStage'] = stage;
                }

                await animalsService.update(animalId, updateData);

                setPhotos(newPhotos);

                if (uploadResult.errors.length > 0) {
                    setError(`Część zdjęć nie została przesłana: ${uploadResult.errors.join(', ')}`);
                }
                return true;
            } else {
                setError(uploadResult.errors.join(', '));
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Błąd podczas przesyłania zdjęć');
            return false;
        } finally {
            setUploading(false);
        }
    }, [userId, animalId, photos]);

    // Upload głównego zdjęcia
    const uploadMainPhoto = useCallback(async (imageUri: string): Promise<string | null> => {
        if (!userId || !animalId) return null;

        setUploading(true);
        setError(null);
        try {
            const result = await storageService.uploadMainPhoto(userId, animalId, imageUri);

            if (result.success && result.url) {
                // Zaktualizuj dokument zwierzęcia
                await animalsService.update(animalId, {
                    mainPhotoUrl: result.url,
                });

                return result.url;
            } else {
                setError(result.error || 'Nie udało się przesłać głównego zdjęcia');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Błąd podczas przesyłania głównego zdjęcia');
            return null;
        } finally {
            setUploading(false);
        }
    }, [userId, animalId]);

    // Usuń zdjęcie
    const deletePhoto = useCallback(async (
        photoId: string,
        photoPath: string
    ): Promise<boolean> => {
        if (!userId || !animalId) return false;

        setError(null);
        try {
            // Usuń z Storage
            const deleteResult = await storageService.deletePhoto(photoPath);

            if (deleteResult.success) {
                // Zaktualizuj Firestore
                const updatedPhotos = photos.filter(p => p.id !== photoId);

                await animalsService.update(animalId, {
                    photos: updatedPhotos,
                });

                setPhotos(updatedPhotos);
                return true;
            } else {
                setError(deleteResult.error || 'Nie udało się usunąć zdjęcia');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Błąd podczas usuwania zdjęcia');
            return false;
        }
    }, [userId, animalId, photos]);

    // Ustaw zdjęcie jako główne
    const setMainPhoto = useCallback(async (photoId: string): Promise<boolean> => {
        if (!userId || !animalId) return false;

        setError(null);
        try {
            const updatedPhotos = photos.map(p => ({
                ...p,
                isMain: p.id === photoId,
            }));

            const mainPhoto = updatedPhotos.find(p => p.isMain);

            await animalsService.update(animalId, {
                photos: updatedPhotos,
                mainPhotoUrl: mainPhoto?.url,
            });

            setPhotos(updatedPhotos);
            return true;
        } catch (err: any) {
            setError(err.message || 'Błąd podczas ustawiania głównego zdjęcia');
            return false;
        }
    }, [userId, animalId, photos]);

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