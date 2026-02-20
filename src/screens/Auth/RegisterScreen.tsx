import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Checkbox } from 'react-native-paper';
import {useAuth} from "../../hooks";
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";
import { useAppTranslation } from '../../hooks/useAppTranslation';

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
    const { t } = useAppTranslation('auth');
    const styles = createStyles(theme)

    const validateForm = () => {
        if (!email || !password || !confirmPassword || !displayName) {
            Alert.alert(t('common:error'), t('common:fillAllFields'));
            return false;
        }

        if (!email.includes('@')) {
            Alert.alert(t('common:error'), t('common:invalidEmail'));
            return false;
        }

        if (password.length < 6) {
            Alert.alert(t('common:error'), t('register.passwordTooShort'));
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert(t('common:error'), t('register.passwordsNotMatch'));
            return false;
        }

        if (!acceptTerms) {
            Alert.alert(t('common:error'), t('register.mustAcceptTerms'));
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
                    t('register.successTitle'),
                    t('register.successMessage'),
                    [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                Alert.alert(t('register.errorTitle'), result.error || t('common:unknownError'));
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
                        {t('register.title')}
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        {t('register.subtitle')}
                    </Text>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label={t('register.displayNameLabel')}
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
                            label={t('register.passwordLabel')}
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
                            label={t('register.confirmPasswordLabel')}
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
                                {t('register.acceptTerms')}
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            style={styles.registerButton}
                        >
                            {loading ? t('register.registering') : t('register.registerButton')}
                        </Button>
                    </Card.Content>
                </Card>

                <View style={styles.footer}>
                    <Text variant="bodyMedium" style={styles.footerText}>
                        {t('register.hasAccount')}
                    </Text>
                    <Button
                        mode="text"
                        onPress={handleBackToLogin}
                        disabled={loading}
                    >
                        {t('register.loginLink')}
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
