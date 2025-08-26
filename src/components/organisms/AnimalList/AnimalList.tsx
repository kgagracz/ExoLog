import React from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../theme/themes';
import { Separator } from '../../atoms';
import AnimalCard from '../AnimalCard/AnimalCard';
import EmptyState from '../EmptyState/EmptyState';

interface Animal {
  id: string;
  name: string;
  species: string;
  type: 'tarantula' | 'scorpion' | 'other';
  dateAdded: Date;
  eventsCount: number;
  age: number;
}

interface AnimalListProps {
  animals: Animal[];
  onAnimalPress: (animal: Animal) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateEmoji?: string;
}

const AnimalList: React.FC<AnimalListProps> = ({
  animals,
  onAnimalPress,
  onRefresh,
  refreshing = false,
  emptyStateTitle = "Brak ptaszników",
  emptyStateDescription = "Dodaj swojego pierwszego ptasznika, aby rozpocząć zarządzanie hodowlą",
  emptyStateEmoji = "🕷️",
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderAnimalCard: ListRenderItem<Animal> = ({ item }) => (
    <AnimalCard
      animal={item}
      onPress={onAnimalPress}
    />
  );

  const renderSeparator = () => <Separator />;

  const renderEmptyComponent = () => (
    <EmptyState
      emoji={emptyStateEmoji}
      title={emptyStateTitle}
      description={emptyStateDescription}
    />
  );

  const keyExtractor = (item: Animal): string => item.id;

  return (
    <FlatList
      data={animals}
      renderItem={renderAnimalCard}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={[
        styles.contentContainer,
        animals.length === 0 && { flex: 1 }
      ]}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
    />
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  contentContainer: {
    paddingBottom: theme.spacing.large,
  },
});

export default AnimalList;
