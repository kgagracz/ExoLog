import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import common from './locales/pl/common.json';
import auth from './locales/pl/auth.json';
import animals from './locales/pl/animals.json';
import cocoons from './locales/pl/cocoons.json';
import social from './locales/pl/social.json';
import profile from './locales/pl/profile.json';
import scanner from './locales/pl/scanner.json';
import forms from './locales/pl/forms.json';
import filters from './locales/pl/filters.json';
import navigation from './locales/pl/navigation.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'pl';

i18n
    .use(initReactI18next)
    .init({
        lng: deviceLanguage,
        fallbackLng: 'pl',
        defaultNS: 'common',
        resources: {
            pl: {
                common,
                auth,
                animals,
                cocoons,
                social,
                profile,
                scanner,
                forms,
                filters,
                navigation,
            },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
