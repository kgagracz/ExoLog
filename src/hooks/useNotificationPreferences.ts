import { useState, useEffect, useCallback } from 'react';
import {
    getNotificationPreferences,
    setNotificationPreferences,
    NotificationPreferences,
} from '../services/notificationPreferences';
import { cancelNotificationsByType } from '../services/notificationService';

export function useNotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        moltReminders: true,
        cocoonReminders: true,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNotificationPreferences()
            .then(setPreferences)
            .finally(() => setLoading(false));
    }, []);

    const toggleMoltReminders = useCallback(async (value: boolean) => {
        const updated = await setNotificationPreferences({ moltReminders: value });
        setPreferences(updated);
        if (!value) {
            await cancelNotificationsByType('molt');
        }
    }, []);

    const toggleCocoonReminders = useCallback(async (value: boolean) => {
        const updated = await setNotificationPreferences({ cocoonReminders: value });
        setPreferences(updated);
        if (!value) {
            await cancelNotificationsByType('cocoon');
        }
    }, []);

    return { preferences, loading, toggleMoltReminders, toggleCocoonReminders };
}
