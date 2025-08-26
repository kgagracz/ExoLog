import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {Theme} from "../../styles/theme";

interface Animal {
  id: string;
  name: string;
  species: string;
  type: 'tarantula' | 'scorpion' | 'other';
  dateAdded: Date;
  eventsCount: number;
  age: number;
}

interface AnimalCardProps {
  animal: Animal;
  onPress: (animal: Animal) => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getAnimalEmoji = (type: Animal['type']): string => {
    switch (type) {
      case 'tarantula':
        return '🕷️';
      case 'scorpion':
        return '🦂';
      default:
        return '🐛';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(animal)}
    >
      <Text style={styles.emoji}>{getAnimalEmoji(animal.type)}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{animal.name}</Text>
        <Text style={styles.species}>{animal.species}</Text>
        <Text style={styles.meta}>
          Wydarzenia: {animal.eventsCount} | Wiek: {animal.age} lat
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.medium,
      marginVertical: theme.spacing.small,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.medium,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    emoji: {
      fontSize: 32,
      marginRight: theme.spacing.medium,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    species: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    meta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

export default AnimalCard;
