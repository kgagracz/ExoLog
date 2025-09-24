import {useAnimals} from "../../hooks";
import {useTheme} from "../../context/ThemeContext";
import {useCallback, useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Appbar, Searchbar} from "react-native-paper";
import {EmptyState} from "../../components";
import AnimalsList from "../../components/organisms/AnimalList";
import AddActionsFAB from "../../components/molecules/AddActionsFAB";
import {Theme} from "../../styles/theme";
import {Animal} from "../../types";

interface AnimalsListScreenProps {
  navigation?: any;
}

const AnimalsListScreen: React.FC<AnimalsListScreenProps> = ({ navigation }) => {
  const { animals, loading, refresh } = useAnimals();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [searchText, setSearchText] = useState<string>('');
  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Hook kontrolujący widoczność FAB
  useEffect(
      useCallback(() => {
        setIsFocused(true);
        return () => {
          setIsFocused(false);
          setFabOpen(false);
        };
      }, [])
  );

  // Obsługa nawigacji
  const handleAddSpider = (): void => {
    setFabOpen(false);
    navigation?.navigate('AddSpider');
  };

  const handleAddFeeding = (): void => {
    setFabOpen(false);
    navigation?.navigate('AddFeeding');
  };

  const handleAnimalPress = (animal: Animal): void => {
    navigation?.navigate('AnimalDetails', { animalId: animal.id });
  };

  // Filtrowanie zwierząt
  const filteredAnimals = animals.filter(animal =>
      animal.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (animal.species || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const showEmptyState = animals.length === 0 && !loading;

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

          {showEmptyState ? (
              <EmptyState
                  title="Brak zwierząt"
                  description="Dodaj swojego pierwszego ptasznika, aby rozpocząć zarządzanie hodowlą"
                  buttonText="Dodaj ptasznika"
                  onButtonPress={handleAddSpider}
              />
          ) : (
              <AnimalsList
                  animals={filteredAnimals}
                  loading={loading}
                  onRefresh={refresh}
                  onAnimalPress={handleAnimalPress}
              />
          )}
        </View>

        <AddActionsFAB
            visible={isFocused}
            open={fabOpen}
            onStateChange={({ open }) => setFabOpen(open)}
            onAddAnimal={handleAddSpider}
            onAddFeeding={handleAddFeeding}
        />
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
});

export default AnimalsListScreen;