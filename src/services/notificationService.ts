import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForNotifications(): Promise<boolean> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Przypomnienia',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

export async function scheduleMoltReminder(
    animalName: string,
    moltDate: string,
): Promise<string | null> {
    const triggerDate = new Date(moltDate);
    triggerDate.setDate(triggerDate.getDate() + 7);

    if (triggerDate.getTime() <= Date.now()) {
        return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: i18n.t('notifications:moltReminder.title'),
            body: i18n.t('notifications:moltReminder.body', { name: animalName }),
            sound: 'default',
            data: { type: 'molt' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        },
    });

    return id;
}

export async function scheduleCocoonHatchReminder(
    animalName: string,
    estimatedHatchDate: string,
): Promise<string | null> {
    const triggerDate = new Date(estimatedHatchDate);
    triggerDate.setDate(triggerDate.getDate() - 3);

    if (triggerDate.getTime() <= Date.now()) {
        return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: i18n.t('notifications:cocoonReminder.title'),
            body: i18n.t('notifications:cocoonReminder.body', { name: animalName }),
            sound: 'default',
            data: { type: 'cocoon' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        },
    });

    return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelNotificationsByType(type: 'molt' | 'cocoon'): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(n => n.content.data?.type === type);
    await Promise.all(
        toCancel.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
}
