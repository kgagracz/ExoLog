import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Badge, Card, Divider } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useFriendsQuery, useIncomingRequestsQuery } from '../../api/social';
import { Theme } from '../../styles/theme';
import Text from '../../components/atoms/Text';
import UserListItem from '../../components/molecules/UserListItem';

export default function CommunityScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const tabBarHeight = useBottomTabBarHeight();
    const { data: friends = [], isLoading: friendsLoading } = useFriendsQuery();
    const { data: incomingRequests = [] } = useIncomingRequestsQuery();

    const pendingCount = incomingRequests.length;

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.Content title="Społeczność" />
            </Appbar.Header>

            <View style={[styles.content, { paddingBottom: tabBarHeight }]}>
                {/* Search bar */}
                <TouchableOpacity
                    style={styles.searchBar}
                    onPress={() => navigation.navigate('UserSearch')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
                    <Text variant="body" style={styles.searchPlaceholder}>Szukaj użytkowników...</Text>
                </TouchableOpacity>

                {/* Friend requests section */}
                <TouchableOpacity
                    style={styles.requestsRow}
                    onPress={() => navigation.navigate('FriendRequests')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="account-clock" size={24} color={theme.colors.primary} />
                    <Text variant="body" style={styles.requestsText}>Zaproszenia do znajomych</Text>
                    {pendingCount > 0 && (
                        <Badge style={styles.badge}>{pendingCount}</Badge>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <Divider style={styles.divider} />

                {/* Friends list */}
                <Text variant="h3" style={styles.sectionTitle}>
                    Znajomi ({friends.length})
                </Text>

                {friends.length === 0 && !friendsLoading ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-group-outline" size={64} color={theme.colors.textLight} />
                        <Text variant="body" style={styles.emptyText}>Nie masz jeszcze znajomych</Text>
                        <Text variant="caption" style={styles.emptyHint}>
                            Wyszukaj użytkowników i wyślij zaproszenie
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const friendId = item.userIds.find((id) => id !== user?.uid) || '';
                            const friendData = item.users[friendId];

                            return (
                                <UserListItem
                                    displayName={friendData?.displayName || 'Użytkownik'}
                                    onPress={() => navigation.navigate('UserProfile', { userId: friendId })}
                                />
                            );
                        }}
                        ItemSeparatorComponent={() => <Divider style={styles.itemDivider} />}
                    />
                )}
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
        padding: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    searchPlaceholder: {
        marginLeft: 8,
        color: theme.colors.textSecondary,
    },
    requestsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    requestsText: {
        flex: 1,
        marginLeft: 12,
        color: theme.colors.textPrimary,
    },
    badge: {
        backgroundColor: theme.colors.error,
        marginRight: 8,
    },
    divider: {
        backgroundColor: theme.colors.border,
        marginVertical: 8,
    },
    sectionTitle: {
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
    emptyHint: {
        color: theme.colors.textLight,
        marginTop: 4,
    },
    itemDivider: {
        backgroundColor: theme.colors.borderLight,
        marginLeft: 72,
    },
});
