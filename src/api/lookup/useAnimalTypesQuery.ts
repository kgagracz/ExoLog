import { useQuery } from '@tanstack/react-query';
import { AnimalType } from '../../types';
import { animalTypesService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useAnimalTypesQuery(categoryId?: string) {
    return useQuery<AnimalType[]>({
        queryKey: categoryId
            ? queryKeys.lookup.animalTypes.byCategory(categoryId)
            : queryKeys.lookup.animalTypes.all(),
        queryFn: () => categoryId
            ? unwrapService(animalTypesService.getByCategory(categoryId))
            : unwrapService(animalTypesService.getAll()),
    });
}
