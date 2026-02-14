import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {MD3DarkTheme, PaperProvider} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import {AuthProvider} from "./hooks/useAuth";
import AppNavigator from "./navigation/AppNavigator";
import {useTheme} from "./context/ThemeContext";
import {Theme} from "./styles/theme";
import {initializeAppData} from "./services/firebase";


const createPaperTheme = (theme: Theme) => ({
    ...MD3DarkTheme,
    ...theme,
    colors: {
        ...MD3DarkTheme.colors,
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
});

export default function App() {
    const {theme, isDark} = useTheme()
    const paperTheme = createPaperTheme(theme)
    console.log(isDark)
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <PaperProvider theme={paperTheme}>
                    <AuthProvider>
                        <NavigationContainer>
                            <AppNavigator />
                            <StatusBar style="light" backgroundColor={theme.colors.background} />
                        </NavigationContainer>
                    </AuthProvider>
                </PaperProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}