import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {Animal} from "../../types";
import {useTheme} from "../../context/ThemeContext";
import {useAnimals} from "../../hooks";
import SpiderForm from "../../components/molecules/SpiderForm";
import {Theme} from "../../styles/theme";
import { AnimalStackParamList } from "../../types/navigation";

type EditAnimalScreenRouteProp = RouteProp<AnimalStackParamList, 'EditAnimal'>;
type EditAnimalScreenNavigationProp = NativeStackNavigationProp<
    AnimalStackParamList,
    'EditAnimal'
>;


export default function EditAnimalScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<EditAnimalScreenNavigationProp>();
    const route = useRoute<EditAnimalScreenRouteProp>();
    const { animalId } = route.params;
    const {getAnimal, updateAnimal} = useAnimals()

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadAnimal();
    }, [animalId]);

    const loadAnimal = async () => {
        try {
            setLoading(true);
            const {data: animalData} = await getAnimal(animalId);

            if (!animalData) {
                Alert.alert('Błąd', 'Nie znaleziono ptasznika');
                navigation.goBack();
                return;
            }

            setAnimal(animalData);

            // Konwertuj dane zwierzęcia na format formularza
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
            });
        } catch (error) {
            console.error('Error loading animal:', error);
            Alert.alert('Błąd', 'Nie udało się załadować danych ptasznika');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.species.trim()) {
            newErrors.species = 'Nazwa gatunkowa jest wymagana';
        }

        if (!formData.sex) {
            newErrors.sex = 'Płeć jest wymagana';
        }

        if (!formData.dateAcquired) {
            newErrors.dateAcquired = 'Data nabycia jest wymagana';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Błąd walidacji', 'Uzupełnij wszystkie wymagane pola');
            return;
        }

        try {
            setSaving(true);

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
                updatedAt: new Date().toISOString(),
            };

            await updateAnimal(animalId, updatedAnimal);

            Alert.alert(
                'Sukces',
                'Dane ptasznika zostały zaktualizowane',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error updating animal:', error);
            Alert.alert('Błąd', 'Nie udało się zaktualizować danych ptasznika');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Anulować edycję?',
            'Niezapisane zmiany zostaną utracone',
            [
                {
                    text: 'Kontynuuj edycję',
                    style: 'cancel',
                },
                {
                    text: 'Anuluj',
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    if (loading) {
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
                <Appbar.Content title="Edytuj ptasznika" />
            </Appbar.Header>

            <SpiderForm
                initialData={formData}
                onDataChange={setFormData}
                errors={errors}
                editMode
            />

            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={styles.cancelButton}
                    disabled={saving}
                >
                    Anuluj
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    loading={saving}
                    disabled={saving}
                >
                    Zapisz zmiany
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