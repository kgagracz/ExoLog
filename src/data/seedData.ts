import { AnimalCategory, AnimalType, EventType } from '@types/index';

export const SEED_CATEGORIES: Omit<AnimalCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'arachnids',
    displayName: { en: 'Arachnids', pl: 'Pajęczaki' },
    icon: 'bug_report',
    color: '#8B4513',
    description: 'Spiders, scorpions, and other eight-legged creatures',
    order: 1,
    isActive: true
  },
  {
    name: 'reptiles',
    displayName: { en: 'Reptiles', pl: 'Gady' },
    icon: 'pets',
    color: '#228B22',
    description: 'Snakes, lizards, turtles, and other cold-blooded vertebrates',
    order: 2,
    isActive: true
  },
  {
    name: 'mammals',
    displayName: { en: 'Mammals', pl: 'Ssaki' },
    icon: 'pets',
    color: '#DEB887',
    description: 'Dogs, cats, rabbits, and other warm-blooded animals',
    order: 3,
    isActive: true
  },
  {
    name: 'birds',
    displayName: { en: 'Birds', pl: 'Ptaki' },
    icon: 'flutter_dash',
    color: '#4169E1',
    description: 'Parrots, canaries, finches, and other feathered friends',
    order: 4,
    isActive: true
  },
  {
    name: 'aquatic',
    displayName: { en: 'Aquatic', pl: 'Wodne' },
    icon: 'waves',
    color: '#0088CC',
    description: 'Fish, aquatic reptiles, amphibians, and marine life',
    order: 5,
    isActive: true
  }
];

export const SEED_ANIMAL_TYPES = {
  arachnids: [
    {
      name: 'tarantula',
      displayName: { en: 'Tarantula', pl: 'Ptasznik' },
      icon: 'bug_report',
      description: 'Large, hairy spiders popular in exotic pet keeping',
      specificFields: [
        {
          key: 'webType',
          label: { en: 'Web Type', pl: 'Typ sieci' },
          type: 'select' as const,
          options: ['none', 'funnel', 'sheet', 'orb', 'minimal'],
          required: false,
          category: 'behavior' as const,
          placeholder: { en: 'Select web type', pl: 'Wybierz typ sieci' }
        },
        {
          key: 'urticatingHairs',
          label: { en: 'Urticating Hairs', pl: 'Włoski żądłowe' },
          type: 'boolean' as const,
          required: false,
          category: 'physical' as const
        }
      ],
      defaultEventTypes: ['molt', 'feeding', 'container_change', 'photo'],
      careRequirements: [
        {
          aspect: 'temperature',
          label: { en: 'Temperature', pl: 'Temperatura' },
          value: '20-26°C',
          priority: 'critical' as const
        }
      ],
      isActive: true
    }
  ],
  mammals: [
    {
      name: 'dog',
      displayName: { en: 'Dog', pl: 'Pies' },
      icon: 'pets',
      description: 'Loyal companion and family pet',
      specificFields: [
        {
          key: 'breed',
          label: { en: 'Breed', pl: 'Rasa' },
          type: 'text' as const,
          required: false,
          category: 'physical' as const
        },
        {
          key: 'microchipped',
          label: { en: 'Microchipped', pl: 'Zaczipowany' },
          type: 'boolean' as const,
          required: false,
          category: 'health' as const
        }
      ],
      defaultEventTypes: ['feeding', 'walk', 'grooming', 'vet_visit'],
      careRequirements: [
        {
          aspect: 'exercise',
          label: { en: 'Exercise', pl: 'Ruch' },
          value: 'Daily walks required',
          priority: 'critical' as const
        }
      ],
      isActive: true
    }
  ]
};

export const SEED_EVENT_TYPES: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'feeding',
    displayName: { en: 'Feeding', pl: 'Karmienie' },
    icon: 'restaurant',
    color: '#FF6B35',
    category: 'feeding',
    applicableToTypes: ['*'],
    specificFields: [],
    frequency: 'daily',
    isActive: true
  },
  {
    name: 'molt',
    displayName: { en: 'Molt/Shed', pl: 'Wylinka' },
    icon: 'autorenew',
    color: '#9C27B0',
    category: 'health',
    applicableToTypes: ['tarantula', 'snake', 'lizard'],
    specificFields: [],
    frequency: 'custom',
    isActive: true
  },
  {
    name: 'walk',
    displayName: { en: 'Walk', pl: 'Spacer' },
    icon: 'directions_walk',
    color: '#4CAF50',
    category: 'behavior',
    applicableToTypes: ['dog'],
    specificFields: [],
    frequency: 'daily',
    isActive: true
  }
];
