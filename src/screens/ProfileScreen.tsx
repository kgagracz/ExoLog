import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Animated, Share } from 'react-native';
import { Appbar, Card, Button, Divider, Switch } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useSlideUp } from '../hooks/useAnimations';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useUserProfileQuery, useToggleVisibilityMutation, useUpdateProfileMutation } from '../api/social';
import { Theme } from '../styles/theme';
import Text from '../components/atoms/Text';

function AnimatedCard({ delay, children, style }: { delay: number; children: React.ReactNode; style?: any }) {
    const { opacity, translateY } = useSlideUp(300, delay);
    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}

export default function ProfileScreen() {
    const { t } = useAppTranslation('profile');
    const { theme, toggleTheme, isDark } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);

    const { data: profile } = useUserProfileQuery(user?.uid);
    const toggleVisibility = useToggleVisibilityMutation();
    const updateProfile = useUpdateProfileMutation();
    const { preferences, loading: prefsLoading, toggleMoltReminders, toggleCocoonReminders, toggleFollowedUserActivity } = useNotificationPreferences();

    // Ensure profile exists on first visit
    useEffect(() => {
        if (user && profile === null) {
            updateProfile.mutate({
                displayName: user.displayName || user.email?.split('@')[0] || t('common:user'),
                email: user.email || '',
                isPublic: true,
            });
        }
    }, [user, profile]);

    const handleTogglePublic = (value: boolean) => {
        toggleVisibility.mutate(value);
    };

    const handleLogout = () => {
        Alert.alert(
            t('logoutTitle'),
            t('logoutMessage'),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('logoutButton'),
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        const result = await logout();
                        setLoggingOut(false);

                        if (!result.success) {
                            Alert.alert(t('common:error'), result.error || t('logoutError'));
                        }
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        if (!user) return;
        const name = getDisplayName();
        await Share.share({
            message: t('shareMessage', { name }) + `\nexolog://profile/${user.uid}`,
        });
    };

    const getInitials = (email: string | null | undefined): string => {
        if (!email) return '?';
        return email.charAt(0).toUpperCase();
    };

    const getDisplayName = (): string => {
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split('@')[0];
        return t('common:user');
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('title')} />
                <Appbar.Action icon="share-variant" onPress={handleShare} />
            </Appbar.Header>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Sekcja avatara i nazwy z gradientem */}
                <LinearGradient
                    colors={theme.gradients.profileHeader}
                    style={styles.profileHeader}
                >
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{getInitials(user?.email)}</Text>
                    </View>
                    <Text variant="h2" style={styles.displayName}>{getDisplayName()}</Text>
                    <Text variant="bodySmall" style={styles.email}>{user?.email}</Text>
                </LinearGradient>

                {/* Informacje o koncie */}
                <AnimatedCard delay={0}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="h3" style={styles.sectionTitle}>{t('accountInfo')}</Text>

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <View style={styles.infoContent}>
                                    <Text variant="bodySmall">{t('email')}</Text>
                                    <Text variant="body">{user?.email || '—'}</Text>
                                </View>
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <View style={styles.infoContent}>
                                    <Text variant="bodySmall">{t('displayName')}</Text>
                                    <Text variant="body">{user?.displayName || '—'}</Text>
                                </View>
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="identifier" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <View style={styles.infoContent}>
                                    <Text variant="bodySmall">{t('userId')}</Text>
                                    <Text variant="caption" numberOfLines={1}>{user?.uid || '—'}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </AnimatedCard>

                {/* Motyw */}
                <AnimatedCard delay={100}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <Text variant="body" style={{ flex: 1 }}>{t('darkTheme')}</Text>
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    color={theme.colors.primary}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </AnimatedCard>

                {/* Prywatność */}
                {profile && (
                    <AnimatedCard delay={200}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="h3" style={styles.sectionTitle}>{t('privacy')}</Text>

                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="earth" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                    <View style={{ flex: 1 }}>
                                        <Text variant="body">{t('publicProfile')}</Text>
                                        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                                            {t('publicProfileDescription')}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={profile.isPublic}
                                        onValueChange={handleTogglePublic}
                                        color={theme.colors.primary}
                                        disabled={toggleVisibility.isPending}
                                    />
                                </View>
                            </Card.Content>
                        </Card>
                    </AnimatedCard>
                )}

                {/* Powiadomienia */}
                <AnimatedCard delay={300}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="h3" style={styles.sectionTitle}>{t('notifications')}</Text>

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="bell-ring-outline" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <View style={{ flex: 1 }}>
                                    <Text variant="body">{t('moltReminders')}</Text>
                                    <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                                        {t('moltRemindersDescription')}
                                    </Text>
                                </View>
                                <Switch
                                    value={preferences.moltReminders}
                                    onValueChange={toggleMoltReminders}
                                    color={theme.colors.primary}
                                    disabled={prefsLoading}
                                />
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="egg-outline" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <View style={{ flex: 1 }}>
                                    <Text variant="body">{t('cocoonReminders')}</Text>
                                    <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                                        {t('cocoonRemindersDescription')}
                                    </Text>
                                </View>
                                <Switch
                                    value={preferences.cocoonReminders}
                                    onValueChange={toggleCocoonReminders}
                                    color={theme.colors.primary}
                                    disabled={prefsLoading}
                                />
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="account-eye-outline" size={20} color={theme.colors.primary} style={styles.rowIcon} />
                                <View style={{ flex: 1 }}>
                                    <Text variant="body">{t('followedUserActivity')}</Text>
                                    <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                                        {t('followedUserActivityDescription')}
                                    </Text>
                                </View>
                                <Switch
                                    value={preferences.followedUserActivity}
                                    onValueChange={toggleFollowedUserActivity}
                                    color={theme.colors.primary}
                                    disabled={prefsLoading}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </AnimatedCard>

                {/* Przycisk wylogowania */}
                <View style={styles.logoutSection}>
                    <Button
                        mode="outlined"
                        onPress={handleLogout}
                        loading={loggingOut}
                        disabled={loggingOut}
                        textColor={theme.colors.error}
                        style={styles.logoutButton}
                        icon="logout"
                    >
                        {t('logout')}
                    </Button>
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
    content: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: theme.spacing.large,
        paddingTop: theme.spacing.xl,
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.medium,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    displayName: {
        marginBottom: theme.spacing.xs,
        color: '#ffffff',
    },
    email: {
        color: 'rgba(255,255,255,0.8)',
    },
    card: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.medium,
        marginBottom: theme.spacing.medium,
        borderRadius: theme.borderRadius.large,
        ...theme.shadows.small,
    },
    sectionTitle: {
        marginBottom: theme.spacing.medium,
        color: theme.colors.primary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.small,
    },
    rowIcon: {
        marginRight: theme.spacing.ms,
        width: 24,
    },
    infoContent: {
        flex: 1,
    },
    divider: {
        backgroundColor: theme.colors.borderLight,
        marginVertical: theme.spacing.xs,
    },
    logoutSection: {
        marginTop: 'auto',
        padding: theme.spacing.medium,
    },
    logoutButton: {
        borderColor: theme.colors.error,
    },
});
