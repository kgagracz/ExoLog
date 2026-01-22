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
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress, matingStatus, cocoonStatus }) => {
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

  const matingLabel = animal.sex === 'female' ? getMatingLabel() : null;
  const cocoonLabel = animal.sex === 'female' ? getCocoonLabel() : null;

  return (
      <Card style={styles.animalCard} onPress={() => onPress(animal)}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleLarge" style={styles.animalName}>
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
            </View>
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
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
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
  statusChip: {
    height: 24,
  },
  statusChipText: {
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
  cocoonChip: {
    backgroundColor: theme.colors.events.cocoon.background,
  },
  cocoonChipText: {
    color: theme.colors.events.cocoon.color,
  },
});

export default AnimalCard;