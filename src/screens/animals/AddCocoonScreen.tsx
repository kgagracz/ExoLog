import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from "../../context/ThemeContext";
import { useAnimalQuery } from "../../api/animals";
import { useAddCocoonMutation } from "../../api/events";
import { Theme } from "../../styles/theme";
import CocoonForm from "../../components/organisms/CocoonForm";
import { Animal } from "../../types";

export default function AddCocoonScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation('animals');
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { data: animalData, isLoading: animalLoading } = useAnimalQuery(animalId);
    const addCocoonMutation = useAddCocoonMutation();

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const animal = animalData ?? null;
    const loading = animalLoading;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData?.date) {
            newErrors.date = t('addCocoon.validation.dateRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !animal) {
            Alert.alert(t('common:validationError'), t('common:fillRequiredFields'));
            return;
        }

        setSaving(true);
        try {
            await addCocoonMutation.mutateAsync({
                animalId,
                date: formData.date,
                eventData: {
                    femaleId: animalId,
                    estimatedHatchDate: formData.estimatedHatchDate,
                    cocoonStatus: formData.status,
                },
                description: formData.notes?.trim(),
                setReminder: formData.setReminder,
                animalName: animal.name || animal.species,
            });
            Alert.alert(
                t('common:success'),
                t('addCocoon.successMessage', { name: animal.name || animal.species }),
                [{ text: t('common:ok'), onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert(t('common:error'), error.message || t('addCocoon.errorMessage'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!animal) {
        return null;
    }

    // Sprawdź czy to samica
    if (animal.sex !== 'female') {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleCancel} />
                    <Appbar.Content title={t('addCocoon.title')} />
                </Appbar.Header>
                <View style={styles.errorContainer}>
                    <Text variant="bodyLarge" style={styles.errorText}>
                        {t('addCocoon.onlyFemalesWarning')}
                    </Text>
                    <Button mode="contained" onPress={handleCancel} style={styles.backButton}>
                        {t('common:back')}
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={handleCancel} />
                <Appbar.Content
                    title={t('addCocoon.title')}
                    subtitle={animal.name || animal.species}
                />
            </Appbar.Header>

            <CocoonForm
                currentAnimal={animal}
                onDataChange={setFormData}
                errors={errors}
            />

            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={styles.cancelButton}
                    disabled={saving}
                >
                    {t('common:cancel')}
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    loading={saving}
                    disabled={saving}
                >
                    {t('addCocoon.saveCocoon')}
                </Button>
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginTop: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});