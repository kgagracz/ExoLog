import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Badge } from 'react-native-paper';
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";

interface PhotoThumbnailProps {
    uri: string;
    isMain?: boolean;
    onPress?: () => void;
    onRemove?: () => void;
    onSetMain?: () => void;
    size?: 'small' | 'medium' | 'large';
    showActions?: boolean;
}

const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
                                                           uri,
                                                           isMain = false,
                                                           onPress,
                                                           onRemove,
                                                           onSetMain,
                                                           size = 'medium',
                                                           showActions = true,
                                                       }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme, size);

    return (
        <TouchableOpacity
            style={[styles.container, isMain && styles.containerMain]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />

            {isMain && (
                <View style={styles.mainBadge}>
                    <Badge style={styles.badge}>Główne</Badge>
                </View>
            )}

            {showActions && (
                <View style={styles.actionsContainer}>
                    {onRemove && (
                        <IconButton
                            icon="close"
                            size={16}
                            iconColor={theme.colors.textInverse}
                            style={styles.actionButton}
                            onPress={onRemove}
                        />
                    )}
                    {onSetMain && !isMain && (
                        <IconButton
                            icon="star-outline"
                            size={16}
                            iconColor={theme.colors.textInverse}
                            style={styles.actionButton}
                            onPress={onSetMain}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const makeStyles = (theme: Theme, size: 'small' | 'medium' | 'large') => {
    const imageSize = size === 'small' ? 60 : size === 'large' ? 120 : 80;

    return StyleSheet.create({
        container: {
            width: imageSize,
            height: imageSize,
            borderRadius: theme.borderRadius.medium,
            overflow: 'hidden',
            backgroundColor: theme.colors.surfaceLight,
        },
        containerMain: {
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        image: {
            width: '100%',
            height: '100%',
        },
        mainBadge: {
            position: 'absolute',
            bottom: 4,
            left: 4,
        },
        badge: {
            backgroundColor: theme.colors.primary,
            fontSize: 10,
        },
        actionsContainer: {
            position: 'absolute',
            top: 0,
            right: 0,
            flexDirection: 'row',
        },
        actionButton: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            margin: 2,
            width: 24,
            height: 24,
        },
    });
};

export default PhotoThumbnail;