import { useState, useEffect, useCallback } from 'react';
import {AnimalType} from "../types";
import {animalTypesService} from "../services/firebase";

export const useAnimalTypes = (categoryId?: string) => {
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Załaduj typy zwierząt dla konkretnej kategorii
  const loadAnimalTypesByCategory = useCallback(async (catId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await animalTypesService.getByCategory(catId);
      
      if (result.success && result.data) {
        setAnimalTypes(result.data);
      } else {
        setError(result.error || 'Failed to load animal types');
        setAnimalTypes([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load animal types');
      setAnimalTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Załaduj wszystkie typy zwierząt
  const loadAllAnimalTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await animalTypesService.getAll();
      
      if (result.success && result.data) {
        setAnimalTypes(result.data);
      } else {
        setError(result.error || 'Failed to load animal types');
        setAnimalTypes([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load animal types');
      setAnimalTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Znajdź typ zwierzęcia po nazwie
  const getTypeByName = (name: string): AnimalType | undefined => {
    return animalTypes.find(type => type.name === name);
  };

  // Znajdź typ zwierzęcia po ID
  const getTypeById = (id: string): AnimalType | undefined => {
    return animalTypes.find(type => type.id === id);
  };

  // Znajdź typy dla konkretnej kategorii (z loaded data)
  const getTypesByCategory = (catId: string): AnimalType[] => {
    return animalTypes.filter(type => type.categoryId === catId);
  };

  // Aktywne typy zwierząt
  const activeAnimalTypes = animalTypes.filter(type => type.isActive);

  // Pogrupowane typy według kategorii
  const typesByCategory = animalTypes.reduce((acc, type) => {
    if (!acc[type.categoryId]) {
      acc[type.categoryId] = [];
    }
    acc[type.categoryId].push(type);
    return acc;
  }, {} as Record<string, AnimalType[]>);

  // Statystyki
  const stats = {
    total: animalTypes.length,
    active: activeAnimalTypes.length,
    inactive: animalTypes.length - activeAnimalTypes.length,
    byCategory: Object.keys(typesByCategory).length
  };

  // Load data na start lub przy zmianie categoryId
  useEffect(() => {
    if (categoryId) {
      loadAnimalTypesByCategory(categoryId);
    }
  }, [categoryId, loadAnimalTypesByCategory]);

  return {
    animalTypes,
    activeAnimalTypes,
    typesByCategory,
    loading,
    error,
    stats,
    getTypeByName,
    getTypeById,
    getTypesByCategory,
    loadByCategory: loadAnimalTypesByCategory,
    loadAll: loadAllAnimalTypes,
    refetch: categoryId ? () => loadAnimalTypesByCategory(categoryId) : loadAllAnimalTypes,
    reload: categoryId ? () => loadAnimalTypesByCategory(categoryId) : loadAllAnimalTypes
  };
};
