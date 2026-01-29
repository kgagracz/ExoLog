import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase.config';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Photo } from '../../types';

interface UploadResult {
    success: boolean;
    url?: string;
    path?: string;
    error?: string;
}

// Kompresja obrazu przed uploadem
const compressImage = async (uri: string): Promise<string> => {
    try {
        const result = await manipulateAsync(
            uri,
            [{ resize: { width: 1200 } }],
            { compress: 0.8, format: SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.warn('Image compression failed, using original:', error);
        return uri;
    }
};

// Konwersja URI na blob
const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    return await response.blob();
};

export const storageService = {
    /**
     * Upload zdjęcia zwierzęcia
     */
    uploadAnimalPhoto: async (
        userId: string,
        animalId: string,
        imageUri: string,
        isMain: boolean = false
    ): Promise<UploadResult> => {
        try {
            console.log('📸 Starting upload:', { userId, animalId, imageUri: imageUri.substring(0, 50) });

            // Kompresuj obraz
            const compressedUri = await compressImage(imageUri);
            console.log('✅ Image compressed');

            // Konwertuj na blob
            const blob = await uriToBlob(compressedUri);
            console.log('✅ Blob created, size:', blob.size);

            // Generuj unikalną nazwę pliku
            const timestamp = Date.now();
            const filename = `${timestamp}.jpg`;
            const path = `users/${userId}/animals/${animalId}/photos/${filename}`;
            console.log('📁 Upload path:', path);

            // Referencja do Storage
            const storageRef = ref(storage, path);

            // Upload
            console.log('⬆️ Starting upload to Firebase...');
            await uploadBytes(storageRef, blob, {
                contentType: 'image/jpeg',
                customMetadata: {
                    uploadedAt: new Date().toISOString(),
                    isMain: isMain.toString(),
                },
            });
            console.log('✅ Upload complete');

            // Pobierz URL
            const url = await getDownloadURL(storageRef);
            console.log('✅ Got download URL:', url.substring(0, 50));

            return {
                success: true,
                url,
                path,
            };
        } catch (error: any) {
            console.error('❌ Error uploading photo:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Server response:', error.serverResponse);
            return {
                success: false,
                error: error.message || 'Nie udało się przesłać zdjęcia',
            };
        }
    },

    /**
     * Upload wielu zdjęć naraz
     */
    uploadMultiplePhotos: async (
        userId: string,
        animalId: string,
        imageUris: string[],
        mainPhotoIndex: number = 0
    ): Promise<{ success: boolean; photos: Photo[]; errors: string[] }> => {
        const photos: Photo[] = [];
        const errors: string[] = [];

        for (let i = 0; i < imageUris.length; i++) {
            const result = await storageService.uploadAnimalPhoto(
                userId,
                animalId,
                imageUris[i],
                i === mainPhotoIndex
            );

            if (result.success && result.url && result.path) {
                photos.push({
                    id: `photo-${Date.now()}-${i}`,
                    url: result.url,
                    path: result.path,
                    uploadedAt: new Date().toISOString(),
                    isMain: i === mainPhotoIndex,
                });
            } else {
                errors.push(result.error || `Błąd przy zdjęciu ${i + 1}`);
            }
        }

        return {
            success: errors.length === 0,
            photos,
            errors,
        };
    },

    /**
     * Usuń zdjęcie
     */
    deletePhoto: async (path: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            return { success: true };
        } catch (error: any) {
            console.error('Error deleting photo:', error);
            return {
                success: false,
                error: error.message || 'Nie udało się usunąć zdjęcia',
            };
        }
    },

    /**
     * Pobierz listę zdjęć zwierzęcia
     */
    getAnimalPhotos: async (
        userId: string,
        animalId: string
    ): Promise<{ success: boolean; photos: Photo[]; error?: string }> => {
        try {
            const folderRef = ref(storage, `users/${userId}/animals/${animalId}/photos`);
            const result = await listAll(folderRef);

            const photos: Photo[] = await Promise.all(
                result.items.map(async (itemRef, index) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        id: itemRef.name,
                        url,
                        path: itemRef.fullPath,
                        uploadedAt: new Date().toISOString(),
                        isMain: index === 0,
                    };
                })
            );

            return { success: true, photos };
        } catch (error: any) {
            console.error('Error getting photos:', error);
            return {
                success: false,
                photos: [],
                error: error.message || 'Nie udało się pobrać zdjęć',
            };
        }
    },

    /**
     * Upload zdjęcia profilowego (głównego) zwierzęcia
     */
    uploadMainPhoto: async (
        userId: string,
        animalId: string,
        imageUri: string
    ): Promise<UploadResult> => {
        try {
            const compressedUri = await compressImage(imageUri);
            const blob = await uriToBlob(compressedUri);

            // Główne zdjęcie ma stałą nazwę
            const path = `users/${userId}/animals/${animalId}/main.jpg`;
            const storageRef = ref(storage, path);

            await uploadBytes(storageRef, blob, {
                contentType: 'image/jpeg',
            });

            const url = await getDownloadURL(storageRef);

            return { success: true, url, path };
        } catch (error: any) {
            console.error('Error uploading main photo:', error);
            return {
                success: false,
                error: error.message || 'Nie udało się przesłać głównego zdjęcia',
            };
        }
    },
};