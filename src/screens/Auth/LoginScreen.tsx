import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import {Text, TextInput, Button, Card, IconButton} from 'react-native-paper';
import {useAuth} from "../../hooks";
import {Theme} from "../../styles/theme";
import {useTheme} from "../../context/ThemeContext";

interface LoginScreenProps {
    navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const {theme} = useTheme();
    const styles = createStyles(theme)

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Błąd', 'Wypełnij wszystkie pola');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Błąd', 'Podaj prawidłowy adres email');
            return;
        }

        setLoading(true);
        try {
            const result = await signIn(email, password);

            if (!result.success) {
                Alert.alert('Błąd logowania', result.error || 'Nieznany błąd');
            }
            // Jeśli success = true, AuthProvider automatycznie przekieruje
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    const handleSignUp = () => {
        navigation.navigate('Register');
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
                        ExoLog
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Zaloguj się do swojego konta
                    </Text>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
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
                            autoComplete="password"
                            style={styles.input}
                            disabled={loading}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            style={styles.loginButton}
                        >
                            {loading ? 'Logowanie...' : 'Zaloguj się'}
                        </Button>

                        <Button
                            mode="text"
                            onPress={handleForgotPassword}
                            disabled={loading}
                            style={styles.forgotButton}
                        >
                            Zapomniałeś hasła?
                        </Button>
                    </Card.Content>
                </Card>

                <View style={styles.footer}>
                    <Text variant="bodyMedium" style={styles.footerText}>
                        Nie masz konta?
                    </Text>
                    <Button
                        mode="text"
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        Zarejestruj się
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
    loginButton: {
        marginTop: 8,
        marginBottom: 8,
    },
    forgotButton: {
        alignSelf: 'center',
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
