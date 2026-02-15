export const queryKeys = {
    animals: {
        all: ['animals'] as const,
        lists: () => [...queryKeys.animals.all, 'list'] as const,
        list: (userId: string) => [...queryKeys.animals.lists(), userId] as const,
        details: () => [...queryKeys.animals.all, 'detail'] as const,
        detail: (animalId: string) => [...queryKeys.animals.details(), animalId] as const,
    },
    feeding: {
        all: ['feeding'] as const,
        histories: () => [...queryKeys.feeding.all, 'history'] as const,
        history: (animalId: string) => [...queryKeys.feeding.histories(), animalId] as const,
        user: (userId: string) => [...queryKeys.feeding.all, 'user', userId] as const,
    },
    events: {
        all: ['events'] as const,
        molting: {
            all: ['events', 'molting'] as const,
            histories: () => [...queryKeys.events.molting.all, 'history'] as const,
            history: (animalId: string) => [...queryKeys.events.molting.histories(), animalId] as const,
            user: (userId: string) => [...queryKeys.events.molting.all, 'user', userId] as const,
            lastDates: (animalIds: string[]) => [...queryKeys.events.molting.all, 'lastDates', ...animalIds.sort()] as const,
        },
        mating: {
            all: ['events', 'mating'] as const,
            histories: () => [...queryKeys.events.mating.all, 'history'] as const,
            history: (animalId: string) => [...queryKeys.events.mating.histories(), animalId] as const,
            statuses: (animalIds: string[]) => [...queryKeys.events.mating.all, 'statuses', ...animalIds.sort()] as const,
        },
        cocoon: {
            all: ['events', 'cocoon'] as const,
            histories: () => [...queryKeys.events.cocoon.all, 'history'] as const,
            history: (animalId: string) => [...queryKeys.events.cocoon.histories(), animalId] as const,
            upcoming: (userId: string) => [...queryKeys.events.cocoon.all, 'upcoming', userId] as const,
            statuses: (animalIds: string[]) => [...queryKeys.events.cocoon.all, 'statuses', ...animalIds.sort()] as const,
        },
        animal: (animalId: string) => [...queryKeys.events.all, 'animal', animalId] as const,
    },
    lookup: {
        all: ['lookup'] as const,
        categories: () => [...queryKeys.lookup.all, 'categories'] as const,
        animalTypes: {
            all: () => [...queryKeys.lookup.all, 'animalTypes'] as const,
            byCategory: (categoryId: string) => [...queryKeys.lookup.animalTypes.all(), categoryId] as const,
        },
        eventTypes: {
            all: () => [...queryKeys.lookup.all, 'eventTypes'] as const,
            byAnimalType: (animalTypeId: string) => [...queryKeys.lookup.eventTypes.all(), animalTypeId] as const,
        },
    },
    social: {
        all: ['social'] as const,
        profile: (userId: string) => [...queryKeys.social.all, 'profile', userId] as const,
        search: (term: string) => [...queryKeys.social.all, 'search', term] as const,
        requests: {
            all: ['social', 'requests'] as const,
            incoming: (userId: string) => [...queryKeys.social.requests.all, 'incoming', userId] as const,
            outgoing: (userId: string) => [...queryKeys.social.requests.all, 'outgoing', userId] as const,
        },
        friends: (userId: string) => [...queryKeys.social.all, 'friends', userId] as const,
        friendshipStatus: (userId: string, otherId: string) => [...queryKeys.social.all, 'status', userId, otherId] as const,
        publicAnimals: (userId: string) => [...queryKeys.social.all, 'publicAnimals', userId] as const,
    },
} as const;
