// src/hooks/useEvents.ts

import { useState } from 'react';
import { MoltingEvent, BaseEvent, MoltingEventData, MatingEvent } from '../types/events';
import { useAuth } from './useAuth';
import {eventsService} from "../services/firebase/eventsService";

export const useEvents = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, isAuthenticated } = useAuth();

    // ================== WYLINKA ==================

    const addMolting = async (data: {
        animalId: string;
        date: string;
        eventData: MoltingEventData;
        description?: string;
        photos?: string[];
    }) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.addMolting({
                ...data,
                userId: user.uid,
            });

            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const getMoltingHistory = async (animalId: string, limit?: number) => {
        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.getMoltingHistory(animalId, limit);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message, data: [] };
        } finally {
            setLoading(false);
        }
    };

    const getUserMoltings = async (limit?: number) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated', data: [] };
        }

        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.getUserMoltings(user.uid, limit);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message, data: [] };
        } finally {
            setLoading(false);
        }
    };

    const updateMolting = async (eventId: string, updates: Partial<BaseEvent>) => {
        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.updateMolting(eventId, updates);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteMolting = async (eventId: string) => {
        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.deleteMolting(eventId);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // ================== KOPULACJA ==================

    const addMating = async (data: {
        animalId: string;
        date: string;
        eventData: {
            maleId: string;
            femaleId: string;
            result: 'success' | 'failure' | 'in_progress' | 'unknown';
        };
        description?: string;
        photos?: string[];
    }) => {
        if (!user || !isAuthenticated) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.addMating({
                ...data,
                userId: user.uid,
            });

            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const getMatingHistory = async (animalId: string, limit?: number) => {
        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.getMatingHistory(animalId, limit);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message, data: [] };
        } finally {
            setLoading(false);
        }
    };

    // ================== OGÓLNE FUNKCJE ==================

    const getAnimalEvents = async (
        animalId: string,
        eventTypeId?: string,
        limit?: number
    ) => {
        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.getAnimalEvents(animalId, eventTypeId, limit);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message, data: [] };
        } finally {
            setLoading(false);
        }
    };

    const getEventById = async (eventId: string) => {
        try {
            setLoading(true);
            setError(null);

            const result = await eventsService.getEventById(eventId);
            return result;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message, data: null };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        clearError: () => setError(null),

        // Wylinka
        addMolting,
        getMoltingHistory,
        getUserMoltings,
        updateMolting,
        deleteMolting,

        // Kopulacja
        addMating,
        getMatingHistory,

        // Ogólne
        getAnimalEvents,
        getEventById,
    };
};