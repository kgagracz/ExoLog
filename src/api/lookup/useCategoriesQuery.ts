import { useQuery } from '@tanstack/react-query';
import { AnimalCategory } from '../../types';
import { categoriesService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useCategoriesQuery() {
    return useQuery<AnimalCategory[]>({
        queryKey: queryKeys.lookup.categories(),
        queryFn: () => unwrapService(categoriesService.getAll()),
    });
}
