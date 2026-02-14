// ================================
// src/services/firebase/config.ts
// ================================

import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import {getReactNativePersistence, initializeAuth, Auth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Validate environment variables
const requiredEnvVars = {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required variables are present
const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    throw new Error(
        `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and make sure all Firebase configuration variables are set.'
    );
}

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    ...(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID && {
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
    }),
};

// Inicjalizacja Firebase - zapobiega duplikacji
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Inicjalizacja Auth z persistencją AsyncStorage
let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (error: any) {
    // Jeśli auth już istnieje (hot reload), użyj istniejącego
    if (error.code === 'auth/already-initialized') {
        const { getAuth } = require('firebase/auth');
        auth = getAuth(app);
    } else {
        throw error;
    }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Development mode configuration
const isDev = process.env.EXPO_PUBLIC_APP_ENV === 'development';
const isDebug = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';

if (isDev && isDebug) {
    console.log('🔥 Firebase initialized in development mode');
    console.log('📱 Project ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);

    // Uncomment these if you want to use Firebase Emulator Suite in development
    // Make sure you have the emulators running: firebase emulators:start

    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
}

// Export the app instance
export default app;

// Export configuration for debugging
export const getFirebaseConfig = () => {
    if (isDebug) {
        return {
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
            authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            isDevelopment: isDev,
            hasAnalytics: !!process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
        };
    }
    return { message: 'Config hidden in production' };
};

// ================================
// Connection test utility
// ================================

export const testFirebaseConnection = async (): Promise<boolean> => {
    try {
        // Test Firestore connection
        const { enableNetwork, disableNetwork } = await import('firebase/firestore');
        await disableNetwork(db);
        await enableNetwork(db);

        if (isDebug) {
            console.log('✅ Firebase connection test successful');
        }

        return true;
    } catch (error) {
        console.error('❌ Firebase connection test failed:', error);
        return false;
    }
};

// ================================
// Error handling utility
// ================================

export const getFirebaseErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';

    switch (errorCode) {
        case 'auth/user-not-found':
            return 'Użytkownik nie został znaleziony';
        case 'auth/wrong-password':
            return 'Nieprawidłowe hasło';
        case 'auth/email-already-in-use':
            return 'Ten adres email jest już używany';
        case 'auth/weak-password':
            return 'Hasło jest za słabe';
        case 'auth/invalid-email':
            return 'Nieprawidłowy adres email';
        case 'auth/network-request-failed':
            return 'Błąd połączenia sieciowego';
        case 'permission-denied':
            return 'Brak uprawnień do wykonania tej operacji';
        case 'unavailable':
            return 'Usługa Firebase jest obecnie niedostępna';
        default:
            return error?.message || 'Wystąpił nieznany błąd';
    }
};

// ================================
// Environment info utility
// ================================

export const getEnvironmentInfo = () => ({
    environment: process.env.EXPO_PUBLIC_APP_ENV || 'unknown',
    debug: isDebug,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'not-set',
    timestamp: new Date().toISOString(),
});