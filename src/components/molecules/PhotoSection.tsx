import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import {useAnimalPhotos} from "../../hooks/useAnimalPhotos";
import {useTheme} from "../../context/ThemeContext";
import {useImagePicker} from "../../hooks/useImagePicker";
import SectionCard from "../atoms/SectionCard";
import PhotoGallery from "./PhotoGallery";
import PhotoViewerModal from "../organisms/PhotoVievewModal";
import {Theme} from "../../styles/theme";

interface PhotosSectionProps {
    userId: string;
    animalId: string;
    editable?: boolean;
    maxDisplay?: number;
    onSeeAll?: () => void;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({
                                                         userId,
                                                         animalId,
                                                         editable = true,
                                                         maxDisplay = 4,
                                                         onSeeAll,
                                                     }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const {
        photos,
        loading,
        uploading,
        error,
        loadPhotos,
        uploadPhotos,
        deletePhoto,
        setMainPhoto,
    } = useAnimalPhotos(userId, animalId);

    const { pickFromGallery, pickFromCamera } = useImagePicker();

    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        loadPhotos();
    }, [loadPhotos]);

    const handleAddFromGallery = async () => {
        const selected = await pickFromGallery({ maxSelection: 5 });
        if (selected.length > 0) {
            const uris = selected.map(img => img.uri);
            const success = await uploadPhotos(uris);
            if (!success && error) {
                Alert.alert('Błąd', error);
            }
        }
    };

    const handleAddFromCamera = async () => {
        const photo = await pickFromCamera();
        if (photo) {
            const success = await uploadPhotos([photo.uri]);
            if (!success && error) {
                Alert.alert('Błąd', error);
            }
        }
    };

    const handlePhotoPress = (photo: any, index: number) => {
        setSelectedIndex(index);
        setViewerVisible(true);
    };

    const handleRemovePhoto = (photo: any) => {
        Alert.alert(
            'Usuń zdjęcie',
            'Czy na pewno chcesz usunąć to zdjęcie?',
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Usuń',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deletePhoto(photo.id, photo.path);
                        if (!success) {
                            Alert.alert('Błąd', 'Nie udało się usunąć zdjęcia');
                        }
                    },
                },
            ]
        );
    };

    const handleSetMainPhoto = async (photo: any) => {
        const success = await setMainPhoto(photo.id);
        if (!success) {
            Alert.alert('Błąd', 'Nie udało się ustawić głównego zdjęcia');
        }
    };

    const handleDeleteFromViewer = (photo: any) => {
        setViewerVisible(false);
        handleRemovePhoto(photo);
    };

    const handleSetMainFromViewer = async (photo: any) => {
        await handleSetMainPhoto(photo);
    };

    // Mapuj photos do formatu oczekiwanego przez PhotoGallery
    const galleryPhotos = photos.map(p => ({
        id: p.id,
        url: p.url,
        isMain: p.isMain,
        path: p.path,
    }));

    return (
        <SectionCard title="Zdjęcia" icon="camera">
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            ) : (
                <>
                    {uploading && (
                        <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                            <Text style={styles.uploadingText}>Przesyłanie...</Text>
                        </View>
                    )}

                    <PhotoGallery
                        photos={galleryPhotos}
                        editable={editable}
                        maxDisplay={maxDisplay}
                        horizontal
                        onPhotoPress={handlePhotoPress}
                        onRemovePhoto={handleRemovePhoto}
                        onSetMainPhoto={handleSetMainPhoto}
                        onAddFromGallery={handleAddFromGallery}
                        onAddFromCamera={handleAddFromCamera}
                        emptyMessage="Brak zdjęć. Dodaj pierwsze!"
                    />

                    {photos.length > maxDisplay && onSeeAll && (
                        <Button
                            mode="text"
                            onPress={onSeeAll}
                            style={styles.seeAllButton}
                        >
                            Zobacz wszystkie ({photos.length})
                        </Button>
                    )}
                </>
            )}

            <PhotoViewerModal
                visible={viewerVisible}
                photos={galleryPhotos}
                initialIndex={selectedIndex}
                onClose={() => setViewerVisible(false)}
                onDelete={editable ? handleDeleteFromViewer : undefined}
                onSetMain={editable ? handleSetMainFromViewer : undefined}
            />
        </SectionCard>
    );
};

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        loadingContainer: {
            padding: theme.spacing.large,
            alignItems: 'center',
        },
        uploadingOverlay: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.small,
            backgroundColor: theme.colors.primaryContainer,
            borderRadius: theme.borderRadius.small,
            marginBottom: theme.spacing.small,
        },
        uploadingText: {
            marginLeft: theme.spacing.small,
            color: theme.colors.primary,
            fontWeight: '500',
        },
        seeAllButton: {
            marginTop: theme.spacing.small,
        },
    });

export default PhotosSection;