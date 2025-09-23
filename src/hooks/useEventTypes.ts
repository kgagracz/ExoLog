import { useState, useEffect, useCallback } from 'react';
import {EventType} from "../types";
import {eventTypesService} from "../services/firebase";

export const useEventTypes = (animalTypeId?: string) => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Załaduj typy wydarzeń dla konkretnego typu zwierzęcia
  const loadEventTypesForAnimal = useCallback(async (typeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventTypesService.getForAnimalType(typeId);
      
      if (result.success && result.data) {
        setEventTypes(result.data);
      } else {
        setError(result.error || 'Failed to load event types');
        setEventTypes([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event types');
      setEventTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Załaduj wszystkie typy wydarzeń
  const loadAllEventTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventTypesService.getAll();
      
      if (result.success && result.data) {
        setEventTypes(result.data);
      } else {
        setError(result.error || 'Failed to load event types');
        setEventTypes([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event types');
      setEventTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Znajdź typ wydarzenia po nazwie
  const getEventTypeByName = (name: string): EventType | undefined => {
    return eventTypes.find(type => type.name === name);
  };

  // Znajdź typ wydarzenia po ID
  const getEventTypeById = (id: string): EventType | undefined => {
    return eventTypes.find(type => type.id === id);
  };

  // Pogrupowane wydarzenia według kategorii
  const eventsByCategory = eventTypes.reduce((acc, event) => {
    const category = event.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {} as Record<string, EventType[]>);

  // Aktywne typy wydarzeń
  const activeEventTypes = eventTypes.filter(type => type.isActive);

  // Wydarzenia według częstotliwości
  const eventsByFrequency = eventTypes.reduce((acc, event) => {
    const frequency = event.frequency || 'custom';
    if (!acc[frequency]) {
      acc[frequency] = [];
    }
    acc[frequency].push(event);
    return acc;
  }, {} as Record<string, EventType[]>);

  // Statystyki
  const stats = {
    total: eventTypes.length,
    active: activeEventTypes.length,
    inactive: eventTypes.length - activeEventTypes.length,
    byCategory: Object.keys(eventsByCategory).length,
    byFrequency: Object.keys(eventsByFrequency).length
  };

  // Load data na start lub przy zmianie animalTypeId
  useEffect(() => {
    if (animalTypeId) {
      loadEventTypesForAnimal(animalTypeId);
    }
  }, [animalTypeId, loadEventTypesForAnimal]);

  return {
    eventTypes,
    activeEventTypes,
    eventsByCategory,
    eventsByFrequency,
    loading,
    error,
    stats,
    getEventTypeByName,
    getEventTypeById,
    loadForAnimalType: loadEventTypesForAnimal,
    loadAll: loadAllEventTypes,
    refetch: animalTypeId ? () => loadEventTypesForAnimal(animalTypeId) : loadAllEventTypes,
    reload: animalTypeId ? () => loadEventTypesForAnimal(animalTypeId) : loadAllEventTypes
  };
};
