import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Animal } from '../../types';
import { animalsService } from '../../services/firebase';
import { unwrapServiceWithMeta } from '../serviceAdapter';
import { queryKeys } from '../queryKeys';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../services/firebase/firebase.config';

export function useMarkDeceasedMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ animalId, deathDate }: { animalId: string; deathDate?: string }) => {
            const animalResult = await animalsService.getById(animalId);

            const updateData: Partial<Animal> = {
                healthStatus: 'deceased',
                isActive: false,
            };

            if (animalResult.success && animalResult.data) {
                updateData.specificData = {
                    ...animalResult.data.specificData,
                    deathDate: deathDate || new Date().toISOString().split('T')[0],
                };
            }

            const result = await unwrapServiceWithMeta(animalsService.update(animalId, updateData));

            if (user?.uid) {
                const profileRef = doc(db, 'userProfiles', user.uid);
                await updateDoc(profileRef, { 'stats.totalAnimals': increment(-1) });
            }

            return result;
        },
        onSuccess: (_data, { animalId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(animalId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.animals.lists() });
        },
    });
}
