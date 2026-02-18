import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import AuthNavigator from './AuthNavigator';
import {useAuth} from "../hooks";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useTheme} from "../context/ThemeContext";
import {Theme} from "../styles/theme";
import TabNavigator from "./TabNavigator";
import { registerForNotifications } from "../services/notificationService";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();
    const {theme} = useTheme();
    const {t} = useTranslation('navigation');
    const styles = createStyles(theme)

    useEffect(() => {
        if (user) {
            registerForNotifications();
        }
    }, [user]);

    // Pokaż loading screen podczas sprawdzania stanu uwierzytelnienia
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="Main" component={TabNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 16,
        color: theme.colors.text,
        fontSize: 16,
    },
});
