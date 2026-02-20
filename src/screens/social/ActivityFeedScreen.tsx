import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useActivityFeedQuery, useFollowingQuery } from '../../api/social';
import { Theme } from '../../styles/theme';
import Text from '../../components/atoms/Text';
import type { ActivityItem } from '../../types/social';

function formatRelativeDate(dateStr: string, t: (key: string, opts?: any) => string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('activityFeed.justNow');
    if (diffMin < 60) return t('activityFeed.minutesAgo', { count: diffMin });
    if (diffHours < 24) return t('activityFeed.hoursAgo', { count: diffHours });
    return t('activityFeed.daysAgo', { count: diffDays });
}

export default function ActivityFeedScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const { t } = useTranslation('social');
    const tabBarHeight = useBottomTabBarHeight();

    const { data: following = [] } = useFollowingQuery();
    const { data: activities = [], isLoading, refetch } = useActivityFeedQuery();

    const hasFollowing = following.length > 0;

    const renderActivityItem = ({ item }: { item: ActivityItem }) => {
        const isPhoto = item.activityType === 'photo_added';
        const icon = isPhoto ? 'camera' : 'swap-vertical';
        const description = isPhoto
            ? t('activityFeed.photoAdded', { user: item.actorDisplayName, animal: item.animalName })
            : t('activityFeed.moltingRegistered', {
                user: item.actorDisplayName,
                animal: item.animalName,
                from: item.moltingData?.previousStage,
                to: item.moltingData?.newStage,
            });

        return (
            <Card
                style={styles.activityCard}
                    onPress={() => navigation.navigate('UserAnimalDetails', { animalId: item.animalId })}
            >
                <Card.Content style={styles.activityContent}>
                    <View style={[styles.iconContainer, { backgroundColor: isPhoto ? theme.colors.primary + '20' : theme.colors.success + '20' }]}>
                        <MaterialCommunityIcons
                            name={icon}
                            size={24}
                            color={isPhoto ? theme.colors.primary : theme.colors.success}
                        />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text variant="body" style={styles.activityText}>{description}</Text>
                        <Text variant="caption" style={styles.activityTime}>
                            {formatRelativeDate(item.createdAt, t)}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('activityFeed.title')} />
            </Appbar.Header>

            {!hasFollowing || activities.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                        name="timeline-text-outline"
                        size={64}
                        color={theme.colors.textLight}
                    />
                    <Text variant="body" style={styles.emptyText}>
                        {t('activityFeed.empty')}
                    </Text>
                    <Text variant="caption" style={styles.emptyHint}>
                        {t('activityFeed.emptyHint')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(item) => item.id}
                    renderItem={renderActivityItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: tabBarHeight + 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refetch}
                            colors={[theme.colors.primary]}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
            )}
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        marginTop: 16,
        textAlign: 'center',
    },
    emptyHint: {
        color: theme.colors.textLight,
        marginTop: 4,
        textAlign: 'center',
    },
    activityCard: {
        backgroundColor: theme.colors.surface,
    },
    activityContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityInfo: {
        marginLeft: 12,
        flex: 1,
    },
    activityText: {
        color: theme.colors.textPrimary,
    },
    activityTime: {
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
});
