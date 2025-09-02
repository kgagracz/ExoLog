import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Checkbox } from 'react-native-paper';
import {useAuth} from "../../hooks";
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";

interface RegisterScreenProps {
    navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const {theme} = useTheme();
    const styles = createStyles(theme)

    const validateForm = () => {
        if (!email || !password || !confirmPassword || !displayName) {
            Alert.alert('Błąd', 'Wypełnij wszystkie pola');
            return false;
        }

        if (!email.includes('@')) {
            Alert.alert('Błąd', 'Podaj prawidłowy adres email');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Błąd', 'Hasła nie są identyczne');
            return false;
        }

        if (!acceptTerms) {
            Alert.alert('Błąd', 'Musisz zaakceptować regulamin');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await signUp(email, password, displayName);

            if (result.success) {
                Alert.alert(
                    'Sukces',
                    'Konto zostało utworzone! Możesz się teraz zalogować.',
                    [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                Alert.alert('Błąd rejestracji', result.error || 'Nieznany błąd');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text variant="displaySmall" style={styles.title}>
                        Rejestracja
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Stwórz swoje konto w ExoLog
                    </Text>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="Nazwa użytkownika"
                            value={displayName}
                            onChangeText={setDisplayName}
                            mode="outlined"
                            autoCapitalize="words"
                            style={styles.input}
                            disabled={loading}
                        />

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            style={styles.input}
                            disabled={loading}
                        />

                        <TextInput
                            label="Hasło"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            disabled={loading}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <TextInput
                            label="Powtórz hasło"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            disabled={loading}
                        />

                        <View style={styles.checkboxRow}>
                            <Checkbox
                                status={acceptTerms ? 'checked' : 'unchecked'}
                                onPress={() => setAcceptTerms(!acceptTerms)}
                                disabled={loading}
                            />
                            <Text variant="bodyMedium" style={styles.checkboxText}>
                                Akceptuję regulamin i politykę prywatności
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            style={styles.registerButton}
                        >
                            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                        </Button>
                    </Card.Content>
                </Card>

                <View style={styles.footer}>
                    <Text variant="bodyMedium" style={styles.footerText}>
                        Masz już konto?
                    </Text>
                    <Button
                        mode="text"
                        onPress={handleBackToLogin}
                        disabled={loading}
                    >
                        Zaloguj się
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: Theme) =>  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    card: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxText: {
        flex: 1,
        marginLeft: 8,
        color: theme.colors.textSecondary,
    },
    registerButton: {
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        color: theme.colors.textSecondary,
    },
});
