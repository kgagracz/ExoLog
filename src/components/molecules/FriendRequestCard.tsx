import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../styles/theme';
import Text from '../atoms/Text';

interface FriendRequestCardProps {
    displayName: string;
    onAccept: () => void;
    onReject: () => void;
    acceptLoading?: boolean;
    rejectLoading?: boolean;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
    displayName,
    onAccept,
    onReject,
    acceptLoading,
    rejectLoading,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const initials = displayName
        .split(' ')
        .map((w) => w.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.content}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>

                <View style={styles.info}>
                    <Text variant="body" style={styles.name}>{displayName}</Text>
                    <Text variant="caption" style={styles.subtitle}>chce zostać Twoim znajomym</Text>
                </View>

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        compact
                        onPress={onAccept}
                        loading={acceptLoading}
                        disabled={acceptLoading || rejectLoading}
                        style={styles.acceptButton}
                        labelStyle={styles.buttonLabel}
                    >
                        Akceptuj
                    </Button>
                    <Button
                        mode="outlined"
                        compact
                        onPress={onReject}
                        loading={rejectLoading}
                        disabled={acceptLoading || rejectLoading}
                        style={styles.rejectButton}
                        labelStyle={styles.buttonLabel}
                    >
                        Odrzuć
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        marginBottom: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textInverse,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    subtitle: {
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        backgroundColor: theme.colors.primary,
    },
    rejectButton: {
        borderColor: theme.colors.border,
    },
    buttonLabel: {
        fontSize: 12,
    },
});

export default FriendRequestCard;
