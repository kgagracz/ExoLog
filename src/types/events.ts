// src/types/events.ts

import { Photo } from './index';

export type EventTypeId = 'molting' | 'feeding' | 'container_change' | 'mating' | 'cocoon' | 'male_maturation' | 'photo';

export interface BaseEvent {
    id: string;
    animalId: string;
    eventTypeId: EventTypeId;
    userId: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    eventData: Record<string, any>;
    photos: Photo[];
    location?: {
        name?: string;
        address?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    status: 'completed' | 'scheduled' | 'cancelled' | 'in_progress';
    importance: 'low' | 'medium' | 'high' | 'critical';
    reminders?: Reminder[];
    createdAt: string;
    updatedAt: string;
}

export interface Reminder {
    id: string;
    time: string;
    type: 'notification' | 'email' | 'sms';
    sent: boolean;
    message?: string;
}

// Specjalistyczne dane dla wylinki
export interface MoltingEventData {
    previousStage: number;
    newStage: number;
    previousBodyLength?: number;
    newBodyLength?: number;
    complications?: string;
    duration?: number; // w godzinach
}

// Specjalistyczne dane dla karmienia
export interface FeedingEventData {
    foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
    foodSize: 'small' | 'medium' | 'large';
    quantity: number;
    accepted: boolean;
    refusedReason?: string;
}

// Specjalistyczne dane dla zmiany pojemnika
export interface ContainerChangeEventData {
    containerType: 'fauna_box' | 'terrarium' | 'jar' | 'other';
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
    };
    substrate?: string;
    reason?: string;
    accessories?: string[];
}

// Specjalistyczne dane dla krycia
export interface MatingEventData {
    maleId: string;
    femaleId: string;
    successful: boolean;
    duration?: number; // w minutach
    aggressive?: boolean;
    separated?: boolean;
}

// Specjalistyczne dane dla kokonu
export interface CocoonEventData {
    femaleId: string;
    cocoonSize?: number;
    estimatedHatchDate?: string;
    cocoonStatus: 'laid' | 'incubating' | 'hatched' | 'failed';
    eggCount?: number;
    hatchedCount?: number;
}

// Specjalistyczne dane dla dojrzałości samca
export interface MaleMaturationEventData {
    maleId: string;
    readyForBreeding: boolean;
    tibialHooksVisible?: boolean;
    bulbsMatured?: boolean;
}

// Pomocnicze typy dla tworzenia wydarzeń
export type MoltingEvent = BaseEvent & { eventTypeId: 'molting'; eventData: MoltingEventData };
export type FeedingEvent = BaseEvent & { eventTypeId: 'feeding'; eventData: FeedingEventData };
export type ContainerChangeEvent = BaseEvent & { eventTypeId: 'container_change'; eventData: ContainerChangeEventData };
export type MatingEvent = BaseEvent & { eventTypeId: 'mating'; eventData: MatingEventData };
export type CocoonEvent = BaseEvent & { eventTypeId: 'cocoon'; eventData: CocoonEventData };
export type MaleMaturationEvent = BaseEvent & { eventTypeId: 'male_maturation'; eventData: MaleMaturationEventData };
export type PhotoEvent = BaseEvent & { eventTypeId: 'photo' };

export type AnimalEvent =
    | MoltingEvent
    | FeedingEvent
    | ContainerChangeEvent
    | MatingEvent
    | CocoonEvent
    | MaleMaturationEvent
    | PhotoEvent;