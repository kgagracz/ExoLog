import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../styles/theme';
import Text from '../atoms/Text';

interface UserListItemProps {
    displayName: string;
    subtitle?: string;
    onPress?: () => void;
    actionLabel?: string;
    actionIcon?: string;
    onAction?: () => void;
    actionLoading?: boolean;
    actionDisabled?: boolean;
}

const UserListItem: React.FC<UserListItemProps> = ({
    displayName,
    subtitle,
    onPress,
    actionLabel,
    actionIcon,
    onAction,
    actionLoading,
    actionDisabled,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const initials = displayName
        .split(' ')
        .map((w) => w.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const content = (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.info}>
                <Text variant="body" style={styles.name}>{displayName}</Text>
                {subtitle && <Text variant="caption" style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {actionLabel && onAction && (
                <Button
                    mode="outlined"
                    compact
                    onPress={onAction}
                    loading={actionLoading}
                    disabled={actionDisabled}
                    icon={actionIcon}
                    style={styles.actionButton}
                    labelStyle={styles.actionLabel}
                >
                    {actionLabel}
                </Button>
            )}
        </View>
    );

    if (onPress) {
        return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
    }

    return content;
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.surface,
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
    actionButton: {
        marginLeft: 8,
    },
    actionLabel: {
        fontSize: 12,
    },
});

export default UserListItem;
