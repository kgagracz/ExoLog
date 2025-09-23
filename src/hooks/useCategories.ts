import { useState, useEffect } from 'react';
import {AnimalCategory} from "../types";
import {categoriesService} from "../services/firebase";

export const useCategories = () => {
  const [categories, setCategories] = useState<AnimalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoriesService.getAll();
      
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.error || 'Failed to load categories');
        setCategories([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Znajdź kategorię po nazwie
  const getCategoryByName = (name: string): AnimalCategory | undefined => {
    return categories.find(category => category.name === name);
  };

  // Znajdź kategorię po ID
  const getCategoryById = (id: string): AnimalCategory | undefined => {
    return categories.find(category => category.id === id);
  };

  // Posortowane kategorie według order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Aktywne kategorie
  const activeCategories = categories.filter(category => category.isActive);

  // Statystyki kategorii
  const stats = {
    total: categories.length,
    active: activeCategories.length,
    inactive: categories.length - activeCategories.length
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    sortedCategories,
    activeCategories,
    loading,
    error,
    stats,
    getCategoryByName,
    getCategoryById,
    refetch: loadCategories,
    reload: loadCategories
  };
};
