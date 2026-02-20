import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, socialService } from "../services/firebase";
import { queryClient } from "../api/queryClient";
import { unregisterPushToken } from "../services/pushTokenService";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const STORAGE_KEYS = {
    IS_LOGGED_IN: 'isLoggedIn',
    USER_ID: 'userId',
    REMEMBER_ME: 'rememberMe',
    LAST_ACTIVITY: 'lastActivity',
};

// Czas sesji: 30 dni dla "Zapamiętaj mnie", 7 dni standardowo
const SESSION_DURATION = {
    REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30 dni
    STANDARD: 7 * 24 * 60 * 60 * 1000, // 7 dni
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    // Sprawdź czy sesja jest aktualna
    const isSessionValid = async (): Promise<boolean> => {
        try {
            const lastActivity = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
            const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

            if (!lastActivity) {
                console.log('⏰ Brak zapisanej aktywności');
                return true; // Pozwól Firebase Auth zdecydować
            }

            const lastActivityTime = parseInt(lastActivity, 10);
            const now = Date.now();
            const maxAge = rememberMe === 'true'
                ? SESSION_DURATION.REMEMBER_ME
                : SESSION_DURATION.STANDARD;

            const isValid = (now - lastActivityTime) < maxAge;
            console.log('⏰ Sesja ważna:', isValid, '| Ostatnia aktywność:', new Date(lastActivityTime).toLocaleString());

            return isValid;
        } catch (error) {
            console.error('❌ Błąd sprawdzania sesji:', error);
            return true; // W razie błędu pozwól Firebase Auth zdecydować
        }
    };

    // Aktualizuj czas ostatniej aktywności
    const updateActivity = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
            console.log('✅ Zaktualizowano aktywność');
        } catch (error) {
            console.error('❌ Błąd aktualizacji aktywności:', error);
        }
    };

    // Inicjalizacja i sprawdzenie sesji przy starcie
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('🔐 Inicjalizacja autoryzacji...');

                // Sprawdź czy sesja jest aktualna
                const sessionValid = await isSessionValid();

                if (!sessionValid) {
                    console.log('⚠️ Sesja wygasła - wylogowanie');
                    // Jeśli sesja wygasła, wyczyść dane
                    await AsyncStorage.multiRemove([
                        STORAGE_KEYS.IS_LOGGED_IN,
                        STORAGE_KEYS.USER_ID,
                        STORAGE_KEYS.REMEMBER_ME,
                        STORAGE_KEYS.LAST_ACTIVITY
                    ]);
                    await signOut(auth);
                } else {
                    console.log('✅ Sesja aktualna');
                }

                setInitializing(false);
            } catch (error) {
                console.error('❌ Błąd inicjalizacji auth:', error);
                setInitializing(false);
            }
        };

        initializeAuth();
    }, []);

    useEffect(() => {
        console.log('👂 Nasłuchiwanie zmian autoryzacji...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('🔄 Zmiana stanu auth:', firebaseUser ? `✅ Zalogowany: ${firebaseUser.email}` : '❌ Wylogowany');

            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Zapisz stan logowania
                await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
                await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, firebaseUser.uid);
                await updateActivity();
                console.log('💾 Zapisano stan logowania');
            } else {
                // Wyczyść dane przy wylogowaniu
                await AsyncStorage.multiRemove([
                    STORAGE_KEYS.IS_LOGGED_IN,
                    STORAGE_KEYS.USER_ID,
                    STORAGE_KEYS.REMEMBER_ME,
                    STORAGE_KEYS.LAST_ACTIVITY
                ]);
                console.log('🗑️ Wyczyszczono dane sesji');
            }
        });

        return unsubscribe;
    }, []);

    // Aktualizuj aktywność przy każdej interakcji użytkownika
    useEffect(() => {
        if (user) {
            const activityInterval = setInterval(() => {
                updateActivity();
            }, 60000); // Co minutę

            return () => clearInterval(activityInterval);
        }
    }, [user]);

    const signIn = async (
        email: string,
        password: string,
        rememberMe: boolean = true
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('🔐 Próba logowania...', email);

            const result = await signInWithEmailAndPassword(auth, email, password);

            // Zapisz preferencję "Zapamiętaj mnie"
            await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
            await updateActivity();

            console.log('✅ Zalogowano:', result.user.email);
            console.log('🔒 Zapamiętaj mnie:', rememberMe);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Błąd logowania:', error.code);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        }
    };

    const signUp = async (
        email: string,
        password: string,
        displayName?: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('📝 Tworzenie konta...', email);

            const result = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName && result.user) {
                await updateProfile(result.user, { displayName });
            }

            // Create social profile
            await socialService.createOrUpdateProfile({
                uid: result.user.uid,
                displayName: displayName || email.split('@')[0],
                email,
                isPublic: true,
            });

            // Domyślnie włącz "Zapamiętaj mnie" dla nowych użytkowników
            await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
            await updateActivity();

            console.log('✅ Utworzono konto:', result.user.email);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Błąd tworzenia konta:', error.code);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        }
    };

    const logout = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('👋 Wylogowywanie...');

            if (user) {
                unregisterPushToken(user.uid).catch(() => {});
            }

            await signOut(auth);

            // Wyczyść cache React Query
            queryClient.clear();

            // Wyczyść wszystkie dane sesji
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.IS_LOGGED_IN,
                STORAGE_KEYS.USER_ID,
                STORAGE_KEYS.REMEMBER_ME,
                STORAGE_KEYS.LAST_ACTIVITY
            ]);

            console.log('✅ Wylogowano');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Błąd wylogowania:', error);
            return {
                success: false,
                error: 'Błąd podczas wylogowania'
            };
        }
    };

    const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('✅ Wysłano email resetujący hasło');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Błąd resetowania hasła:', error.code);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        }
    };

    const value = {
        user,
        loading: loading || initializing,
        signIn,
        signUp,
        logout,
        resetPassword,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Funkcja do tłumaczenia błędów Firebase
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'Nie znaleziono użytkownika o podanym adresie email';
        case 'auth/wrong-password':
            return 'Nieprawidłowe hasło';
        case 'auth/email-already-in-use':
            return 'Ten adres email jest już używany';
        case 'auth/weak-password':
            return 'Hasło jest za słabe (minimum 6 znaków)';
        case 'auth/invalid-email':
            return 'Nieprawidłowy format adresu email';
        case 'auth/user-disabled':
            return 'To konto zostało zablokowane';
        case 'auth/too-many-requests':
            return 'Zbyt wiele prób logowania. Spróbuj ponownie później';
        case 'auth/network-request-failed':
            return 'Błąd połączenia sieciowego';
        case 'auth/requires-recent-login':
            return 'Ta operacja wymaga ponownego zalogowania';
        case 'auth/invalid-credential':
            return 'Nieprawidłowe dane logowania';
        default:
            return 'Wystąpił nieoczekiwany błąd';
    }
};