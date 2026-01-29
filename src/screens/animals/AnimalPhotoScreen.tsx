import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { Appbar, FAB, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { useImagePicker } from '../../hooks/useImagePicker';
import { Theme } from '../../styles/theme';
import PhotoGallery from '../../components/molecules/PhotoGallery';
import PhotoViewerModal from "../../components/organisms/PhotoVievewModal";

type RouteParams = {
    AnimalPhotos: {
        animalId: string;
        animalName: string;
    };
};

export default function AnimalPhotosScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'AnimalPhotos'>>();
    const { animalId, animalName } = route.params;
    const { user } = useAuth();

    const {
        photos,
        loading,
        uploading,
        error,
        loadPhotos,
        uploadPhotos,
        deletePhoto,
        setMainPhoto,
    } = useAnimalPhotos(user?.uid || '', animalId);

    const { pickFromGallery, pickFromCamera } = useImagePicker();

    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);

    useEffect(() => {
        loadPhotos();
    }, [loadPhotos]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadPhotos();
        setRefreshing(false);
    };

    const handleAddFromGallery = async () => {
        const selected = await pickFromGallery({ maxSelection: 10 });
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
        if (success) {
            Alert.alert('Sukces', 'Ustawiono jako główne zdjęcie');
        } else {
            Alert.alert('Błąd', 'Nie udało się ustawić głównego zdjęcia');
        }
    };

    const handleDeleteFromViewer = (photo: any) => {
        setViewerVisible(false);
        handleRemovePhoto(photo);
    };

    const galleryPhotos = photos.map(p => ({
        id: p.id,
        url: p.url,
        isMain: p.isMain,
        path: p.path,
    }));

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={`Zdjęcia: ${animalName}`} />
            </Appbar.Header>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Ładowanie zdjęć...</Text>
                    </View>
                ) : photos.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📷</Text>
                        <Text style={styles.emptyTitle}>Brak zdjęć</Text>
                        <Text style={styles.emptyText}>
                            Dodaj pierwsze zdjęcie tego pająka używając przycisku poniżej
                        </Text>
                    </View>
                ) : (
                    <>
                        {uploading && (
                            <View style={styles.uploadingBanner}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={styles.uploadingText}>Przesyłanie zdjęć...</Text>
                            </View>
                        )}

                        <PhotoGallery
                            photos={galleryPhotos}
                            editable
                            onPhotoPress={handlePhotoPress}
                            onRemovePhoto={handleRemovePhoto}
                            onSetMainPhoto={handleSetMainPhoto}
                            showAddButton={false}
                        />

                        <Text style={styles.infoText}>
                            {photos.length} {photos.length === 1 ? 'zdjęcie' :
                            photos.length < 5 ? 'zdjęcia' : 'zdjęć'}
                        </Text>
                    </>
                )}
            </ScrollView>

            <FAB.Group
                open={fabOpen}
                visible
                icon={fabOpen ? 'close' : 'camera-plus'}
                actions={[
                    {
                        icon: 'image-multiple',
                        label: 'Z galerii',
                        onPress: handleAddFromGallery,
                    },
                    {
                        icon: 'camera',
                        label: 'Zrób zdjęcie',
                        onPress: handleAddFromCamera,
                    },
                ]}
                onStateChange={({ open }) => setFabOpen(open)}
                fabStyle={styles.fab}
            />

            <PhotoViewerModal
                visible={viewerVisible}
                photos={galleryPhotos}
                initialIndex={selectedIndex}
                onClose={() => setViewerVisible(false)}
                onDelete={handleDeleteFromViewer}
                onSetMain={handleSetMainPhoto}
            />
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            backgroundColor: theme.colors.surface,
        },
        content: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        loadingText: {
            marginTop: theme.spacing.medium,
            color: theme.colors.textSecondary,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
            paddingHorizontal: theme.spacing.xl,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: theme.spacing.medium,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.small,
        },
        emptyText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        uploadingBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.medium,
            backgroundColor: theme.colors.primaryContainer,
            marginHorizontal: theme.spacing.medium,
            marginTop: theme.spacing.medium,
            borderRadius: theme.borderRadius.medium,
        },
        uploadingText: {
            marginLeft: theme.spacing.small,
            color: theme.colors.primary,
            fontWeight: '500',
        },
        infoText: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
            padding: theme.spacing.medium,
        },
        fab: {
            backgroundColor: theme.colors.primary,
        },
    });