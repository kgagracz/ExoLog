import { useState, useEffect } from 'react';
import {animalsService} from "../services/firebase";
import {Animal} from "../types";

export const useAnimals = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user  = {uid: '12'}
    // const { user } = useAuth();

    const loadAnimals = async () => {
        if (!user) {
            setAnimals([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await animalsService.getUserAnimals(user.uid);

            if (result.success && result.data) {
                setAnimals(result.data);
                setError(null);
            } else {
                setError(result.error || 'Failed to load animals');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load animals');
        } finally {
            setLoading(false);
        }
    };

    const addAnimal = async (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
            const result = await animalsService.add({
                ...animalData,
                userId: user.uid
            });

            if (result.success) {
                await loadAnimals(); // Reload list
            }

            return result;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        // loadAnimals();
    }, [user]);

    return {
        animals,
        loading,
        error,
        addAnimal,
        refetch: loadAnimals
    };
};
