import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useUserProfileQuery } from '../api/social/useUserProfileQuery';
import { TIER_CONFIG, DEFAULT_TIER, type UserTier, type TierLimits } from '../config/tierConfig';

export function useUserTier() {
    const { user } = useAuth();
    const { data: profile } = useUserProfileQuery(user?.uid);

    return useMemo(() => {
        const tier: UserTier = profile?.tier ?? DEFAULT_TIER;
        const limits: TierLimits = TIER_CONFIG[tier];
        const totalAnimals: number = profile?.stats?.totalAnimals ?? 0;

        const remainingSlots: number | null =
            limits.maxActiveAnimals !== null
                ? Math.max(0, limits.maxActiveAnimals - totalAnimals)
                : null;

        const canAddAnimal: boolean =
            limits.maxActiveAnimals === null || totalAnimals < limits.maxActiveAnimals;

        const canAddAnimals = (count: number): boolean =>
            limits.maxActiveAnimals === null || totalAnimals + count <= limits.maxActiveAnimals;

        const isProfessional: boolean = tier === 'professional';

        return {
            tier,
            limits,
            totalAnimals,
            canAddAnimal,
            canAddAnimals,
            remainingSlots,
            isProfessional,
        };
    }, [profile]);
}
