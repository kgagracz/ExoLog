import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface AnimalHeaderProps {
  animal: Animal;
}

const AnimalHeader: React.FC<AnimalHeaderProps> = ({ animal }) => {
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
        {animal.stage && (
          <Chip icon="arrow-up-bold" style={styles.chip}>
            L{animal.stage} - {getStageCategory(animal.stage)}
          </Chip>
        )}
        {animal.isAdult && (
          <Chip icon="star" style={[styles.chip, styles.adultChip]}>
            Dorosły
          </Chip>
        )}
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
  adultChip: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
});

export default AnimalHeader;
