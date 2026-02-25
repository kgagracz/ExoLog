import { useMemo } from 'react';
import { Animal, AnimalListItem } from '../types';

const GROUP_THRESHOLD = 3;

export function useSpeciesGrouping(animals: Animal[]): AnimalListItem[] {
    return useMemo(() => {
        const speciesCounts = new Map<string, Animal[]>();

        for (const animal of animals) {
            if (!animal.species) continue;
            const list = speciesCounts.get(animal.species);
            if (list) {
                list.push(animal);
            } else {
                speciesCounts.set(animal.species, [animal]);
            }
        }

        const groupedSpecies = new Set<string>();
        for (const [species, list] of speciesCounts) {
            if (list.length > GROUP_THRESHOLD) {
                groupedSpecies.add(species);
            }
        }

        const result: AnimalListItem[] = [];
        const emittedGroups = new Set<string>();

        for (const animal of animals) {
            if (animal.species && groupedSpecies.has(animal.species)) {
                if (!emittedGroups.has(animal.species)) {
                    emittedGroups.add(animal.species);
                    const groupAnimals = speciesCounts.get(animal.species)!;
                    result.push({
                        type: 'group',
                        species: animal.species,
                        animals: groupAnimals,
                        representativeAnimal: groupAnimals[0],
                        count: groupAnimals.length,
                    });
                }
            } else {
                result.push({ type: 'individual', animal });
            }
        }

        return result;
    }, [animals]);
}
