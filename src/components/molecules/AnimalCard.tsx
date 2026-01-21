import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface MatingStatus {
  hasMating: boolean;
  lastMatingDate?: string;
  lastMatingResult?: string;
}

interface AnimalCardProps {
  animal: Animal;
  onPress: (animal: Animal) => void;
  matingStatus?: MatingStatus;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress, matingStatus }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

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

  const matingLabel = animal.sex === 'female' ? getMatingLabel() : null;

  return (
      <Card style={styles.animalCard} onPress={() => onPress(animal)}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleLarge" style={styles.animalName}>
              {animal.name}
            </Text>
            {matingLabel && (
                <Chip
                    style={[styles.matingChip, matingLabel.style]}
                    textStyle={[styles.matingChipText, matingLabel.textStyle]}
                    compact
                >
                  {matingLabel.label}
                </Chip>
            )}
          </View>
          <Text variant="bodyMedium" style={styles.animalSpecies}>
            {animal.species || 'Nieznany gatunek'}
          </Text>
          <Text variant="bodySmall" style={styles.animalInfo}>
            {animal.sex === 'male' ? '♂ Samiec' :
                animal.sex === 'female' ? '♀ Samica' :
                    'Nieznana płeć'} • L{animal.stage || '?'}
          </Text>
          {animal.feeding?.lastFed && (
              <Text variant="bodySmall" style={styles.animalDate}>
                Ostatnie karmienie: {new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')}
              </Text>
          )}
        </Card.Content>
      </Card>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  animalCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalName: {
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  animalSpecies: {
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  animalInfo: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  animalDate: {
    color: theme.colors.textSecondary,
  },
  matingChip: {
    height: 24,
  },
  matingChipText: {
    fontSize: 10,
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
});

export default AnimalCard;