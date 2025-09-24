import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, FAB, Searchbar, Appbar, Button, Portal } from 'react-native-paper';
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect } from '@react-navigation/native';

interface AnimalsListScreenProps {
  navigation?: any;
}

const AnimalsListScreen: React.FC<AnimalsListScreenProps> = ({ navigation }) => {
  const {
    animals,
    loading,
    error,
    refresh,
  } = useAnimals();
  const { theme } = useTheme()
  const styles = makeStyles(theme)

  const [searchText, setSearchText] = useState<string>('');
  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Hook kontrolujący widoczność FAB - pokazuje tylko gdy ekran jest aktywny
  useFocusEffect(
      React.useCallback(() => {
        setIsFocused(true);
        return () => {
          setIsFocused(false);
          setFabOpen(false); // Zamknij menu FAB gdy opuszczamy ekran
        };
      }, [])
  );

  const handleAddSpider = (): void => {
    setFabOpen(false);
    navigation?.navigate('AddSpider');
  };

  const handleAddFeeding = (): void => {
    setFabOpen(false);
    navigation?.navigate('AddFeeding');
  };

  const handleAnimalPress = (animal: any): void => {
    navigation?.navigate('AnimalDetails', { animalId: animal.id });
  };

  const filteredAnimals = animals.filter(animal =>
      animal.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (animal.species || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="🕷️ Moje Zwierzęta" />
        </Appbar.Header>

        <View style={styles.content}>
          <Searchbar
              placeholder="Szukaj zwierząt..."
              onChangeText={setSearchText}
              value={searchText}
              style={styles.searchBar}
          />

          {animals.length === 0 && !loading ? (
              <View style={styles.emptyState}>
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                  Brak zwierząt
                </Text>
                <Text variant="bodyLarge" style={styles.emptyDescription}>
                  Dodaj swojego pierwszego ptasznika, aby rozpocząć zarządzanie hodowlą
                </Text>
                <Button
                    mode="contained"
                    onPress={handleAddSpider}
                    style={styles.emptyButton}
                    icon="plus"
                >
                  Dodaj ptasznika
                </Button>
              </View>
          ) : (
              <ScrollView
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} />
                  }
              >
                {filteredAnimals.map((animal) => (
                    <Card key={animal.id} style={styles.animalCard} onPress={() => handleAnimalPress(animal)}>
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
                ))}
              </ScrollView>
          )}
        </View>

        {/* FAB Group - widoczny tylko gdy ekran jest aktywny */}
        {isFocused && (
            <Portal>
              <FAB.Group
                  open={fabOpen}
                  visible={true}
                  icon={fabOpen ? 'close' : 'plus'}
                  actions={[
                    {
                      icon: 'spider',
                      label: 'Dodaj pająka',
                      onPress: handleAddSpider,
                      style: { backgroundColor: theme.colors.primary },
                    },
                    {
                      icon: 'food-apple',
                      label: 'Dodaj karmienie',
                      onPress: handleAddFeeding,
                      style: { backgroundColor: theme.colors.secondary },
                    },
                  ]}
                  onStateChange={({ open }) => setFabOpen(open)}
                  style={styles.fabGroup}
                  fabStyle={{ backgroundColor: theme.colors.primary }}
              />
            </Portal>
        )}
      </View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.text,
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.textSecondary,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  list: {
    flex: 1,
  },
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
  fabGroup: {
    paddingBottom: 16,
  },
});

export default AnimalsListScreen;