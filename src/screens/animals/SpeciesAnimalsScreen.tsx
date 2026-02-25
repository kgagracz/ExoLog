import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Appbar, Searchbar, Text } from 'react-native-paper';
import { useAnimalsQuery } from '../../api/animals';
import { useLastMoltDatesQuery, useMatingStatusesQuery, useCocoonStatusesQuery } from '../../api/events';
import { useTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAnimalFilters } from '../../hooks/useAnimalFilters';
import { useAnimalSelection } from '../../hooks/useAnimalSelection';
import AnimalsList from '../../components/organisms/AnimalList';
import AnimalFiltersToolbar from '../../components/molecules/AnimalFiltersToolbar';
import { Theme } from '../../styles/theme';
import { Animal } from '../../types';

interface SpeciesAnimalsScreenProps {
    navigation?: any;
    route?: { params: { species: string } };
}

const SpeciesAnimalsScreen: React.FC<SpeciesAnimalsScreenProps> = ({ navigation, route }) => {
    const species = route?.params?.species ?? '';
    const { t } = useAppTranslation('animals');
    const { data: allAnimals = [], isLoading: loading, refetch: refresh } = useAnimalsQuery();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const headerAnim = useRef(new Animated.Value(0)).current;
    const isHiddenRef = useRef(false);

    const speciesAnimals = useMemo(
        () => allAnimals.filter(a => a.species === species),
        [allAnimals, species],
    );

    const filters = useAnimalFilters(speciesAnimals);
    const selection = useAnimalSelection(filters.filteredAndSortedAnimals);

    const allIds = useMemo(() => speciesAnimals.map(a => a.id), [speciesAnimals]);
    const femaleIds = useMemo(() => speciesAnimals.filter(a => a.sex === 'female').map(a => a.id), [speciesAnimals]);

    const { data: lastMoltDates = {} } = useLastMoltDatesQuery(allIds);
    const { data: matingStatuses = {} } = useMatingStatusesQuery(femaleIds);
    const { data: cocoonStatuses = {} } = useCocoonStatusesQuery(femaleIds);

    useEffect(() => {
        if (speciesAnimals.length === 0 && !loading) {
            navigation?.goBack();
        }
    }, [speciesAnimals.length, loading, navigation]);

    const handleScrollDirectionChange = useCallback((hidden: boolean) => {
        if (hidden === isHiddenRef.current) return;
        isHiddenRef.current = hidden;
        Animated.timing(headerAnim, {
            toValue: hidden ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [headerAnim]);

    const handleAnimalPress = (animal: Animal): void => {
        navigation?.navigate('AnimalDetails', { animalId: animal.id });
    };

    const showNoResults = speciesAnimals.length > 0 && filters.filteredAndSortedAnimals.length === 0;

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
                    <Appbar.BackAction onPress={() => navigation?.goBack()} />
                    <Appbar.Content title={`${species} (${speciesAnimals.length})`} titleStyle={styles.headerTitle} />
                    <Appbar.Action icon="checkbox-multiple-marked-outline" onPress={selection.enterSelection} />
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

                {showNoResults ? (
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
                        selectionMode={selection.selectionMode}
                        selectedIds={selection.selectedIds}
                        onToggleSelect={selection.toggleSelect}
                    />
                )}
            </View>
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
    headerTitle: {
        fontStyle: 'italic',
    },
    searchBar: {
        marginBottom: theme.spacing.small,
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.large,
        ...theme.shadows.small,
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

export default SpeciesAnimalsScreen;
