import { useTranslation } from 'react-i18next';

type TFunc = (key: string, options?: Record<string, unknown>) => string;

/**
 * Typed wrapper around useTranslation.
 * Fixes WebStorm false positives with i18next v25 complex generics.
 */
export function useAppTranslation(ns?: string) {
    const { t, i18n, ready } = useTranslation(ns);
    return { t: t as TFunc, i18n, ready };
}
