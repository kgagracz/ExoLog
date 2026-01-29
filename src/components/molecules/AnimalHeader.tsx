import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
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
  estimatedHatchDate?: string;
}

interface AnimalHeroHeaderProps {
  animal: Animal;
  matingStatus?: MatingStatus;
  cocoonStatus?: CocoonStatus;
}

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 280;

const AnimalHeader: React.FC<AnimalHeroHeaderProps> = ({ animal, matingStatus, cocoonStatus }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  // Pobierz główne zdjęcie
  const mainPhoto = animal.photos?.find(p => p.isMain) || animal.photos?.[0];
  const photoUrl = mainPhoto?.url || animal.specificData?.mainPhotoUrl;

  const getSexDisplay = (sex: string): string => {
    switch (sex) {
      case 'male': return '♂ Samiec';
      case 'female': return '♀ Samica';
      default: return 'Nieznana płeć';
    }
  };

  const getStageCategory = (stage: number | null): string => {
    if (!stage) return 'Nieznane';
    if (stage <= 3) return 'Młode (L1-L3)';
    if (stage <= 6) return 'Juvenile (L4-L6)';
    if (stage <= 8) return 'Subadult (L7-L8)';
    return 'Adult (L9+)';
  };

  const numericStage = animal.specificData?.currentStage as number | null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const getDaysUntilHatch = (estimatedHatchDate?: string): number | null => {
    if (!estimatedHatchDate) return null;
    const today = new Date();
    const hatchDate = new Date(estimatedHatchDate);
    const diffTime = hatchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCocoonChip = () => {
    if (animal.sex !== 'female' || !cocoonStatus?.hasCocoon) return null;

    const daysUntil = getDaysUntilHatch(cocoonStatus.estimatedHatchDate);
    const daysText = daysUntil !== null && daysUntil > 0
        ? ` (${daysUntil} dni)`
        : daysUntil !== null && daysUntil <= 0
            ? ' (termin minął!)'
            : '';

    return (
        <Chip
            icon="egg"
            style={[styles.chip, styles.cocoonChip]}
            textStyle={styles.cocoonChipText}
            compact
        >
          🥚 Kokon{daysText}
        </Chip>
    );
  };

  const getMatingChip = () => {
    if (animal.sex !== 'female' || !matingStatus?.hasMating) return null;

    switch (matingStatus.lastMatingResult) {
      case 'success':
        return (
            <Chip
                icon="heart"
                style={[styles.chip, styles.matingSuccessChip]}
                textStyle={styles.matingSuccessChipText}
                compact
            >
              💕 Zapłodniona
            </Chip>
        );
      case 'in_progress':
        return (
            <Chip
                icon="heart"
                style={[styles.chip, styles.matingProgressChip]}
                textStyle={styles.matingProgressChipText}
                compact
            >
              💕 Po kopulacji
            </Chip>
        );
      default:
        return null;
    }
  };

  const renderContent = () => (
      <View style={styles.gradientContainer}>
        {/* Wielowarstwowy gradient */}
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />
        <View style={styles.gradientLayer3} />

        <View style={styles.content}>
          <Text style={styles.animalName}>{animal.name}</Text>
          <Text style={styles.species}>
            {animal.species || 'Nieznany gatunek'}
          </Text>

          <View style={styles.chipContainer}>
            <Chip
                icon="gender-male-female"
                style={[styles.chip, styles.infoChip]}
                textStyle={styles.infoChipText}
                compact
            >
              {getSexDisplay(animal.sex)}
            </Chip>
            {numericStage && (
                <Chip
                    icon="arrow-up-bold"
                    style={[styles.chip, styles.infoChip]}
                    textStyle={styles.infoChipText}
                    compact
                >
                  L{numericStage}
                </Chip>
            )}
            {getCocoonChip()}
            {getMatingChip()}
          </View>
        </View>
      </View>
  );

  if (photoUrl) {
    return (
        <ImageBackground
            source={{ uri: photoUrl }}
            style={styles.heroContainer}
            resizeMode="cover"
        >
          {renderContent()}
        </ImageBackground>
    );
  }

  // Fallback bez zdjęcia
  return (
      <View style={[styles.heroContainer, styles.noPhotoContainer]}>
        <View style={styles.placeholderIcon}>
          <Text style={styles.placeholderEmoji}>🕷️</Text>
        </View>
        {renderContent()}
      </View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  heroContainer: {
    width: width,
    height: HERO_HEIGHT,
    backgroundColor: theme.colors.surfaceLight,
  },
  noPhotoContainer: {
    backgroundColor: theme.colors.primary,
  },
  placeholderIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  placeholderEmoji: {
    fontSize: 120,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Wielowarstwowy gradient - od góry do dołu coraz ciemniejszy
  gradientLayer1: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  gradientLayer2: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  gradientLayer3: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  content: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  animalName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  species: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    fontStyle: 'italic',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  infoChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  infoChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  matingSuccessChip: {
    backgroundColor: theme.colors.successContainer,
  },
  matingSuccessChipText: {
    color: theme.colors.success,
    fontSize: 12,
  },
  matingProgressChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  matingProgressChipText: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  cocoonChip: {
    backgroundColor: theme.colors.events.cocoon.background,
  },
  cocoonChipText: {
    color: theme.colors.events.cocoon.color,
    fontSize: 12,
  },
});

export default AnimalHeader;