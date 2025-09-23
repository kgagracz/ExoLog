import {AnimalCategory, EventType} from "../types";

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
];
