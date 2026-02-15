import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Appbar, Card, Button, Divider } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import {
    useUserProfileQuery,
    useFriendshipStatusQuery,
    usePublicAnimalsQuery,
    useSendRequestMutation,
    useRemoveFriendMutation,
    useFriendsQuery,
} from '../../api/social';
import { Theme } from '../../styles/theme';
import Text from '../../components/atoms/Text';
import type { Animal } from '../../types';

type RouteParams = {
    UserProfile: { userId: string };
};

export default function UserProfileScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'UserProfile'>>();
    const { user } = useAuth();

    const tabBarHeight = useBottomTabBarHeight();
    const { userId } = route.params;

    const { data: profile, isLoading: profileLoading } = useUserProfileQuery(userId);
    const { data: friendshipStatus } = useFriendshipStatusQuery(userId);
    const { data: animals = [] } = usePublicAnimalsQuery(
        friendshipStatus === 'friends' || profile?.isPublic ? userId : undefined,
    );
    const { data: friends = [] } = useFriendsQuery();

    const sendRequest = useSendRequestMutation();
    const removeFriend = useRemoveFriendMutation();

    const canViewAnimals = profile?.isPublic || friendshipStatus === 'friends';

    const handleRelationAction = () => {
        if (!profile) return;

        if (friendshipStatus === 'none') {
            sendRequest.mutate({
                toUserId: userId,
                toDisplayName: profile.displayName,
            });
        } else if (friendshipStatus === 'friends') {
            Alert.alert(
                'Usuń znajomego',
                `Czy na pewno chcesz usunąć ${profile.displayName} ze znajomych?`,
                [
                    { text: 'Anuluj', style: 'cancel' },
                    {
                        text: 'Usuń',
                        style: 'destructive',
                        onPress: () => {
                            const friendship = friends.find(
                                (f) => f.userIds.includes(userId) && f.userIds.includes(user!.uid),
                            );
                            if (friendship) {
                                removeFriend.mutate(friendship.id);
                            }
                        },
                    },
                ],
            );
        }
    };

    const getRelationButton = () => {
        switch (friendshipStatus) {
            case 'none':
                return {
                    label: 'Wyślij zaproszenie',
                    icon: 'account-plus',
                    mode: 'contained' as const,
                    loading: sendRequest.isPending,
                };
            case 'pending_sent':
                return { label: 'Zaproszenie wysłane', icon: 'clock-outline', mode: 'outlined' as const, disabled: true };
            case 'pending_received':
                return { label: 'Oczekuje na odpowiedź', icon: 'account-clock', mode: 'outlined' as const, disabled: true };
            case 'friends':
                return {
                    label: 'Usuń znajomego',
                    icon: 'account-remove',
                    mode: 'outlined' as const,
                    loading: removeFriend.isPending,
                };
            default:
                return null;
        }
    };

    const relationButton = getRelationButton();

    if (profileLoading) {
        return (
            <View style={styles.container}>
                <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Profil" />
                </Appbar.Header>
                <View style={styles.loading}>
                    <Text variant="body" style={styles.loadingText}>Ładowanie...</Text>
                </View>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Profil" />
                </Appbar.Header>
                <View style={styles.loading}>
                    <Text variant="body" style={styles.loadingText}>Nie znaleziono profilu</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={profile.displayName} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}>
                <View style={styles.header}>
                    {/* Avatar + Name */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile.displayName.split(' ').map((w) => w.charAt(0)).slice(0, 2).join('').toUpperCase()}
                            </Text>
                        </View>
                        <Text variant="h2" style={styles.displayName}>{profile.displayName}</Text>
                        {profile.bio ? (
                            <Text variant="body" style={styles.bio}>{profile.bio}</Text>
                        ) : null}
                    </View>

                    {/* Stats */}
                    <Card style={styles.statsCard}>
                        <Card.Content style={styles.statsContent}>
                            <View style={styles.statItem}>
                                <Text variant="h3" style={styles.statValue}>{profile.stats.totalAnimals}</Text>
                                <Text variant="caption" style={styles.statLabel}>Zwierzęta</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text variant="h3" style={styles.statValue}>
                                    {new Date(profile.stats.joinDate).toLocaleDateString('pl-PL', {
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <Text variant="caption" style={styles.statLabel}>Dołączył(a)</Text>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Relation button */}
                    {relationButton && user?.uid !== userId && (
                        <Button
                            mode={relationButton.mode}
                            icon={relationButton.icon}
                            onPress={handleRelationAction}
                            loading={relationButton.loading}
                            disabled={'disabled' in relationButton ? relationButton.disabled : false}
                            style={styles.relationButton}
                        >
                            {relationButton.label}
                        </Button>
                    )}

                    <Divider style={styles.divider} />

                    {/* Animals section */}
                    {canViewAnimals ? (
                        <>
                            <Text variant="h3" style={styles.sectionTitle}>
                                Zwierzęta ({animals.length})
                            </Text>
                            {animals.length === 0 ? (
                                <View style={styles.emptyAnimals}>
                                    <Text variant="body" style={styles.emptyText}>Brak zwierząt do wyświetlenia</Text>
                                </View>
                            ) : (
                                animals.map((animal) => (
                                    <Card key={animal.id} style={styles.animalCard}>
                                        <Card.Content style={styles.animalContent}>
                                            <MaterialCommunityIcons name="spider" size={24} color={theme.colors.primary} />
                                            <View style={styles.animalInfo}>
                                                <Text variant="body" style={styles.animalName}>{animal.name}</Text>
                                                <Text variant="caption" style={styles.animalSpecies}>{animal.species || animal.breed || ''}</Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                ))
                            )}
                        </>
                    ) : (
                        <View style={styles.privateNotice}>
                            <MaterialCommunityIcons name="lock-outline" size={24} color={theme.colors.textSecondary} />
                            <Text variant="body" style={styles.privateText}>
                                Profil prywatny — dodaj do znajomych, aby zobaczyć zwierzęta
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: theme.colors.textSecondary,
    },
    header: {
        padding: 16,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.textInverse,
    },
    displayName: {
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    bio: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    statsCard: {
        backgroundColor: theme.colors.surface,
        marginVertical: 16,
    },
    statsContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: theme.colors.primary,
    },
    statLabel: {
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    relationButton: {
        marginBottom: 16,
    },
    divider: {
        backgroundColor: theme.colors.border,
        marginVertical: 8,
    },
    sectionTitle: {
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    privateNotice: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    privateText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    animalCard: {
        backgroundColor: theme.colors.surface,
        marginBottom: 8,
    },
    animalContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    animalInfo: {
        marginLeft: 12,
        flex: 1,
    },
    animalName: {
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    animalSpecies: {
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    emptyAnimals: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: theme.colors.textSecondary,
    },
});
