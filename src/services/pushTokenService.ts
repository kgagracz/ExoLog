import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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
            return;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        await socialService.savePushToken(userId, tokenData.data);
    } catch (error) {
        console.error('Error registering push token:', error);
    }
}

export async function unregisterPushToken(userId: string): Promise<void> {
    try {
        await socialService.removePushToken(userId);
    } catch (error) {
        console.error('Error unregistering push token:', error);
    }
}
