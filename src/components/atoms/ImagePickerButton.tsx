import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Text, ActivityIndicator, Menu } from 'react-native-paper';
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";

interface ImagePickerButtonProps {
    onPickFromGallery: () => void;
    onPickFromCamera: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'icon' | 'button' | 'card';
    size?: 'small' | 'medium' | 'large';
    label?: string;
}

const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
                                                                 onPickFromGallery,
                                                                 onPickFromCamera,
                                                                 loading = false,
                                                                 disabled = false,
                                                                 variant = 'card',
                                                                 size = 'medium',
                                                                 label = 'Dodaj zdjęcie',
                                                             }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme, size);
    const [menuVisible, setMenuVisible] = React.useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleGallery = () => {
        closeMenu();
        onPickFromGallery();
    };

    const handleCamera = () => {
        closeMenu();
        onPickFromCamera();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    if (variant === 'icon') {
        return (
            <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                    <IconButton
                        icon="camera-plus"
                        size={size === 'small' ? 20 : size === 'large' ? 32 : 24}
                        iconColor={theme.colors.primary}
                        onPress={openMenu}
                        disabled={disabled}
                    />
                }
            >
                <Menu.Item
                    onPress={handleGallery}
                    title="Wybierz z galerii"
                    leadingIcon="image"
                />
                <Menu.Item
                    onPress={handleCamera}
                    title="Zrób zdjęcie"
                    leadingIcon="camera"
                />
            </Menu>
        );
    }

    if (variant === 'button') {
        return (
            <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                    <TouchableOpacity
                        style={[styles.button, disabled && styles.buttonDisabled]}
                        onPress={openMenu}
                        disabled={disabled}
                    >
                        <IconButton
                            icon="camera-plus"
                            size={20}
                            iconColor={theme.colors.textInverse}
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>{label}</Text>
                    </TouchableOpacity>
                }
            >
                <Menu.Item
                    onPress={handleGallery}
                    title="Wybierz z galerii"
                    leadingIcon="image"
                />
                <Menu.Item
                    onPress={handleCamera}
                    title="Zrób zdjęcie"
                    leadingIcon="camera"
                />
            </Menu>
        );
    }

    // Card variant (default)
    return (
        <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
                <TouchableOpacity
                    style={[styles.card, disabled && styles.cardDisabled]}
                    onPress={openMenu}
                    disabled={disabled}
                >
                    <View style={styles.cardContent}>
                        <IconButton
                            icon="camera-plus"
                            size={size === 'small' ? 24 : size === 'large' ? 48 : 36}
                            iconColor={disabled ? theme.colors.textLight : theme.colors.primary}
                        />
                        <Text style={[styles.cardLabel, disabled && styles.cardLabelDisabled]}>
                            {label}
                        </Text>
                    </View>
                </TouchableOpacity>
            }
        >
            <Menu.Item
                onPress={handleGallery}
                title="Wybierz z galerii"
                leadingIcon="image"
            />
            <Menu.Item
                onPress={handleCamera}
                title="Zrób zdjęcie"
                leadingIcon="camera"
            />
        </Menu>
    );
};

const makeStyles = (theme: Theme, size: 'small' | 'medium' | 'large') => {
    const cardSize = size === 'small' ? 80 : size === 'large' ? 150 : 120;

    return StyleSheet.create({
        container: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingContainer: {
            width: cardSize,
            height: cardSize,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: theme.borderRadius.medium,
        },
        card: {
            width: cardSize,
            height: cardSize,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: theme.borderRadius.medium,
            borderWidth: 2,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardDisabled: {
            opacity: 0.5,
        },
        cardContent: {
            alignItems: 'center',
        },
        cardLabel: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: -8,
        },
        cardLabelDisabled: {
            color: theme.colors.textLight,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
            paddingVertical: 8,
            paddingHorizontal: 16,
            paddingLeft: 8,
        },
        buttonDisabled: {
            backgroundColor: theme.colors.border,
        },
        buttonIcon: {
            margin: 0,
        },
        buttonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.fontSize.base,
            fontWeight: '500',
            marginLeft: -4,
        },
    });
};

export default ImagePickerButton;