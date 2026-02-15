import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Card, Button, Divider, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileQuery, useToggleVisibilityMutation } from '../api/social';
import { socialService } from '../services/firebase';
import { Theme } from '../styles/theme';
import Text from '../components/atoms/Text';

export default function ProfileScreen() {
    const { theme, toggleTheme, isDark } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);

    const { data: profile } = useUserProfileQuery(user?.uid);
    const toggleVisibility = useToggleVisibilityMutation();

    // Ensure profile exists on first visit
    useEffect(() => {
        if (user && profile === null) {
            socialService.createOrUpdateProfile({
                uid: user.uid,
                displayName: user.displayName || user.email?.split('@')[0] || 'Użytkownik',
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
            'Wylogowanie',
            'Czy na pewno chcesz się wylogować?',
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Wyloguj',
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        const result = await logout();
                        setLoggingOut(false);

                        if (!result.success) {
                            Alert.alert('Błąd', result.error || 'Nie udało się wylogować');
                        }
                    },
                },
            ]
        );
    };

    const getInitials = (email: string | null | undefined): string => {
        if (!email) return '?';
        return email.charAt(0).toUpperCase();
    };

    const getDisplayName = (): string => {
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split('@')[0];
        return 'Użytkownik';
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Profil" />
            </Appbar.Header>

            <View style={styles.content}>
                {/* Sekcja avatara i nazwy */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{getInitials(user?.email)}</Text>
                    </View>
                    <Text variant="h2" style={styles.displayName}>{getDisplayName()}</Text>
                    <Text variant="bodySmall" style={styles.email}>{user?.email}</Text>
                </View>

                {/* Informacje o koncie */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="h3" style={styles.sectionTitle}>Informacje o koncie</Text>

                        <View style={styles.infoRow}>
                            <Text variant="bodySmall">Email</Text>
                            <Text variant="body">{user?.email || '—'}</Text>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text variant="bodySmall">Nazwa wyświetlana</Text>
                            <Text variant="body">{user?.displayName || '—'}</Text>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text variant="bodySmall">ID użytkownika</Text>
                            <Text variant="caption" numberOfLines={1}>{user?.uid || '—'}</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Motyw */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <Text variant="body">Ciemny motyw</Text>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                color={theme.colors.primary}
                            />
                        </View>
                    </Card.Content>
                </Card>

                {/* Prywatność */}
                {profile && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="h3" style={styles.sectionTitle}>Prywatność</Text>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text variant="body">Profil publiczny</Text>
                                    <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                                        Inni użytkownicy mogą Cię wyszukać i zobaczyć Twoje zwierzęta
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
                )}

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
                        Wyloguj się
                    </Button>
                </View>
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
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
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
        marginBottom: 4,
        color: theme.colors.textPrimary,
    },
    email: {
        color: theme.colors.textSecondary,
    },
    card: {
        backgroundColor: theme.colors.surface,
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 16,
        color: theme.colors.primary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    divider: {
        backgroundColor: theme.colors.border,
    },
    logoutSection: {
        marginTop: 'auto',
        paddingVertical: 16,
    },
    logoutButton: {
        borderColor: theme.colors.error,
    },
});