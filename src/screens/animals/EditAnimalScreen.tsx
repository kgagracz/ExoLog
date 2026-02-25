import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {Animal} from "../../types";
import {useTheme} from "../../context/ThemeContext";
import { useAnimalQuery, useUpdateAnimalMutation, useUploadCitesMutation } from "../../api/animals";
import {useAuth} from "../../hooks/useAuth";
import SpiderForm from "../../components/molecules/SpiderForm";
import {Theme} from "../../styles/theme";
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function EditAnimalScreen() {
    const { t } = useAppTranslation('animals');
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;
    const updateAnimalMutation = useUpdateAnimalMutation();
    const uploadCitesMutation = useUploadCitesMutation();
    const { user } = useAuth();

    const { data: animalData, isLoading: animalLoading } = useAnimalQuery(animalId);
    const saving = uploadCitesMutation.isPending || updateAnimalMutation.isPending;
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (animalData) {
            setAnimal(animalData);
            setFormData({
                name: animalData.name || '',
                species: animalData.species || '',
                sex: animalData.sex || 'unknown',
                stage: animalData.stage || null,
                dateAcquired: animalData.dateAcquired || new Date().toISOString().split('T')[0],
                dateOfBirth: animalData.dateOfBirth || '',
                bodyLength: animalData.measurements.length || null,
                feedingSchedule: animalData.feeding.schedule || 'weekly',
                notes: animalData.notes || '',
                quantity: 1,
                hasCites: animalData.specificData?.hasCites || false,
                citesDocumentUri: '',
                citesDocumentName: animalData.specificData?.citesDocumentUrl ? 'CITES.pdf' : '',
            });
        }
    }, [animalData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.species.trim()) {
            newErrors.species = t('edit.validation.speciesRequired');
        }

        if (!formData.sex) {
            newErrors.sex = t('edit.validation.sexRequired');
        }

        if (!formData.dateAcquired) {
            newErrors.dateAcquired = t('edit.validation.dateRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert(t('edit.validation.title'), t('edit.validation.fillRequired'));
            return;
        }

        try {
            // Upload CITES document if new file selected
            let citesDocumentUrl = animal?.specificData?.citesDocumentUrl;
            let citesDocumentPath = animal?.specificData?.citesDocumentPath;

            if (formData.hasCites && formData.citesDocumentUri && user) {
                const uploadResult = await uploadCitesMutation.mutateAsync({
                    userId: user.uid, animalId, fileUri: formData.citesDocumentUri,
                });
                citesDocumentUrl = uploadResult.url;
                citesDocumentPath = uploadResult.path;
            }

            const updatedAnimal: Partial<Animal> = {
                name: formData.name.trim() || null,
                species: formData.species.trim(),
                sex: formData.sex,
                stage: formData.stage,
                dateAcquired: formData.dateAcquired,
                dateOfBirth: formData.dateOfBirth || null,
                measurements: {length: formData.bodyLength},
                feeding: {schedule: formData.feedingSchedule},
                notes: formData.notes.trim() || null,
                specificData: {
                    ...animal?.specificData,
                    hasCites: formData.hasCites,
                    citesDocumentUrl: formData.hasCites ? citesDocumentUrl : null,
                    citesDocumentPath: formData.hasCites ? citesDocumentPath : null,
                },
                updatedAt: new Date().toISOString(),
            };

            await updateAnimalMutation.mutateAsync({ animalId, updates: updatedAnimal });

            Alert.alert(
                t('common:success'),
                t('edit.successMessage'),
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error updating animal:', error);
            Alert.alert(t('common:error'), t('edit.errorUpdate'));
        }
    };

    const handleCancel = () => {
        Alert.alert(
            t('edit.cancelTitle'),
            t('edit.cancelMessage'),
            [
                {
                    text: t('edit.continueEditing'),
                    style: 'cancel',
                },
                {
                    text: t('common:cancel'),
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    if (animalLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!formData) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={handleCancel} />
                <Appbar.Content title={t('edit.title')} />
            </Appbar.Header>

            <SpiderForm
                initialData={formData}
                onDataChange={setFormData}
                errors={errors}
                editMode
            />

            <View style={[styles.buttonContainer, { paddingBottom: 16 + insets.bottom }]}>
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
                    {t('edit.saveChanges')}
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
        borderTopColor: theme.colors.border,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});