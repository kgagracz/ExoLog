import { useCategoriesQuery } from './useCategoriesQuery';
import { useAnimalTypesQuery } from './useAnimalTypesQuery';
import { useEventTypesQuery } from './useEventTypesQuery';

export function useAppDataQueries() {
    const categoriesQuery = useCategoriesQuery();
    const animalTypesQuery = useAnimalTypesQuery();
    const eventTypesQuery = useEventTypesQuery();

    const loading = categoriesQuery.isLoading || animalTypesQuery.isLoading || eventTypesQuery.isLoading;
    const hasErrors = categoriesQuery.isError || animalTypesQuery.isError || eventTypesQuery.isError;
    const error = categoriesQuery.error?.message || animalTypesQuery.error?.message || eventTypesQuery.error?.message || null;

    const categories = categoriesQuery.data ?? [];
    const animalTypes = animalTypesQuery.data ?? [];
    const eventTypes = eventTypesQuery.data ?? [];

    const isReady = !loading && categories.length > 0 && animalTypes.length > 0 && eventTypes.length > 0;

    const refetchAll = async () => {
        await Promise.all([
            categoriesQuery.refetch(),
            animalTypesQuery.refetch(),
            eventTypesQuery.refetch(),
        ]);
    };

    const getCategoryById = (id: string) => categories.find(c => c.id === id);
    const getCategoryByName = (name: string) => categories.find(c => c.name === name);
    const getTypeById = (id: string) => animalTypes.find(t => t.id === id);
    const getTypeByName = (name: string) => animalTypes.find(t => t.name === name);
    const getEventTypeById = (id: string) => eventTypes.find(e => e.id === id);
    const getEventTypeByName = (name: string) => eventTypes.find(e => e.name === name);

    const getCompleteAnimalTypeInfo = (animalTypeId: string) => {
        const animalType = getTypeById(animalTypeId);
        if (!animalType) return null;
        const category = getCategoryById(animalType.categoryId);
        const applicableEventTypes = eventTypes.filter(
            et => et.applicableToTypes.includes('*') || et.applicableToTypes.includes(animalType.name)
        );
        return { animalType, category, availableEventTypes: applicableEventTypes };
    };

    return {
        categories,
        animalTypes,
        eventTypes,
        loading,
        hasErrors,
        error,
        isReady,
        refetchAll,
        getCategoryById,
        getCategoryByName,
        getTypeById,
        getTypeByName,
        getEventTypeById,
        getEventTypeByName,
        getCompleteAnimalTypeInfo,
    };
}
