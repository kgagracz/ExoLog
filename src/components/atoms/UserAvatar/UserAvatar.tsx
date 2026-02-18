import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import Text from '../Text';
import { Theme } from '../../../styles/theme';

interface UserAvatarProps {
    onPress?: () => void;
    size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
                                                   onPress,
                                                   size = 36
                                               }) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const styles = createStyles(theme, size);

    const getInitials = (): string => {
        if (user?.displayName) {
            const names = user.displayName.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return user.displayName.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return '?';
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <LinearGradient
                colors={theme.gradients.cardAccent}
                style={styles.container}
            >
                <Text style={styles.initials}>{getInitials()}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const createStyles = (theme: Theme, size: number) => StyleSheet.create({
    container: {
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primaryLight,
        ...theme.shadows.small,
    },
    initials: {
        fontSize: size * 0.4,
        fontWeight: '600',
        color: theme.colors.textInverse,
    },
});

export default UserAvatar;
