import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import {Text, TextInput, Button, Card, Checkbox} from 'react-native-paper';
import {useAuth} from "../../hooks";
import {Theme} from "../../styles/theme";
import {useTheme} from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';

interface LoginScreenProps {
    navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const {theme} = useTheme();
    const { t } = useTranslation('auth');
    const styles = createStyles(theme)

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('common:error'), t('common:fillAllFields'));
            return;
        }

        if (!email.includes('@')) {
            Alert.alert(t('common:error'), t('common:invalidEmail'));
            return;
        }

        setLoading(true);
        try {
            const result = await signIn(email, password, rememberMe);

            if (!result.success) {
                Alert.alert(t('login.errorTitle'), result.error || t('common:unknownError'));
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
                        {t('login.subtitle')}
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
                            label={t('login.passwordLabel')}
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
                            {loading ? t('login.loggingIn') : t('login.loginButton')}
                        </Button>

                        <View style={styles.rememberMeContainer}>
                            <Checkbox.Item
                                label={t('login.rememberMe')}
                                status={rememberMe ? 'checked' : 'unchecked'}
                                onPress={() => setRememberMe(!rememberMe)}
                                disabled={loading}
                                position="leading"
                                labelStyle={styles.checkboxLabel}
                                style={styles.checkbox}
                            />
                        </View>

                        <Button
                            mode="text"
                            onPress={handleForgotPassword}
                            disabled={loading}
                            style={styles.forgotButton}
                        >
                            {t('login.forgotPassword')}
                        </Button>
                    </Card.Content>
                </Card>

                <View style={styles.footer}>
                    <Text variant="bodyMedium" style={styles.footerText}>
                        {t('login.noAccount')}
                    </Text>
                    <Button
                        mode="text"
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {t('login.signUp')}
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
    rememberMeContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    checkbox: {
        paddingHorizontal: 0,
    },
    checkboxLabel: {
        color: theme.colors.textSecondary,
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