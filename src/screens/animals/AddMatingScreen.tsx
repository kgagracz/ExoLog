import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import { useEvents } from "../../hooks/useEvents";
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import MatingForm, { MatingResult } from "../../components/organisms/MatingForm";
import { Animal } from "../../types";

export default function AddMatingScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { addMating, loading: eventLoading } = useEvents();
    const { getAnimal, animals } = useAnimals();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [availablePartners, setAvailablePartners] = useState<Animal[]>([]);
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadAnimalAndPartners();
    }, [animalId, animals]);

    const loadAnimalAndPartners = async () => {
        try {
            setLoading(true);
            const result = await getAnimal(animalId);

            if (!result.success || !result.data) {
                Alert.alert('Błąd', 'Nie znaleziono zwierzęcia');
                navigation.goBack();
                return;
            }

            const currentAnimal = result.data;
            setAnimal(currentAnimal);

            // Sprawdź czy zwierzę ma określoną płeć
            if (currentAnimal.sex === 'unknown') {
                Alert.alert(
                    'Nieznana płeć',
                    'Aby dodać kopulację, zwierzę musi mieć określoną płeć (samiec lub samica).',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                return;
            }

            // Znajdź partnerów przeciwnej płci tego samego gatunku
            const opposingSex = currentAnimal.sex === 'male' ? 'female' : 'male';
            const partners = animals.filter(a =>
                a.id !== animalId &&
                a.sex === opposingSex &&
                a.species === currentAnimal.species &&
                a.isActive
            );

            setAvailablePartners(partners);
        } catch (error) {
            console.error('Error loading animal:', error);
            Alert.alert('Błąd', 'Nie udało się załadować danych zwierzęcia');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData?.date) {
            newErrors.date = 'Data kopulacji jest wymagana';
        }

        if (!formData?.partnerId) {
            newErrors.partnerId = 'Wybierz partnera';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !animal) {
            Alert.alert('Błąd walidacji', 'Uzupełnij wszystkie wymagane pola');
            return;
        }

        try {
            setSaving(true);

            const isMale = animal.sex === 'male';
            const maleId = isMale ? animal.id : formData.partnerId;
            const femaleId = isMale ? formData.partnerId : animal.id;

            const result = await addMating({
                animalId,
                date: formData.date,
                eventData: {
                    maleId,
                    femaleId,
                    result: formData.result,
                },
                description: formData.notes?.trim(),
            });

            if (result.success) {
                const partner = availablePartners.find(p => p.id === formData.partnerId);
                const partnerName = partner?.name || partner?.species || 'partnerem';

                Alert.alert(
                    'Sukces',
                    `Kopulacja z ${partnerName} została zarejestrowana.`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Błąd', result.error || 'Nie udało się dodać kopulacji');
            }
        } catch (error: any) {
            console.error('Error saving mating:', error);
            Alert.alert('Błąd', 'Nie udało się zapisać kopulacji');
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
                    <Appbar.Content title="Dodaj kopulację" />
                </Appbar.Header>
                <View style={styles.errorContainer}>
                    <Text variant="bodyLarge" style={styles.errorText}>
                        ⚠️ Aby dodać kopulację, zwierzę musi mieć określoną płeć.
                    </Text>
                    <Button mode="contained" onPress={handleCancel} style={styles.backButton}>
                        Wróć
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
                    title="Dodaj kopulację"
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
                    Anuluj
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    loading={saving}
                    disabled={saving || availablePartners.length === 0}
                >
                    Zapisz kopulację
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