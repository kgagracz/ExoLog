import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

interface ImagePickerOptions {
    allowsMultipleSelection?: boolean;
    maxSelection?: number;
    quality?: number;
    aspect?: [number, number];
    allowsEditing?: boolean;
}

interface SelectedImage {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
}

interface UseImagePickerReturn {
    images: SelectedImage[];
    loading: boolean;
    pickFromGallery: (options?: ImagePickerOptions) => Promise<SelectedImage[]>;
    pickFromCamera: (options?: ImagePickerOptions) => Promise<SelectedImage | null>;
    removeImage: (uri: string) => void;
    clearImages: () => void;
    setImages: React.Dispatch<React.SetStateAction<SelectedImage[]>>;
}

export const useImagePicker = (): UseImagePickerReturn => {
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [loading, setLoading] = useState(false);

    // Sprawdź i poproś o uprawnienia do galerii
    const requestGalleryPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Brak uprawnień',
                    'Potrzebujemy dostępu do galerii, aby wybrać zdjęcia.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    // Sprawdź i poproś o uprawnienia do kamery
    const requestCameraPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Brak uprawnień',
                    'Potrzebujemy dostępu do kamery, aby zrobić zdjęcie.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    // Wybierz zdjęcia z galerii
    const pickFromGallery = useCallback(async (options?: ImagePickerOptions): Promise<SelectedImage[]> => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return [];

        setLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: options?.allowsMultipleSelection ?? true,
                allowsEditing: options?.allowsEditing ?? false,
                aspect: options?.aspect,
                quality: options?.quality ?? 0.8,
                selectionLimit: options?.maxSelection ?? 10,
            });

            if (!result.canceled && result.assets) {
                const selectedImages: SelectedImage[] = result.assets.map(asset => ({
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: !asset.type ? undefined : asset.type,
                    fileName: asset.fileName || undefined,
                }));

                setImages(prev => [...prev, ...selectedImages]);
                return selectedImages;
            }
            return [];
        } catch (error) {
            console.error('Error picking images from gallery:', error);
            Alert.alert('Błąd', 'Nie udało się wybrać zdjęć');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Zrób zdjęcie kamerą
    const pickFromCamera = useCallback(async (options?: ImagePickerOptions): Promise<SelectedImage | null> => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return null;

        setLoading(true);
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: options?.allowsEditing ?? false,
                aspect: options?.aspect,
                quality: options?.quality ?? 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const selectedImage: SelectedImage = {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: !asset.type ? undefined : asset.type,
                    fileName: asset.fileName || undefined,
                };

                // Zapisz zdjęcie do galerii telefonu
                try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        await MediaLibrary.saveToLibraryAsync(asset.uri);
                    }
                } catch (e) {
                    console.warn('Could not save photo to gallery:', e);
                }

                setImages(prev => [...prev, selectedImage]);
                return selectedImage;
            }
            return null;
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Błąd', 'Nie udało się zrobić zdjęcia');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Usuń zdjęcie z listy
    const removeImage = useCallback((uri: string) => {
        setImages(prev => prev.filter(img => img.uri !== uri));
    }, []);

    // Wyczyść wszystkie zdjęcia
    const clearImages = useCallback(() => {
        setImages([]);
    }, []);

    return {
        images,
        loading,
        pickFromGallery,
        pickFromCamera,
        removeImage,
        clearImages,
        setImages,
    };
};

export type { SelectedImage, ImagePickerOptions };