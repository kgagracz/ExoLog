import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface MatingStatus {
  hasMating: boolean;
  lastMatingDate?: string;
  lastMatingResult?: string;
}

interface AnimalHeaderProps {
  animal: Animal;
  matingStatus?: MatingStatus;
}

const AnimalHeader: React.FC<AnimalHeaderProps> = ({ animal, matingStatus }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

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

  // Pobierz numeryczne stadium z specificData
  const numericStage = animal.specificData?.currentStage as number | null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pl-PL');
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
            >
              💕 Udana kopulacja ({formatDate(matingStatus.lastMatingDate)})
            </Chip>
        );
      case 'in_progress':
        return (
            <Chip
                icon="heart"
                style={[styles.chip, styles.matingProgressChip]}
                textStyle={styles.matingProgressChipText}
            >
              💕 Kopulacja trwa ({formatDate(matingStatus.lastMatingDate)})
            </Chip>
        );
      case 'failure':
        return (
            <Chip
                icon="heart-broken"
                style={[styles.chip, styles.matingFailureChip]}
                textStyle={styles.matingFailureChipText}
            >
              💔 Nieudana kopulacja ({formatDate(matingStatus.lastMatingDate)})
            </Chip>
        );
      default:
        return (
            <Chip
                icon="heart"
                style={[styles.chip, styles.matingProgressChip]}
                textStyle={styles.matingProgressChipText}
            >
              💕 Po kopulacji ({formatDate(matingStatus.lastMatingDate)})
            </Chip>
        );
    }
  };

  return (
      <>
        <Text variant="headlineSmall" style={styles.animalName}>
          {animal.name}
        </Text>
        <Text variant="titleMedium" style={styles.species}>
          {animal.species || 'Nieznany gatunek'}
        </Text>

        <View style={styles.chipContainer}>
          <Chip icon="gender-male-female" style={styles.chip}>
            {getSexDisplay(animal.sex)}
          </Chip>
          {numericStage && (
              <Chip icon="arrow-up-bold" style={styles.chip}>
                L{numericStage} - {getStageCategory(numericStage)}
              </Chip>
          )}
          {getMatingChip()}
        </View>
      </>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  animalName: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  species: {
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
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
});

export default AnimalHeader;