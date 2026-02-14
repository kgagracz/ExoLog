import {useAnimalsQuery} from "../../api/animals";
import {useLastMoltDatesQuery, useMatingStatusesQuery, useCocoonStatusesQuery} from "../../api/events";
import {useTheme} from "../../context/ThemeContext";
import {useCallback, useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Appbar, Searchbar} from "react-native-paper";
import {EmptyState} from "../../components";
import AnimalsList from "../../components/organisms/AnimalList";
import AddActionsFAB from "../../components/molecules/AddActionsFAB";
import UserAvatar from "../../components/atoms/UserAvatar";
import {Theme} from "../../styles/theme";
import {Animal} from "../../types";

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

interface AnimalsListScreenProps {
  navigation?: any;
}

const AnimalsListScreen: React.FC<AnimalsListScreenProps> = ({ navigation }) => {
  const { data: animals = [], isLoading: loading, refetch: refresh } = useAnimalsQuery();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [searchText, setSearchText] = useState<string>('');
  const [fabOpen, setFabOpen] = useState<boolean>(false);

  const allIds = useMemo(() => animals.map(a => a.id), [animals]);
  const femaleIds = useMemo(() => animals.filter(a => a.sex === 'female').map(a => a.id), [animals]);

  const { data: lastMoltDates = {} } = useLastMoltDatesQuery(allIds);
  const { data: matingStatuses = {} } = useMatingStatusesQuery(femaleIds);
  const { data: cocoonStatuses = {} } = useCocoonStatusesQuery(femaleIds);

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

  const handleProfilePress = (): void => {
    navigation?.navigate('Profile');
  };

  // Filtrowanie zwierząt
  const filteredAnimals = animals.filter(animal =>
      animal.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (animal.species || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const showEmptyState = animals.length === 0 && !loading;

  const handleQRPrint = (): void => {
    navigation?.navigate('QRPrint');
  };

  return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="🕷️ Moje Zwierzęta" />
          <Appbar.Action icon="qrcode" onPress={handleQRPrint} />
          <View style={styles.avatarContainer}>
            <UserAvatar onPress={handleProfilePress} size={36} />
          </View>
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
                  onButtonPress={handleAddSpider}
              />
          ) : (
              <AnimalsList
                  animals={filteredAnimals}
                  loading={loading}
                  onRefresh={refresh}
                  onAnimalPress={handleAnimalPress}
                  matingStatuses={matingStatuses}
                  cocoonStatuses={cocoonStatuses}
                  lastMoltDates={lastMoltDates}
              />
          )}
        </View>

        <AddActionsFAB
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
  avatarContainer: {
    marginRight: 8,
  },
});

export default AnimalsListScreen;