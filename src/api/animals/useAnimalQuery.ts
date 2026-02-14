import { useQuery } from '@tanstack/react-query';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';

export function useAnimalQuery(animalId: string | undefined) {
    return useQuery<Animal>({
        queryKey: queryKeys.animals.detail(animalId ?? ''),
        queryFn: () => unwrapService(animalsService.getById(animalId!)),
        enabled: !!animalId,
    });
}
