// src/screens/AddMoltingScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {RootStackParamList} from "../../types/navigation";
import {useTheme} from "../../context/ThemeContext";
import {useEvents} from "../../hooks/useEvents";
import {useAnimals} from "../../hooks";
import {Theme} from "../../styles/theme";
import MoltingForm from "../../components/organisms/MoltingForm";

type AddMoltingScreenRouteProp = RouteProp<RootStackParamList, 'AddMolting'>;
type AddMoltingScreenNavigationProp = NativeStackNavigationProp<
RootStackParamList,
'AddMolting'
>;

export default function AddMoltingScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<AddMoltingScreenNavigationProp>();
    const route = useRoute<AddMoltingScreenRouteProp>();
    const { animalId } = route.params;

    const { addMolting, loading: eventLoading } = useEvents();
    const { getAnimal, refetch } = useAnimals();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [animal, setAnimal] = useState<any>(null);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadAnimal();
    }, [animalId]);

    const loadAnimal = async () => {
        try {
            setLoading(true);
            const result = await getAnimal(animalId);

            if (!result.success || !result.data) {
                Alert.alert('Błąd', 'Nie znaleziono ptasznika');
                navigation.goBack();
                return;
            }

            setAnimal(result.data);
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

        if (!formData.date) {
            newErrors.date = 'Data wylinki jest wymagana';
        }

        if (!formData.previousStage || formData.previousStage < 1) {
            newErrors.previousStage = 'Poprzednie stadium jest wymagane';
        }

        if (!formData.newStage || formData.newStage <= formData.previousStage) {
            newErrors.newStage = 'Nowe stadium musi być większe od poprzedniego';
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

            const result = await addMolting({
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

            if (result.success) {
                // Odśwież listę zwierząt, aby pobrać zaktualizowane stadium
                await refetch();

                Alert.alert(
                    'Sukces',
                    `Wylinka została dodana. Stadium ptasznika zaktualizowane do L${formData.newStage}.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                Alert.alert('Błąd', result.error || 'Nie udało się dodać wylinki');
            }
        } catch (error: any) {
            console.error('Error saving molting:', error);
            Alert.alert('Błąd', 'Nie udało się zapisać wylinki');
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
                    title="Dodaj wylinkę"
                    subtitle={animal.name || animal.species}
                />
            </Appbar.Header>

            <MoltingForm
                currentStage={animal.stage || 1}
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
                    Anuluj
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    loading={saving}
                    disabled={saving}
                >
                    Zapisz wylinkę
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
        borderTopColor: theme.colors.outline,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});