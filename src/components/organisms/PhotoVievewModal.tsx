import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Image,
    Dimensions,
    StatusBar,
    Animated,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import type { IOnMove } from 'react-native-image-pan-zoom';
import { IconButton, Text } from 'react-native-paper';
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";

const ZoomableImage = ImageZoom as unknown as React.ComponentType<
    React.ComponentProps<typeof ImageZoom> & { children: React.ReactNode }
>;

interface Photo {
    id: string;
    uri?: string;
    url?: string;
    isMain?: boolean;
    description?: string;
}

interface PhotoViewerModalProps {
    visible: boolean;
    photos: Photo[];
    initialIndex?: number;
    onClose: () => void;
    onDelete?: (photo: Photo) => void;
    onSetMain?: (photo: Photo) => void;
}

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.2;

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
                                                               visible,
                                                               photos,
                                                               initialIndex = 0,
                                                               onClose,
                                                               onDelete,
                                                               onSetMain,
                                                           }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const currentIndexRef = useRef(initialIndex);
    const swipeOffsetRef = useRef(0);
    const scrollX = useRef(new Animated.Value(-initialIndex * width)).current;

    const currentPhoto = photos[currentIndex];

    useEffect(() => {
        currentIndexRef.current = initialIndex;
        setCurrentIndex(initialIndex);
        setIsZoomed(false);
        scrollX.setValue(-initialIndex * width);
    }, [initialIndex, visible, scrollX]);

    const handleZoomChange = useCallback((position: IOnMove) => {
        setIsZoomed(position.scale > 1.05);
    }, []);

    const handleHorizontalOuterRange = useCallback((offsetX: number) => {
        swipeOffsetRef.current = offsetX;
        if (!isZoomed) {
            scrollX.setValue(-currentIndexRef.current * width + offsetX);
        }
    }, [isZoomed, scrollX]);

    const handleResponderRelease = useCallback(() => {
        const offset = swipeOffsetRef.current;
        swipeOffsetRef.current = 0;

        if (isZoomed) return;

        const idx = currentIndexRef.current;
        let targetIndex = idx;

        if (offset < -SWIPE_THRESHOLD && idx < photos.length - 1) {
            targetIndex = idx + 1;
        } else if (offset > SWIPE_THRESHOLD && idx > 0) {
            targetIndex = idx - 1;
        }

        currentIndexRef.current = targetIndex;

        Animated.spring(scrollX, {
            toValue: -targetIndex * width,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
        }).start(({ finished }) => {
            if (finished) {
                setCurrentIndex(targetIndex);
                setIsZoomed(false);
            }
        });
    }, [isZoomed, photos.length, scrollX]);

    // Render only nearby photos for performance
    const renderSlot = (index: number) => {
        if (index < 0 || index >= photos.length) return null;
        const photo = photos[index];
        const isCenter = index === currentIndex;

        return (
            <View key={photo.id} style={[styles.photoSlot, { left: index * width }]}>
                {isCenter ? (
                    <ZoomableImage
                        key={photo.id}
                        cropWidth={width}
                        cropHeight={height}
                        imageWidth={width}
                        imageHeight={height * 0.8}
                        enableDoubleClickZoom
                        minScale={1}
                        maxScale={4}
                        onMove={handleZoomChange}
                        horizontalOuterRangeOffset={handleHorizontalOuterRange}
                        responderRelease={handleResponderRelease}
                    >
                        <Image
                            source={{ uri: photo.url || photo.uri }}
                            style={styles.photo}
                            resizeMode="contain"
                        />
                    </ZoomableImage>
                ) : (
                    <Image
                        source={{ uri: photo.url || photo.uri }}
                        style={styles.photo}
                        resizeMode="contain"
                    />
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <IconButton
                        icon="close"
                        iconColor="#fff"
                        size={28}
                        onPress={onClose}
                    />
                    <Text style={styles.counter}>
                        {currentIndex + 1} / {photos.length}
                    </Text>
                    <View style={styles.headerActions}>
                        {onSetMain && currentPhoto && !currentPhoto.isMain && (
                            <IconButton
                                icon="star-outline"
                                iconColor="#fff"
                                size={24}
                                onPress={() => onSetMain(currentPhoto)}
                            />
                        )}
                        {onDelete && currentPhoto && (
                            <IconButton
                                icon="delete-outline"
                                iconColor="#fff"
                                size={24}
                                onPress={() => onDelete(currentPhoto)}
                            />
                        )}
                    </View>
                </View>

                {/* Photo strip — continuous scroll, no reset */}
                <Animated.View style={[styles.strip, { transform: [{ translateX: scrollX }] }]}>
                    {renderSlot(currentIndex - 1)}
                    {renderSlot(currentIndex)}
                    {renderSlot(currentIndex + 1)}
                </Animated.View>

                {/* Description */}
                {currentPhoto?.description ? (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>
                            {currentPhoto.description}
                        </Text>
                    </View>
                ) : null}

                {/* Indicators */}
                {photos.length > 1 && (
                    <View style={styles.indicators}>
                        {photos.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    index === currentIndex && styles.indicatorActive,
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* Main badge */}
                {currentPhoto?.isMain && (
                    <View style={styles.mainBadge}>
                        <Text style={styles.mainBadgeText}>★ Zdjęcie główne</Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: StatusBar.currentHeight || 44,
            paddingHorizontal: 8,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        headerActions: {
            flexDirection: 'row',
        },
        counter: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '500',
        },
        strip: {
            width: '100%',
            height,
        },
        photoSlot: {
            position: 'absolute',
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
        },
        photo: {
            width,
            height: height * 0.8,
        },
        indicators: {
            flexDirection: 'row',
            position: 'absolute',
            bottom: 60,
            alignSelf: 'center',
        },
        indicator: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.4)',
            marginHorizontal: 4,
        },
        indicatorActive: {
            backgroundColor: '#fff',
            width: 24,
        },
        descriptionContainer: {
            position: 'absolute',
            bottom: 120,
            left: 16,
            right: 16,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 8,
            padding: 12,
        },
        descriptionText: {
            color: '#fff',
            fontSize: 14,
            textAlign: 'center',
        },
        mainBadge: {
            position: 'absolute',
            bottom: 100,
            alignSelf: 'center',
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: theme.borderRadius.full,
        },
        mainBadgeText: {
            color: '#fff',
            fontWeight: '600',
        },
    });

export default PhotoViewerModal;
