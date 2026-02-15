import {useMemo, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Animal} from '../types';

export type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'dateAcquired-desc'
    | 'dateAcquired-asc'
    | 'species-asc'
    | 'species-desc';

export function useFilterLabels() {
    const {t} = useTranslation('filters');

    const SEX_LABELS: Record<Animal['sex'], string> = {
        male: t('sex.male'),
        female: t('sex.female'),
        unknown: t('sex.unknown'),
        hermaphrodite: t('sex.hermaphrodite'),
    };

    const STAGE_LABELS: Record<Animal['stage'], string> = {
        baby: t('stage.baby'),
        juvenile: t('stage.juvenile'),
        subadult: t('stage.subadult'),
        adult: t('stage.adult'),
        senior: t('stage.senior'),
    };

    const SORT_LABELS: Record<SortOption, string> = {
        'name-asc': t('sort.name-asc'),
        'name-desc': t('sort.name-desc'),
        'dateAcquired-desc': t('sort.dateAcquired-desc'),
        'dateAcquired-asc': t('sort.dateAcquired-asc'),
        'species-asc': t('sort.species-asc'),
        'species-desc': t('sort.species-desc'),
    };

    return {SEX_LABELS, STAGE_LABELS, SORT_LABELS};
}

export function useAnimalFilters(animals: Animal[]) {
    const [searchText, setSearchText] = useState('');
    const [sexFilter, setSexFilter] = useState<Set<Animal['sex']>>(new Set());
    const [stageFilter, setStageFilter] = useState<Set<Animal['stage']>>(new Set());
    const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('name-asc');
    const [filtersVisible, setFiltersVisible] = useState(false);

    const availableSpecies = useMemo(() => {
        const genera = new Set(
            (animals.map(a => a.species).filter(Boolean) as string[])
                .map(s => s.split(' ')[0]),
        );
        return Array.from(genera).sort((a, b) => a.localeCompare(b, 'pl'));
    }, [animals]);

    const hasActiveFilters = useMemo(
        () => sexFilter.size > 0 || stageFilter.size > 0 || speciesFilter !== null,
        [sexFilter, stageFilter, speciesFilter],
    );

    const filteredAndSortedAnimals = useMemo(() => {
        let result = animals;

        // Text search
        if (searchText) {
            const lower = searchText.toLowerCase();
            result = result.filter(
                a =>
                    a.name.toLowerCase().includes(lower) ||
                    (a.species || '').toLowerCase().includes(lower),
            );
        }

        // Sex filter (OR within category)
        if (sexFilter.size > 0) {
            result = result.filter(a => sexFilter.has(a.sex));
        }

        // Stage filter (OR within category)
        if (stageFilter.size > 0) {
            result = result.filter(a => stageFilter.has(a.stage));
        }

        // Species filter (by genus — first part of species name)
        if (speciesFilter) {
            result = result.filter(a => a.species?.startsWith(speciesFilter));
        }

        // Sort
        const sorted = [...result];
        switch (sortOption) {
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name, 'pl'));
                break;
            case 'dateAcquired-desc':
                sorted.sort((a, b) => b.dateAcquired.localeCompare(a.dateAcquired));
                break;
            case 'dateAcquired-asc':
                sorted.sort((a, b) => a.dateAcquired.localeCompare(b.dateAcquired));
                break;
            case 'species-asc':
                sorted.sort((a, b) =>
                    (a.species || '').localeCompare(b.species || '', 'pl'),
                );
                break;
            case 'species-desc':
                sorted.sort((a, b) =>
                    (b.species || '').localeCompare(a.species || '', 'pl'),
                );
                break;
        }

        return sorted;
    }, [animals, searchText, sexFilter, stageFilter, speciesFilter, sortOption]);

    const toggleSex = useCallback((sex: Animal['sex']) => {
        setSexFilter(prev => {
            const next = new Set(prev);
            if (next.has(sex)) {
                next.delete(sex);
            } else {
                next.add(sex);
            }
            return next;
        });
    }, []);

    const toggleStage = useCallback((stage: Animal['stage']) => {
        setStageFilter(prev => {
            const next = new Set(prev);
            if (next.has(stage)) {
                next.delete(stage);
            } else {
                next.add(stage);
            }
            return next;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setSexFilter(new Set());
        setStageFilter(new Set());
        setSpeciesFilter(null);
    }, []);

    const toggleFiltersVisible = useCallback(() => {
        setFiltersVisible(prev => !prev);
    }, []);

    return {
        searchText,
        setSearchText,
        sexFilter,
        stageFilter,
        speciesFilter,
        setSpeciesFilter,
        sortOption,
        setSortOption,
        filtersVisible,
        toggleFiltersVisible,
        availableSpecies,
        hasActiveFilters,
        filteredAndSortedAnimals,
        toggleSex,
        toggleStage,
        clearAllFilters,
    };
}
