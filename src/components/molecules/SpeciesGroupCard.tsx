import React from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useTheme } from '../../context/ThemeContext';
import { useSlideUp } from '../../hooks/useAnimations';
import { Theme } from '../../styles/theme';
import { SpeciesGroup } from '../../types';

interface SpeciesGroupCardProps {
    group: SpeciesGroup;
    onPress: (species: string) => void;
    index?: number;
}

const SpeciesGroupCard: React.FC<SpeciesGroupCardProps> = ({ group, onPress, index = 0 }) => {
    const { theme } = useTheme();
    const { t } = useAppTranslation('animals');
    const styles = makeStyles(theme);

    const delay = Math.min(index, 8) * 80;
    const { opacity, translateY } = useSlideUp(theme.timing.normal, delay);

    const representative = group.representativeAnimal;
    const mainPhoto = representative.photos?.find(p => p.isMain) || representative.photos?.[0];
    const photoUrl = mainPhoto?.url;

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            <Card style={styles.card} onPress={() => onPress(group.species)}>
                <View style={styles.cardContent}>
                    <View style={styles.photoContainer}>
                        {photoUrl ? (
                            <Image
                                source={{ uri: photoUrl }}
                                style={styles.photo}
                                resizeMode="cover"
                            />
                        ) : (
                            <LinearGradient
                                colors={[theme.colors.primaryContainer, theme.colors.primaryLight + '40']}
                                style={styles.photoPlaceholder}
                            >
                                <Text style={styles.photoPlaceholderText}>🕷️</Text>
                            </LinearGradient>
                        )}
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>×{group.count}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text variant="titleMedium" style={styles.speciesName} numberOfLines={1}>
                            {group.species}
                        </Text>
                        <Text variant="bodySmall" style={styles.countText}>
                            {t('list.groupCount', { count: group.count })}
                        </Text>
                    </View>
                </View>
            </Card>
        </Animated.View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginBottom: theme.spacing.ms,
        backgroundColor: theme.colors.backgroundSecondary,
        overflow: 'hidden',
        borderRadius: theme.borderRadius.large,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
        ...theme.shadows.small,
    },
    cardContent: {
        flexDirection: 'row',
        padding: theme.spacing.ms,
    },
    photoContainer: {
        width: 70,
        height: 70,
        borderRadius: theme.borderRadius.medium,
        overflow: 'hidden',
        marginRight: theme.spacing.ms,
        backgroundColor: theme.colors.surfaceLight,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        fontSize: 32,
    },
    badge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        color: theme.colors.textInverse,
        fontSize: 11,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    speciesName: {
        fontStyle: 'italic',
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    countText: {
        color: theme.colors.textSecondary,
    },
});

export default SpeciesGroupCard;
