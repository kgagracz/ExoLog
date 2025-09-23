import { useCategories } from './useCategories';
import { useAnimalTypes } from './useAnimalTypes';
import { useEventTypes } from './useEventTypes';

// Hook łączący wszystkie podstawowe dane aplikacji
export const useAppData = () => {
  const categoriesHook = useCategories();
  const animalTypesHook = useAnimalTypes(); // Bez categoryId - pobierze wszystkie
  const eventTypesHook = useEventTypes(); // Bez animalTypeId - pobierze wszystkie

  // Ogólny stan ładowania
  const loading = categoriesHook.loading || animalTypesHook.loading || eventTypesHook.loading;
  
  // Ogólny stan błędów
  const errors = [
    categoriesHook.error,
    animalTypesHook.error, 
    eventTypesHook.error
  ].filter(Boolean);

  const hasErrors = errors.length > 0;
  const firstError = errors[0] || null;

  // Sprawdź czy aplikacja jest gotowa (wszystkie dane załadowane)
  const isReady = !loading && 
                  categoriesHook.categories.length > 0 && 
                  animalTypesHook.animalTypes.length > 0 &&
                  eventTypesHook.eventTypes.length > 0;

  // Odśwież wszystkie dane
  const refetchAll = async () => {
    await Promise.all([
      categoriesHook.refetch(),
      animalTypesHook.loadAll(),
      eventTypesHook.loadAll()
    ]);
  };

  // Znajdź kompletne informacje o typie zwierzęcia (z kategorią)
  const getCompleteAnimalTypeInfo = (animalTypeId: string) => {
    const animalType = animalTypesHook.getTypeById(animalTypeId);
    if (!animalType) return null;

    const category = categoriesHook.getCategoryById(animalType.categoryId);
    const eventTypes = eventTypesHook.eventTypes.filter(
      et => et.applicableToTypes.includes('*') || et.applicableToTypes.includes(animalType.name)
    );

    return {
      animalType,
      category,
      availableEventTypes: eventTypes
    };
  };

  return {
    // Poszczególne hooki
    categories: categoriesHook,
    animalTypes: animalTypesHook,
    eventTypes: eventTypesHook,

    // Ogólny stan
    loading,
    hasErrors,
    error: firstError,
    isReady,

    // Pomocnicze funkcje
    refetchAll,
    getCompleteAnimalTypeInfo,

    // Statystyki ogólne
    stats: {
      categories: categoriesHook.stats,
      animalTypes: animalTypesHook.stats,
      eventTypes: eventTypesHook.stats
    }
  };
};
