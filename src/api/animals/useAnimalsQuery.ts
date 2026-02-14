import { useQuery } from '@tanstack/react-query';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapService } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';

export function useAnimalsQuery() {
    const { user, isAuthenticated } = useAuth();
    return useQuery<Animal[]>({
        queryKey: queryKeys.animals.list(user?.uid ?? ''),
        queryFn: () => unwrapService(animalsService.getUserAnimals(user!.uid)),
        enabled: !!user && isAuthenticated,
    });
}
