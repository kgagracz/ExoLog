import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import {AuthProvider} from "./hooks/useAuth";
import AppNavigator from "./navigation/AppNavigator";
import {ThemeProvider, useTheme} from "./context/ThemeContext";
import {Theme} from "./styles/theme";

const createPaperTheme = (theme: Theme, isDark: boolean) => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
        ...base,
        ...theme,
        dark: isDark,
        colors: {
            ...base.colors,
            ...theme.colors,
            primary: theme.colors.primary,
            onPrimary: '#FFFFFF',
            primaryContainer: theme.colors.secondary,
            onPrimaryContainer: '#000000',
            secondary: theme.colors.secondary,
            onSecondary: '#FFFFFF',
            background: theme.colors.background,
            onBackground: theme.colors.text,
            surface: theme.colors.surface,
            onSurface: theme.colors.text,
            surfaceVariant: theme.colors.border,
            onSurfaceVariant: theme.colors.textSecondary,
            outline: theme.colors.border,
            error: theme.colors.error,
            onError: '#FFFFFF',
        },
    };
};

function AppContent() {
    const {theme, isDark} = useTheme();
    const paperTheme = createPaperTheme(theme, isDark);

    return (
        <PaperProvider theme={paperTheme}>
            <AuthProvider>
                <NavigationContainer>
                    <AppNavigator />
                    <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
                </NavigationContainer>
            </AuthProvider>
        </PaperProvider>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
