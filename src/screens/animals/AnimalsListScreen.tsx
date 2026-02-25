import {useAnimalsQuery} from "../../api/animals";
import {useLastMoltDatesQuery, useMatingStatusesQuery, useCocoonStatusesQuery} from "../../api/events";
import {useTheme} from "../../context/ThemeContext";
import {useCallback, useMemo, useRef, useState} from "react";
import {Alert, Animated, StyleSheet, View} from "react-native";
import {Appbar, Searchbar, Text} from "react-native-paper";
import {EmptyState} from "../../components";
import AnimalsList from "../../components/organisms/AnimalList";
import AddActionsFAB from "../../components/molecules/AddActionsFAB";
import AnimalFiltersToolbar from "../../components/molecules/AnimalFiltersToolbar";
import UserAvatar from "../../components/atoms/UserAvatar";
import {Theme} from "../../styles/theme";
import {Animal, SpeciesGroup} from "../../types";
import {useAnimalFilters} from "../../hooks/useAnimalFilters";
import {useSpeciesGrouping} from "../../hooks/useSpeciesGrouping";
import {useAnimalSelection} from "../../hooks/useAnimalSelection";
import { useAppTranslation } from '../../hooks/useAppTranslation';

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
  const { t } = useAppTranslation('animals');
  const { data: animals = [], isLoading: loading, refetch: refresh } = useAnimalsQuery();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const isHiddenRef = useRef(false);

  const handleScrollDirectionChange = useCallback((hidden: boolean) => {
    if (hidden === isHiddenRef.current) return;
    isHiddenRef.current = hidden;
    Animated.timing(headerAnim, {
      toValue: hidden ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [headerAnim]);

  const filters = useAnimalFilters(animals);
  const groupedItems = useSpeciesGrouping(filters.filteredAndSortedAnimals);

  const selection = useAnimalSelection(filters.filteredAndSortedAnimals);

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

  const handleGroupPress = (species: string): void => {
    navigation?.navigate('SpeciesAnimals', { species });
  };

  const handleGroupLongPress = (group: SpeciesGroup): void => {
    const animalIds = group.animals.map(a => a.id);
    Alert.alert(
        t('list.deleteGroupTitle'),
        t('list.deleteGroupMessage', { count: group.count, species: group.species }),
        [
          { text: t('common:cancel'), style: 'cancel' },
          {
            text: t('common:delete'),
            style: 'destructive',
            onPress: () => selection.deleteMultipleMutation.mutate(animalIds),
          },
        ],
    );
  };

  const handleProfilePress = (): void => {
    navigation?.navigate('Profile');
  };

  const showEmptyState = animals.length === 0 && !loading;
  const showNoResults = animals.length > 0 && filters.filteredAndSortedAnimals.length === 0;

  const handleQRPrint = (): void => {
    navigation?.navigate('QRPrint');
  };

  return (
      <View style={styles.container}>
        {selection.selectionMode ? (
            <Appbar.Header>
              <Appbar.Action icon="close" onPress={selection.exitSelection} />
              <Appbar.Content title={t('list.selectedCount', { count: selection.selectedIds.size })} />
              <Appbar.Action
                  icon={selection.allSelected ? 'checkbox-blank-outline' : 'checkbox-marked'}
                  onPress={selection.allSelected ? selection.deselectAll : selection.selectAll}
              />
              <Appbar.Action icon="delete" onPress={() => selection.confirmDeleteSelected()} disabled={selection.selectedIds.size === 0} />
            </Appbar.Header>
        ) : (
            <Appbar.Header>
              <Appbar.Content title={t('list.title', { count: animals.length })} />
              <Appbar.Action icon="checkbox-multiple-marked-outline" onPress={selection.enterSelection} />
              <Appbar.Action icon="qrcode" onPress={handleQRPrint} />
              <View style={styles.avatarContainer}>
                <UserAvatar onPress={handleProfilePress} size={36} />
              </View>
            </Appbar.Header>
        )}

        <View style={styles.content}>
          <Animated.View style={{
            maxHeight: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] }),
            opacity: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            overflow: 'hidden',
          }}>
            <Searchbar
                placeholder={t('list.searchPlaceholder')}
                onChangeText={filters.setSearchText}
                value={filters.searchText}
                style={styles.searchBar}
            />

            <AnimalFiltersToolbar
                sexFilter={filters.sexFilter}
                speciesFilter={filters.speciesFilter}
                sortOption={filters.sortOption}
                filtersVisible={filters.filtersVisible}
                availableSpecies={filters.availableSpecies}
                hasActiveFilters={filters.hasActiveFilters}
                toggleFiltersVisible={filters.toggleFiltersVisible}
                toggleSex={filters.toggleSex}
                setSpeciesFilter={filters.setSpeciesFilter}
                setSortOption={filters.setSortOption}
                clearAllFilters={filters.clearAllFilters}
            />
          </Animated.View>

          {showEmptyState ? (
              <EmptyState
                  title={t('list.emptyTitle')}
                  description={t('list.emptyDescription')}
                  onButtonPress={handleAddSpider}
              />
          ) : showNoResults ? (
              <View style={styles.noResults}>
                <Text variant="bodyLarge" style={styles.noResultsText}>
                  {t('common:noResults')}
                </Text>
              </View>
          ) : (
              <AnimalsList
                  animals={filters.filteredAndSortedAnimals}
                  loading={loading}
                  onRefresh={refresh}
                  onAnimalPress={handleAnimalPress}
                  onScrollDirectionChange={handleScrollDirectionChange}
                  matingStatuses={matingStatuses}
                  cocoonStatuses={cocoonStatuses}
                  lastMoltDates={lastMoltDates}
                  groupedItems={groupedItems}
                  onGroupPress={handleGroupPress}
                  onGroupLongPress={handleGroupLongPress}
                  selectionMode={selection.selectionMode}
                  selectedIds={selection.selectedIds}
                  onToggleSelect={selection.toggleSelect}
              />
          )}
        </View>

        {!selection.selectionMode && (
            <AddActionsFAB
                open={fabOpen}
                onStateChange={({ open }) => setFabOpen(open)}
                onAddAnimal={handleAddSpider}
                onAddFeeding={handleAddFeeding}
            />
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
    padding: theme.spacing.medium,
  },
  searchBar: {
    marginBottom: theme.spacing.small,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.small,
  },
  avatarContainer: {
    marginRight: theme.spacing.small,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    color: theme.colors.textSecondary,
  },
});

export default AnimalsListScreen;
