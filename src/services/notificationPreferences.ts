import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notificationPreferences';

export interface NotificationPreferences {
    moltReminders: boolean;
    cocoonReminders: boolean;
    followedUserActivity: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    moltReminders: true,
    cocoonReminders: true,
    followedUserActivity: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
}

export async function setNotificationPreferences(
    partial: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}
