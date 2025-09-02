import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth} from "../services/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);

            // Zapisz stan logowania w AsyncStorage
            if (user) {
                await AsyncStorage.setItem('isLoggedIn', 'true');
                await AsyncStorage.setItem('userId', user.uid);
            } else {
                await AsyncStorage.removeItem('isLoggedIn');
                await AsyncStorage.removeItem('userId');
            }
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ User signed in:', result.user.email);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Sign in error:', error.code);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        }
    };

    const signUp = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Ustaw display name jeśli podane
            if (displayName && result.user) {
                await updateProfile(result.user, { displayName });
            }

            console.log('✅ User created:', result.user.email);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Sign up error:', error.code);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        }
    };

    const logout = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            await signOut(auth);
            console.log('✅ User signed out');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Sign out error:', error);
            return {
                success: false,
                error: 'Błąd podczas wylogowania'
            };
        }
    };

    const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('✅ Password reset email sent');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Password reset error:', error.code);
            return {
                success: false,
                error: getAuthErrorMessage(error.code)
            };
        }
    };

    const value = {
        user,
        loading,
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
        default:
            return 'Wystąpił nieoczekiwany błąd';
    }
};