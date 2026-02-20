import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Divider, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useSearchUsersQuery, useSendRequestMutation, useFriendshipStatusQuery } from '../../api/social';
import { Theme } from '../../styles/theme';
import Text from '../../components/atoms/Text';
import UserListItem from '../../components/molecules/UserListItem';
import type { PublicUserProfile, FriendshipStatus } from '../../types/social';

function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

function UserSearchResultItem({ profile }: { profile: PublicUserProfile }) {
    const navigation = useNavigation<any>();
    const { t } = useAppTranslation('social');
    const { data: status } = useFriendshipStatusQuery(profile.uid);
    const sendRequest = useSendRequestMutation();

    const getActionProps = (status: FriendshipStatus | undefined) => {
        switch (status) {
            case 'friends':
                return { label: t('userSearch.statusFriend'), disabled: true, icon: 'check' };
            case 'pending_sent':
                return { label: t('userSearch.statusSent'), disabled: true, icon: 'clock-outline' };
            case 'pending_received':
                return { label: t('userSearch.statusRespond'), disabled: false, icon: 'account-clock' };
            case 'none':
                return { label: t('userSearch.statusInvite'), disabled: false, icon: 'account-plus' };
            default:
                return undefined;
        }
    };

    const actionProps = getActionProps(status);

    const handleAction = () => {
        if (status === 'none') {
            sendRequest.mutate({
                toUserId: profile.uid,
                toDisplayName: profile.displayName,
            });
        } else if (status === 'pending_received') {
            navigation.navigate('FriendRequests');
        }
    };

    return (
        <UserListItem
            displayName={profile.displayName}
            subtitle={t('userSearch.animalsCount', { count: profile.stats.totalAnimals })}
            onPress={() => navigation.navigate('UserProfile', { userId: profile.uid })}
            actionLabel={actionProps?.label}
            actionIcon={actionProps?.icon}
            onAction={handleAction}
            actionLoading={sendRequest.isPending}
            actionDisabled={actionProps?.disabled}
        />
    );
}

export default function UserSearchScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const { t } = useAppTranslation('social');
    const tabBarHeight = useBottomTabBarHeight();

    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 300);

    const { data: results = [], isLoading, isFetching } = useSearchUsersQuery(debouncedSearch);

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('userSearch.title')} />
            </Appbar.Header>

            <View style={styles.content}>
                <Searchbar
                    placeholder={t('userSearch.placeholder')}
                    value={searchText}
                    onChangeText={setSearchText}
                    style={styles.searchbar}
                    autoFocus
                />

                {debouncedSearch.length < 2 && (
                    <View style={styles.hintContainer}>
                        <Text variant="body" style={styles.hintText}>
                            {t('userSearch.minChars')}
                        </Text>
                    </View>
                )}

                {debouncedSearch.length >= 2 && results.length === 0 && !isLoading && !isFetching && (
                    <View style={styles.hintContainer}>
                        <Text variant="body" style={styles.hintText}>
                            {t('userSearch.noResults')}
                        </Text>
                    </View>
                )}

                <FlatList
                    data={results}
                    keyExtractor={(item) => item.uid}
                    renderItem={({ item }) => <UserSearchResultItem profile={item} />}
                    ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                    contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
                />
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
    },
    searchbar: {
        margin: 16,
        backgroundColor: theme.colors.surfaceLight,
    },
    hintContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    hintText: {
        color: theme.colors.textSecondary,
    },
    divider: {
        backgroundColor: theme.colors.borderLight,
        marginLeft: 72,
    },
});
