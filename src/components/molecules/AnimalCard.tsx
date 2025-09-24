import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface AnimalCardProps {
  animal: Animal;
  onPress: (animal: Animal) => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Card style={styles.animalCard} onPress={() => onPress(animal)}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.animalName}>
          {animal.name}
        </Text>
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
  animalName: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
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
});

export default AnimalCard;
