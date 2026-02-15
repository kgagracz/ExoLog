import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import {useAuth} from "../../hooks";
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";
import { useTranslation } from 'react-i18next';

interface ForgotPasswordScreenProps {
    navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const {theme} = useTheme();
    const { t } = useTranslation('auth');
    const styles = createStyles(theme)

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert(t('common:error'), t('forgotPassword.enterEmail'));
            return;
        }

        if (!email.includes('@')) {
            Alert.alert(t('common:error'), t('common:invalidEmail'));
            return;
        }

        setLoading(true);
        try {
            const result = await resetPassword(email);

            if (result.success) {
                Alert.alert(
                    t('forgotPassword.successTitle'),
                    t('forgotPassword.successMessage'),
                    [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                Alert.alert(t('common:error'), result.error || t('common:unknownError'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineLarge" style={styles.title}>
                        {t('forgotPassword.title')}
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        {t('forgotPassword.subtitle')}
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

                        <Button
                            mode="contained"
                            onPress={handleResetPassword}
                            loading={loading}
                            disabled={loading}
                            style={styles.resetButton}
                        >
                            {loading ? t('forgotPassword.sending') : t('forgotPassword.sendButton')}
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                            disabled={loading}
                            style={styles.backButton}
                        >
                            {t('forgotPassword.backToLogin')}
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
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
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    card: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 20,
    },
    resetButton: {
        marginBottom: 12,
    },
    backButton: {
        alignSelf: 'center',
    },
});
