import React from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import {
    useIncomingRequestsQuery,
    useOutgoingRequestsQuery,
    useAcceptRequestMutation,
    useRejectRequestMutation,
} from '../../api/social';
import { Theme } from '../../styles/theme';
import Text from '../../components/atoms/Text';
import FriendRequestCard from '../../components/molecules/FriendRequestCard';
import UserListItem from '../../components/molecules/UserListItem';
import type { FriendRequest } from '../../types/social';

export default function FriendRequestsScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const { user } = useAuth();
    const { t } = useAppTranslation('social');
    const tabBarHeight = useBottomTabBarHeight();

    const { data: incoming = [], isLoading: incomingLoading } = useIncomingRequestsQuery();
    const { data: outgoing = [], isLoading: outgoingLoading } = useOutgoingRequestsQuery();

    const acceptMutation = useAcceptRequestMutation();
    const rejectMutation = useRejectRequestMutation();

    const getDisplayName = (): string => {
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split('@')[0];
        return t('common:user');
    };

    const sections = [
        {
            title: t('friendRequests.incoming'),
            data: incoming,
            type: 'incoming' as const,
        },
        {
            title: t('friendRequests.outgoing'),
            data: outgoing,
            type: 'outgoing' as const,
        },
    ];

    const renderItem = ({ item, section }: { item: FriendRequest; section: { type: 'incoming' | 'outgoing' } }) => {
        if (section.type === 'incoming') {
            return (
                <FriendRequestCard
                    displayName={item.fromDisplayName}
                    onAccept={() =>
                        acceptMutation.mutate({
                            requestId: item.id,
                            fromUserId: item.fromUserId,
                            fromDisplayName: item.fromDisplayName,
                            toDisplayName: getDisplayName(),
                        })
                    }
                    onReject={() => rejectMutation.mutate(item.id)}
                    acceptLoading={acceptMutation.isPending}
                    rejectLoading={rejectMutation.isPending}
                />
            );
        }

        return (
            <UserListItem
                displayName={item.toDisplayName}
                subtitle={t('friendRequests.awaitingAcceptance')}
            />
        );
    };

    const renderSectionHeader = ({ section }: { section: { title: string; data: FriendRequest[] } }) => (
        <View style={styles.sectionHeader}>
            <Text variant="h3" style={styles.sectionTitle}>
                {section.title} ({section.data.length})
            </Text>
        </View>
    );

    const isLoading = incomingLoading || outgoingLoading;
    const isEmpty = incoming.length === 0 && outgoing.length === 0;

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('friendRequests.title')} />
            </Appbar.Header>

            {isEmpty && !isLoading ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="email-open-outline" size={64} color={theme.colors.textLight} />
                    <Text variant="body" style={styles.emptyText}>{t('friendRequests.noRequests')}</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    SectionSeparatorComponent={() => <View style={{ height: 16 }} />}
                    contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 16 }]}
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
    listContent: {
        padding: 16,
    },
    sectionHeader: {
        paddingVertical: 8,
    },
    sectionTitle: {
        color: theme.colors.textPrimary,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
});
