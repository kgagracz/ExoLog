export type UserTier = 'amateur' | 'professional';

export interface TierLimits {
    maxActiveAnimals: number | null; // null = no limit
}

export const TIER_CONFIG: Record<UserTier, TierLimits> = {
    amateur: { maxActiveAnimals: 10 },
    professional: { maxActiveAnimals: null },
};

export const DEFAULT_TIER: UserTier = 'amateur';
