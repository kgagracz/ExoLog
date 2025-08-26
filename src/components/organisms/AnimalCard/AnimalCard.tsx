import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../theme/themes';
import { Avatar } from '../../atoms';
import { AnimalInfo, StatCard } from '../../molecules';

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
      style={styles.container}
      onPress={() => onPress(animal)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <AnimalInfo
          name={animal.name}
          species={animal.species}
        />
        <Avatar
          emoji={getAnimalEmoji(animal.type)}
          size="large"
        />
      </View>

      <View style={styles.stats}>
        <StatCard
          value={animal.age}
          label="miesięcy"
        />
        <StatCard
          value={animal.eventsCount}
          label="wydarzeń"
        />
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginHorizontal: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small + 2,
  },

  stats: {
    flexDirection: 'row',
    marginTop: theme.spacing.small,
    gap: theme.spacing.small,
  },
});

export default AnimalCard;
