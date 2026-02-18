import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import { useAnimalQuery, useAnimalsQuery } from "../../api/animals";
import { useAddMatingMutation } from "../../api/events";
import { Theme } from "../../styles/theme";
import MatingForm, { MatingResult } from "../../components/organisms/MatingForm";
import { Animal } from "../../types";
import { useTranslation } from 'react-i18next';

export default function AddMatingScreen() {
    const { t } = useTranslation('animals');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { data: animalData, isLoading: animalLoading } = useAnimalQuery(animalId);
    const { data: animals = [] } = useAnimalsQuery();
    const addMatingMutation = useAddMatingMutation();

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const animal = animalData ?? null;

    const availablePartners = useMemo(() => {
        if (!animal || animal.sex === 'unknown') return [];
        const opposingSex = animal.sex === 'male' ? 'female' : 'male';
        return animals.filter(a =>
            a.id !== animalId &&
            a.sex === opposingSex &&
            a.species === animal.species &&
            a.isActive
        );
    }, [animal, animals, animalId]);

    const loading = animalLoading;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData?.date) {
            newErrors.date = t('addMating.validation.dateRequired');
        }

        if (!formData?.partnerId) {
            newErrors.partnerId = t('addMating.validation.partnerRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !animal) {
            Alert.alert(t('addMating.validation.title'), t('addMating.validation.fillRequired'));
            return;
        }

        setSaving(true);
        try {
            const isMale = animal.sex === 'male';
            const maleId = isMale ? animal.id : formData.partnerId;
            const femaleId = isMale ? formData.partnerId : animal.id;

            await addMatingMutation.mutateAsync({
                animalId,
                date: formData.date,
                eventData: {
                    maleId,
                    femaleId,
                    result: formData.result,
                },
                description: formData.notes?.trim(),
            });

            const partner = availablePartners.find(p => p.id === formData.partnerId);
            const partnerName = partner?.name || partner?.species || t('addMating.partnerFallback');

            Alert.alert(
                t('common:success'),
                t('addMating.successMessage', { partner: partnerName }),
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert(t('common:error'), error.message || t('addMating.errorAdd'));
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

    // Sprawdź czy płeć jest określona
    if (animal.sex === 'unknown') {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleCancel} />
                    <Appbar.Content title={t('addMating.title')} />
                </Appbar.Header>
                <View style={styles.errorContainer}>
                    <Text variant="bodyLarge" style={styles.errorText}>
                        {t('addMating.unknownSexError')}
                    </Text>
                    <Button mode="contained" onPress={handleCancel} style={styles.backButton}>
                        {t('addMating.goBack')}
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
                    title={t('addMating.title')}
                    subtitle={animal.name || animal.species}
                />
            </Appbar.Header>

            <MatingForm
                currentAnimal={animal}
                availablePartners={availablePartners}
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
                    disabled={saving || availablePartners.length === 0}
                >
                    {t('addMating.saveMating')}
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