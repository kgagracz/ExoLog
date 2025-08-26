// theme/themes.js
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const lightTheme = {
    colors: {
        // Podstawowe kolory tła i tekstu
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        surface: '#ffffff',
        surfaceLight: '#f1f5f9',
        text: '#000000',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280',
        textLight: '#9ca3af',
        textInverse: '#ffffff',

        // Kolory główne
        primary: '#6366f1',
        primaryLight: '#818cf8',
        primaryDark: '#4f46e5',
        secondary: '#8b5cf6',
        accent: '#f59e0b',

        // Kolory statusu
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',

        // Kolory granic i separatorów
        border: '#e5e7eb',
        borderLight: '#f3f4f6',
        divider: '#d1d5db',

        // Overlay
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Kolory dla wydarzeń ptaszników
        events: {
            molting: {
                background: '#fef3c7',
                color: '#f59e0b',
            },
            container: {
                background: '#dbeafe',
                color: '#3b82f6',
            },
            mating: {
                background: '#fce7f3',
                color: '#ec4899',
            },
            cocoon: {
                background: '#dcfce7',
                color: '#22c55e',
            },
            feeding: {
                background: '#fed7d7',
                color: '#ef4444',
            },
            photo: {
                background: '#e0e7ff',
                color: '#6366f1',
            },
        },
    },

    spacing: {
        xs: 4,
        small: 8,
        medium: 16,
        large: 24,
        xl: 32,
        xxl: 40,
    },

    borderRadius: {
        small: 4,
        medium: 8,
        large: 16,
        xl: 20,
        full: 9999,
    },

    // Typografia
    typography: {
        fontSize: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 30,
        },

        fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
        },

        lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Rozmiary
    sizes: {
        icon: {
            small: 16,
            medium: 24,
            large: 32,
            xl: 40,
        },

        avatar: {
            small: 32,
            medium: 40,
            large: 48,
            xl: 64,
        },

        button: {
            small: {
                height: 32,
                paddingHorizontal: 12,
                paddingVertical: 6,
            },
            medium: {
                height: 40,
                paddingHorizontal: 16,
                paddingVertical: 8,
            },
            large: {
                height: 48,
                paddingHorizontal: 20,
                paddingVertical: 12,
            },
        },

        input: {
            height: 48,
            paddingHorizontal: 16,
        },
    },

    // Cienie
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    },

    // Layout
    layout: {
        window: { width, height },
        container: { paddingHorizontal: 20 },
        header: { height: Platform.OS === 'ios' ? 88 : 64 },
    },
};

export const darkTheme = {
    colors: {
        // Podstawowe kolory tła i tekstu
        background: '#1f2937',
        backgroundSecondary: '#111827',
        surface: '#374151',
        surfaceLight: '#4b5563',
        text: '#ffffff',
        textPrimary: '#f9fafb',
        textSecondary: '#d1d5db',
        textLight: '#9ca3af',
        textInverse: '#000000',

        // Kolory główne
        primary: '#818cf8',
        primaryLight: '#a5b4fc',
        primaryDark: '#6366f1',
        secondary: '#a78bfa',
        accent: '#fbbf24',

        // Kolory statusu
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa',

        // Kolory granic i separatorów
        border: '#4b5563',
        borderLight: '#374151',
        divider: '#6b7280',

        // Overlay
        overlay: 'rgba(0, 0, 0, 0.7)',

        // Kolory dla wydarzeń ptaszników (dostosowane do dark mode)
        events: {
            molting: {
                background: '#451a03',
                color: '#fbbf24',
            },
            container: {
                background: '#1e3a8a',
                color: '#60a5fa',
            },
            mating: {
                background: '#831843',
                color: '#f472b6',
            },
            cocoon: {
                background: '#14532d',
                color: '#34d399',
            },
            feeding: {
                background: '#7f1d1d',
                color: '#f87171',
            },
            photo: {
                background: '#312e81',
                color: '#818cf8',
            },
        },
    },

    // Pozostałe właściwości takie same jak w lightTheme
    spacing: lightTheme.spacing,
    borderRadius: lightTheme.borderRadius,
    typography: lightTheme.typography,
    sizes: lightTheme.sizes,
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
        },
    },
    layout: lightTheme.layout,
};

export type Theme = typeof lightTheme