// src/screens/AddMoltingScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import {useTheme} from "../../context/ThemeContext";
import { useAnimalQuery } from "../../api/animals";
import { useAddMoltingMutation } from "../../api/events";
import {Theme} from "../../styles/theme";
import MoltingForm from "../../components/organisms/MoltingForm";
import { useTranslation } from 'react-i18next';

export default function AddMoltingScreen() {
    const { t } = useTranslation('animals');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { data: animalData, isLoading: animalLoading } = useAnimalQuery(animalId);
    const addMoltingMutation = useAddMoltingMutation();

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const animal = animalData ?? null;
    const loading = animalLoading;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.date) {
            newErrors.date = t('addMolting.validation.dateRequired');
        }

        if ((formData.newStage && formData.previousStage) && formData.newStage <= formData.previousStage) {
            newErrors.newStage = t('addMolting.validation.stageMustBeHigher');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert(t('addMolting.validation.title'), t('addMolting.validation.fillRequired'));
            return;
        }

        setSaving(true);
        try {
            await addMoltingMutation.mutateAsync({
                animalId,
                date: formData.date,
                eventData: {
                    previousStage: formData.previousStage,
                    newStage: formData.newStage,
                    previousBodyLength: formData.previousBodyLength,
                    newBodyLength: formData.newBodyLength,
                },
                description: formData.notes.trim(),
            });
            Alert.alert(
                t('common:success'),
                t('addMolting.successMessage', { stage: formData.newStage ? t('addMolting.stageUpdated', { stage: formData.newStage }) : '' }),
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert(t('common:error'), error.message || t('addMolting.errorAdd'));
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

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={handleCancel} />
                <Appbar.Content
                    title={t('addMolting.title')}
                    subtitle={animal.name || animal.species}
                />
            </Appbar.Header>

            <MoltingForm
                currentStage={animal.stage}
                currentBodyLength={animal.bodyLength}
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
                    {t('addMolting.saveMolting')}
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