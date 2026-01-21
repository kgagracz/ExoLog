// src/services/eventsService.ts

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    serverTimestamp,
    limit as firebaseLimit,
} from 'firebase/firestore';
import {BaseEvent, MoltingEvent, MoltingEventData, MatingEvent, MatingEventData} from "../../types/events";
import {db} from "./firebase.config";
import {removeUndefinedDeep} from "../../utils/objectService";

export const eventsService = {
    // ================== WYLINKA ==================

    addMolting: async (data: {
        animalId: string;
        userId: string;
        date: string;
        eventData: MoltingEventData;
        description?: string;
        photos?: string[];
    }) => {
        try {
            const eventsRef = collection(db, 'events');

            const eventDoc: Omit<BaseEvent, 'id' | 'createdAt' | 'updatedAt'> = removeUndefinedDeep({
                animalId: data.animalId,
                userId: data.userId,
                eventTypeId: 'molting',
                title: `Wylinka L${data.eventData.previousStage} → L${data.eventData.newStage}`,
                description: data.description,
                date: data.date,
                eventData: data.eventData,
                photos: data.photos?.map((url, index) => ({
                    id: `photo-${Date.now()}-${index}`,
                    url,
                    date: data.date,
                    isMain: index === 0,
                })) || [],
                status: 'completed',
                importance: 'medium',
            });

            const docRef = await addDoc(eventsRef, {
                ...eventDoc,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Automatyczna aktualizacja stadium ptasznika
            const animalRef = doc(db, 'animals', data.animalId);
            const updateData: any = {
                stage: data.eventData.newStage,
                updatedAt: serverTimestamp(),
            };

            // Zaktualizuj pole specificData.currentStage (numer wylinki)
            updateData['specificData.currentStage'] = data.eventData.newStage;

            // Jeśli podano nowy rozmiar, zaktualizuj pomiary
            if (data.eventData.newBodyLength) {
                updateData['measurements.length'] = data.eventData.newBodyLength;
                updateData['measurements.lastMeasured'] = data.date;
            }
            const body = removeUndefinedDeep(updateData)

            await updateDoc(animalRef, body);

            return {
                success: true,
                data: { id: docRef.id, ...eventDoc }
            };
        } catch (error: any) {
            console.error('Error adding molting event:', error);
            return {
                success: false,
                error: error.message || 'Failed to add molting event'
            };
        }
    },

    getMoltingHistory: async (animalId: string, limitCount: number = 20) => {
        try {
            const eventsRef = collection(db, 'events');
            const q = query(
                eventsRef,
                where('animalId', '==', animalId),
                where('eventTypeId', '==', 'molting'),
                orderBy('date', 'desc'),
                firebaseLimit(limitCount)
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as MoltingEvent;
            });

            return {
                success: true,
                data: events
            };
        } catch (error: any) {
            console.error('Error getting molting history:', error);
            return {
                success: false,
                error: error.message || 'Failed to get molting history',
                data: []
            };
        }
    },

    getUserMoltings: async (userId: string, limitCount: number = 50) => {
        try {
            const eventsRef = collection(db, 'events');
            const q = query(
                eventsRef,
                where('userId', '==', userId),
                where('eventTypeId', '==', 'molting'),
                orderBy('date', 'desc'),
                firebaseLimit(limitCount)
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as MoltingEvent;
            });

            return {
                success: true,
                data: events
            };
        } catch (error: any) {
            console.error('Error getting user moltings:', error);
            return {
                success: false,
                error: error.message || 'Failed to get user moltings',
                data: []
            };
        }
    },

    updateMolting: async (eventId: string, updates: Partial<BaseEvent>) => {
        try {
            const eventRef = doc(db, 'events', eventId);

            await updateDoc(eventRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error: any) {
            console.error('Error updating molting event:', error);
            return {
                success: false,
                error: error.message || 'Failed to update molting event'
            };
        }
    },

    deleteMolting: async (eventId: string) => {
        try {
            const eventRef = doc(db, 'events', eventId);
            await deleteDoc(eventRef);

            return { success: true };
        } catch (error: any) {
            console.error('Error deleting molting event:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete molting event'
            };
        }
    },

    // ================== OGÓLNE FUNKCJE ==================

    getAnimalEvents: async (
        animalId: string,
        eventTypeId?: string,
        limitCount: number = 50
    ) => {
        try {
            const eventsRef = collection(db, 'events');

            let q;
            if (eventTypeId) {
                q = query(
                    eventsRef,
                    where('animalId', '==', animalId),
                    where('eventTypeId', '==', eventTypeId),
                    orderBy('date', 'desc'),
                    firebaseLimit(limitCount)
                );
            } else {
                q = query(
                    eventsRef,
                    where('animalId', '==', animalId),
                    orderBy('date', 'desc'),
                    firebaseLimit(limitCount)
                );
            }

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as BaseEvent;
            });

            return {
                success: true,
                data: events
            };
        } catch (error: any) {
            console.error('Error getting animal events:', error);
            return {
                success: false,
                error: error.message || 'Failed to get animal events',
                data: []
            };
        }
    },

    getEventById: async (eventId: string) => {
        try {
            const eventRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                return {
                    success: false,
                    error: 'Event not found',
                    data: null
                };
            }

            const data = eventDoc.data();
            return {
                success: true,
                data: {
                    id: eventDoc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as BaseEvent
            };
        } catch (error: any) {
            console.error('Error getting event:', error);
            return {
                success: false,
                error: error.message || 'Failed to get event',
                data: null
            };
        }
    },

    // ================== KOPULACJA ==================

    addMating: async (data: {
        animalId: string;
        userId: string;
        date: string;
        eventData: {
            maleId: string;
            femaleId: string;
            result: 'success' | 'failure' | 'in_progress' | 'unknown';
        };
        description?: string;
        photos?: string[];
    }) => {
        try {
            const eventsRef = collection(db, 'events');

            const resultLabels: Record<string, string> = {
                success: 'Sukces',
                failure: 'Porażka',
                in_progress: 'W trakcie',
                unknown: 'Nieznany',
            };

            const eventDoc: Omit<BaseEvent, 'id' | 'createdAt' | 'updatedAt'> = removeUndefinedDeep({
                animalId: data.animalId,
                userId: data.userId,
                eventTypeId: 'mating',
                title: `Kopulacja - ${resultLabels[data.eventData.result]}`,
                description: data.description,
                date: data.date,
                eventData: {
                    maleId: data.eventData.maleId,
                    femaleId: data.eventData.femaleId,
                    successful: data.eventData.result === 'success',
                    result: data.eventData.result,
                },
                photos: data.photos?.map((url, index) => ({
                    id: `photo-${Date.now()}-${index}`,
                    url,
                    date: data.date,
                    isMain: index === 0,
                })) || [],
                status: data.eventData.result === 'in_progress' ? 'in_progress' : 'completed',
                importance: 'high',
            });

            const docRef = await addDoc(eventsRef, {
                ...eventDoc,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Dodaj również wydarzenie do partnera
            const partnerAnimalId = data.animalId === data.eventData.maleId
                ? data.eventData.femaleId
                : data.eventData.maleId;

            const partnerEventDoc = {
                ...eventDoc,
                animalId: partnerAnimalId,
            };

            await addDoc(eventsRef, {
                ...partnerEventDoc,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return {
                success: true,
                data: { id: docRef.id, ...eventDoc }
            };
        } catch (error: any) {
            console.error('Error adding mating event:', error);
            return {
                success: false,
                error: error.message || 'Failed to add mating event'
            };
        }
    },

    getMatingHistory: async (animalId: string, limitCount: number = 20) => {
        try {
            const eventsRef = collection(db, 'events');
            const q = query(
                eventsRef,
                where('animalId', '==', animalId),
                where('eventTypeId', '==', 'mating'),
                orderBy('date', 'desc'),
                firebaseLimit(limitCount)
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as MatingEvent;
            });

            return {
                success: true,
                data: events
            };
        } catch (error: any) {
            console.error('Error getting mating history:', error);
            return {
                success: false,
                error: error.message || 'Failed to get mating history',
                data: []
            };
        }
    },

    // Sprawdź status kopulacji dla wielu zwierząt naraz
    getMatingStatusForAnimals: async (animalIds: string[]) => {
        try {
            if (animalIds.length === 0) {
                return { success: true, data: {} };
            }

            const eventsRef = collection(db, 'events');
            const matingStatus: Record<string, { hasMating: boolean; lastMatingDate?: string; lastMatingResult?: string }> = {};

            // Inicjalizuj wszystkie jako bez kopulacji
            animalIds.forEach(id => {
                matingStatus[id] = { hasMating: false };
            });

            // Firestore limit 10 dla 'in', więc dzielimy na partie
            const chunks = [];
            for (let i = 0; i < animalIds.length; i += 10) {
                chunks.push(animalIds.slice(i, i + 10));
            }

            for (const chunk of chunks) {
                const q = query(
                    eventsRef,
                    where('animalId', 'in', chunk),
                    where('eventTypeId', '==', 'mating')
                );

                const snapshot = await getDocs(q);

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const animalId = data.animalId;

                    if (!matingStatus[animalId]?.hasMating ||
                        (matingStatus[animalId].lastMatingDate && data.date > matingStatus[animalId].lastMatingDate)) {
                        matingStatus[animalId] = {
                            hasMating: true,
                            lastMatingDate: data.date,
                            lastMatingResult: data.eventData?.result,
                        };
                    }
                });
            }

            return {
                success: true,
                data: matingStatus
            };
        } catch (error: any) {
            console.error('Error getting mating status:', error);
            return {
                success: false,
                error: error.message || 'Failed to get mating status',
                data: {}
            };
        }
    },
};