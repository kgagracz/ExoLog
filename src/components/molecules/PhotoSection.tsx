import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import {useAnimalPhotos} from "../../hooks/useAnimalPhotos";
import {useTheme} from "../../context/ThemeContext";
import {useImagePicker} from "../../hooks/useImagePicker";
import { useAnimalQuery } from '../../api/animals/useAnimalQuery';
import { queryKeys } from '../../api/queryKeys';
import SectionCard from "../atoms/SectionCard";
import PhotoGallery from "./PhotoGallery";
import PhotoViewerModal from "../organisms/PhotoVievewModal";
import PhotoUploadModal, { PhotoUploadData } from "../organisms/PhotoUploadModal";
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
    const queryClient = useQueryClient();
    const { data: animal } = useAnimalQuery(animalId);

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
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [pendingImages, setPendingImages] = useState<string[]>([]);

    useEffect(() => {
        loadPhotos();
    }, [loadPhotos]);

    const handleAddFromGallery = async () => {
        const selected = await pickFromGallery({ maxSelection: 5 });
        if (selected.length > 0) {
            const uris = selected.map(img => img.uri);
            setPendingImages(uris);
            setUploadModalVisible(true);
        }
    };

    const handleAddFromCamera = async () => {
        const photo = await pickFromCamera();
        if (photo) {
            setPendingImages([photo.uri]);
            setUploadModalVisible(true);
        }
    };

    const handleUploadConfirm = async (data: PhotoUploadData) => {
        setUploadModalVisible(false);
        const hasUpdates = data.bodyLength != null || data.stage != null;
        const success = await uploadPhotos(pendingImages, {
            description: data.description || undefined,
            bodyLength: data.bodyLength,
            stage: data.stage,
            currentMeasurements: animal?.measurements,
        });
        if (hasUpdates && success) {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
        }
        if (!success && error) {
            Alert.alert('Błąd', error);
        }
        setPendingImages([]);
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
        description: p.description,
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

            <PhotoUploadModal
                visible={uploadModalVisible}
                imageUris={pendingImages}
                initialBodyLength={animal?.measurements?.length ?? null}
                initialStage={animal?.specificData?.currentStage as number ?? null}
                onConfirm={handleUploadConfirm}
                onDismiss={() => {
                    setUploadModalVisible(false);
                    setPendingImages([]);
                }}
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