import React, { useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { Text, Card, Chip, Checkbox, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useTheme } from "../../context/ThemeContext";
import { useSlideUp } from "../../hooks/useAnimations";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface MatingStatus {
  hasMating: boolean;
  lastMatingDate?: string;
  lastMatingResult?: string;
}

interface CocoonStatus {
  hasCocoon: boolean;
  lastCocoonDate?: string;
  cocoonStatus?: string;
}

interface AnimalCardProps {
  animal: Animal;
  onPress: (animal: Animal) => void;
  matingStatus?: MatingStatus;
  cocoonStatus?: CocoonStatus;
  lastMoltDate?: string;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onLongPress?: (animal: Animal) => void;
  onMenuPress?: (animal: Animal) => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress, matingStatus, cocoonStatus, lastMoltDate, index = 0, selectable, selected, onToggleSelect, onLongPress, onMenuPress }) => {
  const { theme } = useTheme();
  const { t } = useAppTranslation('animals');
  const styles = makeStyles(theme);

  const delay = Math.min(index, 8) * 80;
  const { opacity, translateY } = useSlideUp(theme.timing.normal, delay);

  // Pobierz zdjęcie główne
  const mainPhoto = animal.photos?.find(p => p.isMain) || animal.photos?.[0];
  const photoUrl = mainPhoto?.url;

  const getMatingLabel = () => {
    if (!matingStatus?.hasMating) return null;

    switch (matingStatus.lastMatingResult) {
      case 'success':
        return { label: '💕 Zapłodniona', style: styles.matingSuccessChip, textStyle: styles.matingSuccessChipText };
      case 'in_progress':
        return { label: '💕 Po kopulacji', style: styles.matingProgressChip, textStyle: styles.matingProgressChipText };
      case 'failure':
        return { label: '💔 Nieudana kopulacja', style: styles.matingFailureChip, textStyle: styles.matingFailureChipText };
      default:
        return { label: '💕 Po kopulacji', style: styles.matingProgressChip, textStyle: styles.matingProgressChipText };
    }
  };

  const getCocoonLabel = () => {
    if (!cocoonStatus?.hasCocoon) return null;

    switch (cocoonStatus.cocoonStatus) {
      case 'laid':
        return { label: '🥚 Kokon', style: styles.cocoonChip, textStyle: styles.cocoonChipText };
      case 'incubating':
        return { label: '🥚 Inkubacja', style: styles.cocoonChip, textStyle: styles.cocoonChipText };
      default:
        return { label: '🥚 Kokon', style: styles.cocoonChip, textStyle: styles.cocoonChipText };
    }
  };

  const getMoltLabel = () => {
    if (!lastMoltDate) return null;

    const today = new Date();
    const moltDate = new Date(lastMoltDate);
    const diffTime = today.getTime() - moltDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 14) return null;

    const daysText = diffDays === 0 ? 'dzisiaj'
        : diffDays === 1 ? '1 dzień temu'
        : `${diffDays} dni temu`;

    return { label: `🔄 ${daysText}`, style: styles.moltChip, textStyle: styles.moltChipText };
  };

  const matingLabel = animal.sex === 'female' ? getMatingLabel() : null;
  const cocoonLabel = animal.sex === 'female' ? getCocoonLabel() : null;
  const moltLabel = getMoltLabel();

  const longPressedRef = useRef(false);

  const handlePress = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    if (selectable && onToggleSelect) {
      onToggleSelect(animal.id);
    } else {
      onPress(animal);
    }
  };

  const handleLongPress = () => {
    if (!selectable && onLongPress) {
      longPressedRef.current = true;
      onLongPress(animal);
    }
  };

  return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Card style={[styles.animalCard, selected && { borderLeftColor: theme.colors.error }]} onPress={handlePress} onLongPress={handleLongPress}>
          <View style={styles.cardContent}>
            {selectable && (
                <View style={styles.checkboxContainer}>
                  <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={() => onToggleSelect?.(animal.id)} />
                </View>
            )}
            {/* Miniaturka zdjęcia */}
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
            </View>

            {/* Informacje */}
            <View style={styles.infoContainer}>
              <View style={styles.headerRow}>
                <Text variant="titleMedium" style={styles.animalName} numberOfLines={1}>
                  {animal.name}
                </Text>
                <View style={styles.chipsRow}>
                  {cocoonLabel && (
                      <Chip
                          style={[styles.statusChip, cocoonLabel.style]}
                          textStyle={[styles.statusChipText, cocoonLabel.textStyle]}
                          compact
                      >
                        {cocoonLabel.label}
                      </Chip>
                  )}
                  {matingLabel && !cocoonLabel && (
                      <Chip
                          style={[styles.statusChip, matingLabel.style]}
                          textStyle={[styles.statusChipText, matingLabel.textStyle]}
                          compact
                      >
                        {matingLabel.label}
                      </Chip>
                  )}
                  {moltLabel && (
                      <Chip
                          style={[styles.statusChip, moltLabel.style]}
                          textStyle={[styles.statusChipText, moltLabel.textStyle]}
                          compact
                      >
                        {moltLabel.label}
                      </Chip>
                  )}
                </View>
              </View>
              <Text variant="bodyMedium" style={styles.animalSpecies} numberOfLines={1}>
                {animal.species || t('common:unknownSpecies')}
              </Text>
              <Text variant="bodySmall" style={styles.animalInfo}>
                {animal.sex === 'male' ? `♂ ${t('filters:sex.male')}` :
                    animal.sex === 'female' ? `♀ ${t('filters:sex.female')}` :
                        t('common:unknownSex')}
                {animal.specificData?.currentStage != null && ` • L${animal.specificData.currentStage}`}
                {animal.measurements?.length != null && ` ${animal.measurements.length}DC`}
              </Text>
              {animal.feeding?.lastFed && (
                  <Text variant="bodySmall" style={styles.animalDate}>
                    {t('addFeeding.lastFeeding')} {new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')}
                  </Text>
              )}
            </View>
            {!selectable && onMenuPress && (
                <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => onMenuPress(animal)}
                    style={styles.menuButton}
                />
            )}
          </View>
        </Card>
      </Animated.View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  animalCard: {
    marginBottom: theme.spacing.ms,
    backgroundColor: theme.colors.backgroundSecondary,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.large,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryLight,
    ...theme.shadows.small,
  },
  cardContent: {
    flexDirection: 'row',
    padding: theme.spacing.ms,
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: theme.spacing.xs,
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
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuButton: {
    margin: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  animalName: {
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.small,
  },
  animalSpecies: {
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  animalInfo: {
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  animalDate: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  statusChip: {
    height: 22,
  },
  statusChipText: {
    fontSize: 9,
    marginVertical: 0,
    marginHorizontal: 4,
  },
  matingSuccessChip: {
    backgroundColor: theme.colors.successContainer,
  },
  matingSuccessChipText: {
    color: theme.colors.success,
  },
  matingProgressChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  matingProgressChipText: {
    color: theme.colors.primary,
  },
  matingFailureChip: {
    backgroundColor: theme.colors.errorContainer,
  },
  matingFailureChipText: {
    color: theme.colors.error,
  },
  cocoonChip: {
    backgroundColor: theme.colors.events.cocoon.background,
  },
  cocoonChipText: {
    color: theme.colors.events.cocoon.color,
  },
  moltChip: {
    backgroundColor: theme.colors.events.molting.background,
  },
  moltChipText: {
    color: theme.colors.events.molting.color,
  },
});

export default AnimalCard;
