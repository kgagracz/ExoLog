import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Pressable} from 'react-native';
import {Chip, IconButton, Menu, Text} from 'react-native-paper';
import {useTheme} from '../../context/ThemeContext';
import {Theme} from '../../styles/theme';
import {Animal} from '../../types';
import {
    SortOption,
    SEX_LABELS,
    SORT_LABELS,
} from '../../hooks/useAnimalFilters';

interface AnimalFiltersToolbarProps {
    sexFilter: Set<Animal['sex']>;
    speciesFilter: string | null;
    sortOption: SortOption;
    filtersVisible: boolean;
    availableSpecies: string[];
    hasActiveFilters: boolean;
    toggleFiltersVisible: () => void;
    toggleSex: (sex: Animal['sex']) => void;
    setSpeciesFilter: (species: string | null) => void;
    setSortOption: (option: SortOption) => void;
    clearAllFilters: () => void;
}

const SEX_OPTIONS: Animal['sex'][] = ['male', 'female', 'unknown'];
const SORT_OPTIONS: SortOption[] = [
    'name-asc', 'name-desc',
    'dateAcquired-desc', 'dateAcquired-asc',
    'species-asc', 'species-desc',
];

const AnimalFiltersToolbar: React.FC<AnimalFiltersToolbarProps> = ({
    sexFilter,
    speciesFilter,
    sortOption,
    filtersVisible,
    availableSpecies,
    hasActiveFilters,
    toggleFiltersVisible,
    toggleSex,
    setSpeciesFilter,
    setSortOption,
    clearAllFilters,
}) => {
    const {theme} = useTheme();
    const styles = makeStyles(theme);

    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [speciesMenuVisible, setSpeciesMenuVisible] = useState(false);

    return (
        <View>
            {/* Top bar: filter toggle + sort menu */}
            <View style={styles.topBar}>
                <View>
                    <IconButton
                        icon="filter-variant"
                        onPress={toggleFiltersVisible}
                        style={styles.iconButton}
                    />
                    {hasActiveFilters && <View style={styles.filterDot} />}
                </View>

                <Menu
                    visible={sortMenuVisible}
                    onDismiss={() => setSortMenuVisible(false)}
                    anchor={
                        <IconButton
                            icon="sort"
                            onPress={() => setSortMenuVisible(true)}
                            style={styles.iconButton}
                        />
                    }
                >
                    {SORT_OPTIONS.map(option => (
                        <Menu.Item
                            key={option}
                            title={SORT_LABELS[option]}
                            leadingIcon={sortOption === option ? 'check' : undefined}
                            onPress={() => {
                                setSortOption(option);
                                setSortMenuVisible(false);
                            }}
                        />
                    ))}
                </Menu>
            </View>

            {/* Expandable filters section */}
            {filtersVisible && (
                <View style={styles.filtersSection}>
                    {/* Sex filter */}
                    <Text variant="labelMedium" style={styles.filterLabel}>
                        Płeć
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipsRow}
                    >
                        {SEX_OPTIONS.map(sex => (
                            <Chip
                                key={sex}
                                selected={sexFilter.has(sex)}
                                onPress={() => toggleSex(sex)}
                                compact
                                style={styles.filterChip}
                                showSelectedCheck={false}
                            >
                                {SEX_LABELS[sex]}
                            </Chip>
                        ))}
                    </ScrollView>

                    {/* Species filter */}
                    {availableSpecies.length > 0 && (
                        <>
                            <Text variant="labelMedium" style={styles.filterLabel}>
                                Gatunek
                            </Text>
                            <Menu
                                visible={speciesMenuVisible}
                                onDismiss={() => setSpeciesMenuVisible(false)}
                                anchor={
                                    <Pressable onPress={() => setSpeciesMenuVisible(true)}>
                                        <Chip
                                            icon="chevron-down"
                                            compact
                                            style={styles.filterChip}
                                        >
                                            {speciesFilter || 'Wszystkie gatunki'}
                                        </Chip>
                                    </Pressable>
                                }
                            >
                                <Menu.Item
                                    title="Wszystkie gatunki"

                                    leadingIcon={speciesFilter === null ? 'check' : undefined}
                                    onPress={() => {
                                        setSpeciesFilter(null);
                                        setSpeciesMenuVisible(false);
                                    }}
                                />
                                {availableSpecies.map(species => (
                                    <Menu.Item
                                        key={species}
                                        title={species}
    
                                        leadingIcon={speciesFilter === species ? 'check' : undefined}
                                        onPress={() => {
                                            setSpeciesFilter(species);
                                            setSpeciesMenuVisible(false);
                                        }}
                                    />
                                ))}
                            </Menu>
                        </>
                    )}
                </View>
            )}

            {/* Active filters chips */}
            {hasActiveFilters && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.activeFiltersRow}
                >
                    {Array.from(sexFilter).map(sex => (
                        <Chip
                            key={`sex-${sex}`}
                            onClose={() => toggleSex(sex)}
                            compact
                            style={styles.activeChip}

                        >
                            {SEX_LABELS[sex]}
                        </Chip>
                    ))}
                    {speciesFilter && (
                        <Chip
                            onClose={() => setSpeciesFilter(null)}
                            compact
                            style={styles.activeChip}

                        >
                            {speciesFilter}
                        </Chip>
                    )}
                    <Chip
                        icon="close"
                        onPress={clearAllFilters}
                        compact
                        style={styles.clearChip}
                        textStyle={styles.clearChipText}
                    >
                        Wyczyść
                    </Chip>
                </ScrollView>
            )}
        </View>
    );
};

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        topBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        iconButton: {
            margin: 0,
        },
        filterDot: {
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
        },
        filtersSection: {
            marginBottom: 8,
            paddingHorizontal: 4,
        },
        filterLabel: {
            color: theme.colors.textSecondary,
            marginBottom: 4,
            marginTop: 8,
        },
        chipsRow: {
            flexDirection: 'row',
            marginBottom: 4,
        },
        filterChip: {
            marginRight: 6,
            height: 28,
        },
        activeFiltersRow: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        activeChip: {
            marginRight: 6,
            height: 32,
        },
        clearChip: {
            marginRight: 6,
            height: 32,
            backgroundColor: theme.colors.errorContainer,
        },
        clearChipText: {
            color: theme.colors.error,
        },
    });

export default AnimalFiltersToolbar;
