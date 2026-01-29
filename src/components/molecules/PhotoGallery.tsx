import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import {useTheme} from "../../context/ThemeContext";
import PhotoThumbnail from "./PhotoThumbnail";
import ImagePickerButton from "../atoms/ImagePickerButton";
import {Theme} from "../../styles/theme";

interface Photo {
    id: string;
    uri?: string;
    url?: string;
    isMain?: boolean;
}

interface PhotoGalleryProps {
    photos: Photo[];
    loading?: boolean;
    editable?: boolean;
    onPhotoPress?: (photo: Photo, index: number) => void;
    onRemovePhoto?: (photo: Photo) => void;
    onSetMainPhoto?: (photo: Photo) => void;
    onAddFromGallery?: () => void;
    onAddFromCamera?: () => void;
    emptyMessage?: string;
    maxDisplay?: number;
    horizontal?: boolean;
    showAddButton?: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
                                                       photos,
                                                       loading = false,
                                                       editable = false,
                                                       onPhotoPress,
                                                       onRemovePhoto,
                                                       onSetMainPhoto,
                                                       onAddFromGallery,
                                                       onAddFromCamera,
                                                       emptyMessage = 'Brak zdjęć',
                                                       maxDisplay,
                                                       horizontal = false,
                                                       showAddButton = true,
                                                   }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme, horizontal);

    const displayPhotos = maxDisplay ? photos.slice(0, maxDisplay) : photos;
    const hasMore = maxDisplay && photos.length > maxDisplay;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Ładowanie zdjęć...</Text>
            </View>
        );
    }

    const renderPhotos = () => (
        <>
            {displayPhotos.map((photo, index) => (
                <View key={photo.id} style={styles.photoItem}>
                    <PhotoThumbnail
                        uri={photo.url || photo.uri || ''}
                        isMain={photo.isMain}
                        onPress={() => onPhotoPress?.(photo, index)}
                        onRemove={editable ? () => onRemovePhoto?.(photo) : undefined}
                        onSetMain={editable ? () => onSetMainPhoto?.(photo) : undefined}
                        showActions={editable}
                    />
                </View>
            ))}

            {hasMore && (
                <View style={styles.moreIndicator}>
                    <Text style={styles.moreText}>+{photos.length - maxDisplay!}</Text>
                </View>
            )}

            {showAddButton && editable && onAddFromGallery && onAddFromCamera && (
                <View style={styles.photoItem}>
                    <ImagePickerButton
                        onPickFromGallery={onAddFromGallery}
                        onPickFromCamera={onAddFromCamera}
                        size="medium"
                        label="Dodaj"
                    />
                </View>
            )}
        </>
    );

    if (photos.length === 0 && !editable) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    if (photos.length === 0 && editable && showAddButton && onAddFromGallery && onAddFromCamera) {
        return (
            <View style={styles.container}>
                <ImagePickerButton
                    onPickFromGallery={onAddFromGallery}
                    onPickFromCamera={onAddFromCamera}
                    size="large"
                    label="Dodaj pierwsze zdjęcie"
                />
            </View>
        );
    }

    if (horizontal) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalContent}
            >
                {renderPhotos()}
            </ScrollView>
        );
    }

    return (
        <View style={styles.gridContainer}>
            {renderPhotos()}
        </View>
    );
};

const makeStyles = (theme: Theme, horizontal: boolean) => {
    const { width } = Dimensions.get('window');
    const itemsPerRow = 4;
    const spacing = theme.spacing.small;
    const itemSize = (width - spacing * (itemsPerRow + 1)) / itemsPerRow;

    return StyleSheet.create({
        container: {
            alignItems: 'center',
            padding: theme.spacing.medium,
        },
        loadingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.medium,
        },
        loadingText: {
            marginLeft: theme.spacing.small,
            color: theme.colors.textSecondary,
        },
        emptyContainer: {
            padding: theme.spacing.large,
            alignItems: 'center',
        },
        emptyText: {
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
        },
        horizontalContent: {
            paddingHorizontal: theme.spacing.medium,
            gap: theme.spacing.small,
            flexDirection: 'row',
            alignItems: 'center',
        },
        gridContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: spacing / 2,
        },
        photoItem: {
            margin: spacing / 2,
        },
        moreIndicator: {
            width: 80,
            height: 80,
            borderRadius: theme.borderRadius.medium,
            backgroundColor: theme.colors.surfaceLight,
            justifyContent: 'center',
            alignItems: 'center',
            margin: spacing / 2,
        },
        moreText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
    });
};

export default PhotoGallery;