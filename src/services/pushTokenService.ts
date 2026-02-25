import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { socialService } from './firebase';

export async function registerAndStorePushToken(userId: string): Promise<void> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('[PushToken] Permission not granted:', finalStatus);
            return;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
            console.warn('[PushToken] Missing EAS projectId — Constants.expoConfig:', JSON.stringify(Constants.expoConfig));
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        console.log('[PushToken] Token obtained:', tokenData.data);

        const result = await socialService.savePushToken(userId, tokenData.data);
        if (!result.success) {
            console.error('[PushToken] Failed to save token to Firestore:', result.error);
        } else {
            console.log('[PushToken] Token saved successfully for user:', userId);
        }
    } catch (error) {
        console.error('[PushToken] Error registering push token:', error);
        if (__DEV__) {
            Alert.alert(
                'Push Token Error',
                `Nie udało się zarejestrować powiadomień push.\n\n${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function unregisterPushToken(userId: string): Promise<void> {
    try {
        await socialService.removePushToken(userId);
    } catch (error) {
        console.error('Error unregistering push token:', error);
    }
}
