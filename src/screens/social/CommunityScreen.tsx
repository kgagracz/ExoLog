import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Badge, Divider } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useFriendsQuery, useIncomingRequestsQuery, useFollowingQuery } from '../../api/social';
import { Theme } from '../../styles/theme';
import Text from '../../components/atoms/Text';
import UserListItem from '../../components/molecules/UserListItem';

export default function CommunityScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { t } = useAppTranslation('social');

    const tabBarHeight = useBottomTabBarHeight();
    const { data: friends = [], isLoading: friendsLoading } = useFriendsQuery();
    const { data: following = [], isLoading: followingLoading } = useFollowingQuery();
    const { data: incomingRequests = [] } = useIncomingRequestsQuery();

    const pendingCount = incomingRequests.length;

    // Exclude friends from following list to avoid duplicates
    const friendIds = new Set(friends.flatMap((f) => f.userIds.filter((id) => id !== user?.uid)));
    const followingOnly = following.filter((f) => !friendIds.has(f.followingId));

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.Content title={t('community.title')} />
            </Appbar.Header>

            <View style={[styles.content, { paddingBottom: tabBarHeight }]}>
                {/* Search bar */}
                <TouchableOpacity
                    style={styles.searchBar}
                    onPress={() => navigation.navigate('UserSearch')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
                    <Text variant="body" style={styles.searchPlaceholder}>{t('community.searchPlaceholder')}</Text>
                </TouchableOpacity>

                {/* Activity Feed */}
                <TouchableOpacity
                    style={styles.requestsRow}
                    onPress={() => navigation.navigate('ActivityFeed')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="timeline-text" size={24} color={theme.colors.primary} />
                    <Text variant="body" style={styles.requestsText}>{t('community.activityFeed')}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {/* Friend requests section */}
                <TouchableOpacity
                    style={styles.requestsRow}
                    onPress={() => navigation.navigate('FriendRequests')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="account-clock" size={24} color={theme.colors.primary} />
                    <Text variant="body" style={styles.requestsText}>{t('community.friendRequests')}</Text>
                    {pendingCount > 0 && (
                        <Badge style={styles.badge}>{pendingCount}</Badge>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <Divider style={styles.divider} />

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Friends list */}
                    <Text variant="h3" style={styles.sectionTitle}>
                        {t('community.friendsCount', { count: friends.length })}
                    </Text>

                    {friends.length === 0 && !friendsLoading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-group-outline" size={64} color={theme.colors.textLight} />
                            <Text variant="body" style={styles.emptyText}>{t('community.noFriends')}</Text>
                            <Text variant="caption" style={styles.emptyHint}>
                                {t('community.noFriendsHint')}
                            </Text>
                        </View>
                    ) : (
                        friends.map((item) => {
                            const friendId = item.userIds.find((id) => id !== user?.uid) || '';
                            const friendData = item.users[friendId];

                            return (
                                <React.Fragment key={item.id}>
                                    <UserListItem
                                        displayName={friendData?.displayName || t('common:user')}
                                        onPress={() => navigation.navigate('UserProfile', { userId: friendId })}
                                    />
                                    <Divider style={styles.itemDivider} />
                                </React.Fragment>
                            );
                        })
                    )}

                    <Divider style={styles.divider} />

                    {/* Following list */}
                    <Text variant="h3" style={styles.sectionTitle}>
                        {t('community.followingCount', { count: followingOnly.length })}
                    </Text>

                    {followingOnly.length === 0 && !followingLoading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-eye-outline" size={64} color={theme.colors.textLight} />
                            <Text variant="body" style={styles.emptyText}>{t('community.noFollowing')}</Text>
                            <Text variant="caption" style={styles.emptyHint}>
                                {t('community.noFollowingHint')}
                            </Text>
                        </View>
                    ) : (
                        followingOnly.map((item) => (
                            <React.Fragment key={item.id}>
                                <UserListItem
                                    displayName={item.followingDisplayName}
                                    onPress={() => navigation.navigate('UserProfile', { userId: item.followingId })}
                                />
                                <Divider style={styles.itemDivider} />
                            </React.Fragment>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.medium,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: theme.spacing.ms,
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.ms,
        marginBottom: theme.spacing.medium,
        ...theme.shadows.small,
    },
    searchPlaceholder: {
        marginLeft: theme.spacing.small,
        color: theme.colors.textSecondary,
    },
    requestsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.ms,
    },
    requestsText: {
        flex: 1,
        marginLeft: theme.spacing.ms,
        color: theme.colors.textPrimary,
    },
    badge: {
        backgroundColor: theme.colors.error,
        marginRight: theme.spacing.small,
    },
    divider: {
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.small,
    },
    sectionTitle: {
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.ms,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.medium,
    },
    emptyHint: {
        color: theme.colors.textLight,
        marginTop: theme.spacing.xs,
    },
    itemDivider: {
        backgroundColor: theme.colors.borderLight,
        marginLeft: 72,
    },
});
