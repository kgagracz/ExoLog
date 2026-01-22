import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import { useEvents } from "../../hooks/useEvents";
import { useAnimals } from "../../hooks";
import { Theme } from "../../styles/theme";
import CocoonForm from "../../components/organisms/CocoonForm";
import { Animal } from "../../types";

export default function AddCocoonScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { addCocoon, loading: eventLoading } = useEvents();
    const { getAnimal } = useAnimals();

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
            const result = await getAnimal(animalId);

            if (!result.success || !result.data) {
                Alert.alert('Błąd', 'Nie znaleziono zwierzęcia');
                navigation.goBack();
                return;
            }

            const currentAnimal = result.data;
            setAnimal(currentAnimal);

            // Sprawdź czy to samica
            if (currentAnimal.sex !== 'female') {
                Alert.alert(
                    'Nieprawidłowa płeć',
                    'Tylko samice mogą składać kokony.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                return;
            }
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
            newErrors.date = 'Data złożenia kokonu jest wymagana';
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

            const result = await addCocoon({
                animalId,
                date: formData.date,
                eventData: {
                    femaleId: animalId,
                    estimatedHatchDate: formData.estimatedHatchDate,
                    cocoonStatus: formData.status,
                },
                description: formData.notes?.trim(),
                setReminder: formData.setReminder,
            });

            if (result.success) {
                Alert.alert(
                    'Sukces',
                    `Kokon został zarejestrowany dla ${animal.name || animal.species}.`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Błąd', result.error || 'Nie udało się dodać kokonu');
            }
        } catch (error: any) {
            console.error('Error saving cocoon:', error);
            Alert.alert('Błąd', 'Nie udało się zapisać kokonu');
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
                    <Appbar.Content title="Dodaj kokon" />
                </Appbar.Header>
                <View style={styles.errorContainer}>
                    <Text variant="bodyLarge" style={styles.errorText}>
                        ⚠️ Tylko samice mogą składać kokony.
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
                    title="Dodaj kokon"
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
                    Anuluj
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    loading={saving}
                    disabled={saving}
                >
                    Zapisz kokon
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