import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Searchbar, Text } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { usePublicAnimalsQuery } from '../../api/social';
import { useTheme } from '../../context/ThemeContext';
import { useAnimalFilters } from '../../hooks/useAnimalFilters';
import { EmptyState } from '../../components';
import AnimalsList from '../../components/organisms/AnimalList';
import AnimalFiltersToolbar from '../../components/molecules/AnimalFiltersToolbar';
import { Theme } from '../../styles/theme';
import { Animal } from '../../types';

type RouteParams = {
    UserAnimals: { userId: string; displayName: string };
};

export default function UserAnimalsScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'UserAnimals'>>();
    const { t } = useAppTranslation('animals');

    const { userId, displayName } = route.params;

    const { data: animals = [], isLoading: loading, refetch: refresh } = usePublicAnimalsQuery(userId);

    const filters = useAnimalFilters(animals);

    const handleAnimalPress = (animal: Animal): void => {
        navigation.navigate('UserAnimalDetails', { animalId: animal.id });
    };

    const showEmptyState = animals.length === 0 && !loading;
    const showNoResults = animals.length > 0 && filters.filteredAndSortedAnimals.length === 0;

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('list.userTitle', { name: displayName, count: animals.length })} />
            </Appbar.Header>

            <View style={styles.content}>
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

                {showEmptyState ? (
                    <EmptyState
                        title={t('list.emptyTitle')}
                        description={t('list.userEmptyDescription')}
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
                    />
                )}
            </View>
        </View>
    );
}

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
        marginBottom: 8,
        backgroundColor: theme.colors.backgroundSecondary,
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
