export interface AnimalCategory {
  id: string;
  name: string;
  displayName: {
    en: string;
    pl: string;
  };
  icon: string;
  color: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalType {
  id: string;
  categoryId: string;
  name: string;
  displayName: {
    en: string;
    pl: string;
  };
  icon?: string;
  description?: string;
  specificFields: SpecificField[];
  defaultEventTypes: string[];
  careRequirements: CareRequirement[];
  averageLifespan?: {
    min: number;
    max: number;
    unit: 'months' | 'years';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecificField {
  key: string;
  label: {
    en: string;
    pl: string;
  };
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'multiselect';
  options?: string[];
  required: boolean;
  category: 'physical' | 'behavior' | 'breeding' | 'health' | 'housing' | 'other';
  placeholder?: {
    en: string;
    pl: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: {
      en: string;
      pl: string;
    };
  };
  unit?: string;
  helpText?: {
    en: string;
    pl: string;
  };
}

export interface CareRequirement {
  aspect: string;
  label: {
    en: string;
    pl: string;
  };
  value: string;
  unit?: string;
  range?: {
    min: number;
    max: number;
  };
  priority: 'critical' | 'important' | 'recommended';
  description?: {
    en: string;
    pl: string;
  };
}

export interface EventType {
  id: string;
  name: string;
  displayName: {
    en: string;
    pl: string;
  };
  description?: {
    en: string;
    pl: string;
  };
  icon: string;
  color: string;
  category: 'health' | 'feeding' | 'breeding' | 'grooming' | 'behavior' | 'housing' | 'medical' | 'other';
  applicableToTypes: string[];
  specificFields: EventSpecificField[];
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventSpecificField {
  key: string;
  label: {
    en: string;
    pl: string;
  };
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'time' | 'duration' | 'weight' | 'temperature';
  options?: string[];
  required: boolean;
  placeholder?: {
    en: string;
    pl: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  unit?: string;
}

export interface Animal {
  id: string;
  userId: string;
  categoryId: string;
  animalTypeId: string;
  name: string;
  species?: string;
  breed?: string;
  sex: 'male' | 'female' | 'unknown' | 'hermaphrodite';
  stage: 'baby' | 'juvenile' | 'subadult' | 'adult' | 'senior';
  dateAcquired: string;
  dateOfBirth?: string;
  measurements: {
    weight?: number;
    length?: number;
    height?: number;
    wingspan?: number;
    lastMeasured?: string;
  };
  specificData: Record<string, any>;
  healthStatus: 'healthy' | 'sick' | 'injured' | 'recovering' | 'quarantine' | 'deceased';
  isActive: boolean;
  housing: {
    type: string;
    location?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      volume?: number;
    };
    substrate?: string;
    temperature?: {
      day?: number;
      night?: number;
      water?: number;
    };
    humidity?: number;
    lighting?: string;
    heating?: string;
    filtration?: string;
    accessories?: string[];
    lastCleaned?: string;
    [key: string]: any;
  };
  feeding: {
    schedule: string;
    lastFed?: string;
    foodType?: string;
    foodBrand?: string;
    amount?: string;
    feedingTime?: string;
    specialDiet?: string;
    refusedFeedings?: number;
    feedingNotes?: string;
  };
  photos: Photo[];
  notes: string;
  behavior: string;
  personality?: string;
  tags: string[];
  veterinary: {
    vetName?: string;
    vetContact?: string;
    lastVisit?: string;
    nextVisit?: string;
    vaccinations?: VaccinationRecord[];
    medications?: MedicationRecord[];
    allergies?: string[];
    medicalNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  date: string;
  title?: string;
  description?: string;
  tags?: string[];
  isMain?: boolean;
}

export interface AnimalEvent {
  id: string;
  animalId: string;
  eventTypeId: string;
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

export interface VaccinationRecord {
  id: string;
  vaccine: string;
  date: string;
  nextDue?: string;
  vetName?: string;
  batchNumber?: string;
  sideEffects?: string;
}

export interface MedicationRecord {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reason: string;
  vetPrescribed: boolean;
  sideEffects?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: {
    language: 'en' | 'pl';
    theme: 'light' | 'dark' | 'auto';
    units: {
      temperature: 'celsius' | 'fahrenheit';
      weight: 'grams' | 'ounces' | 'pounds';
      length: 'cm' | 'inches';
    };
    notifications: {
      feeding: boolean;
      health: boolean;
      events: boolean;
      marketing: boolean;
    };
    privacy: {
      publicProfile: boolean;
      shareStatistics: boolean;
    };
  };
  stats: {
    totalAnimals: number;
    categoriesUsed: string[];
    joinDate: string;
    lastActive: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type TabParamList = {
  Dashboard: undefined;
  Animals: undefined;
  Events: undefined;
  Stats: undefined;
  Settings: undefined;
};