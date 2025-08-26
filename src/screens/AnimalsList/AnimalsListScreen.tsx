import React from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme"; // Załóżmy że masz taki kontekst

const AnimalsListScreen = () => {
    const { theme } = useTheme();

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor={theme.colors.primary}
                translucent={false}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>🕷️ Moje Ptaszniki</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Placeholder dla zawartości */}
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Tutaj będzie lista ptaszników
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    header: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.medium,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...theme.shadows.medium,
        ...Platform.select({
            ios: {
                paddingTop: theme.spacing.medium,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    headerTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textInverse,
        letterSpacing: 0.5,
    },

    addButton: {
        width: theme.sizes.button.medium.height - 8, // 32px
        height: theme.sizes.button.medium.height - 8,
        borderRadius: theme.borderRadius.large,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        borderColor: theme.colors.textInverse,
        alignItems: 'center',
        justifyContent: 'center',
    },

    addButtonText: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.light,
        color: theme.colors.textInverse,
    },

    content: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
        padding: theme.spacing.medium,
    },

    // Placeholder styles - usuń gdy dodasz prawdziwą zawartość
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.large,
        ...theme.shadows.small,
    },

    placeholderText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    },
});

export default AnimalsListScreen;