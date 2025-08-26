// ================================
// src/services/firebase/config.ts
// ================================

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import {
    EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_DEBUG_MODE
} from '@env';

// Validate environment variables
const requiredEnvVars = {
    EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID,
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
    apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: EXPO_PUBLIC_FIREBASE_APP_ID,
    ...(EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID && {
        measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
    }),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Development mode configuration
const isDev = EXPO_PUBLIC_APP_ENV === 'development';
const isDebug = EXPO_PUBLIC_DEBUG_MODE === 'true';

if (isDev && isDebug) {
    console.log('🔥 Firebase initialized in development mode');
    console.log('📱 Project ID:', EXPO_PUBLIC_FIREBASE_PROJECT_ID);

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
            projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
            authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            isDevelopment: isDev,
            hasAnalytics: !!EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
        };
    }
    return { message: 'Config hidden in production' };
};

// ================================
// Types for environment variables
// ================================

declare module '@env' {
    export const EXPO_PUBLIC_FIREBASE_API_KEY: string;
    export const EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    export const EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
    export const EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    export const EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    export const EXPO_PUBLIC_FIREBASE_APP_ID: string;
    export const EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: string;
    export const EXPO_PUBLIC_APP_ENV: string;
    export const EXPO_PUBLIC_DEBUG_MODE: string;
}

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
    environment: EXPO_PUBLIC_APP_ENV || 'unknown',
    debug: isDebug,
    projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'not-set',
    timestamp: new Date().toISOString(),
});