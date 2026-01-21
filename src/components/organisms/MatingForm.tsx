import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, RadioButton, HelperText } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import FormInput from "../atoms/FormInput";
import FormSelect from "../atoms/FormSelect";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

export type MatingResult = 'success' | 'failure' | 'in_progress' | 'unknown';

interface MatingFormData {
    date: string;
    partnerId: string;
    result: MatingResult;
    notes: string;
}

interface MatingFormProps {
    currentAnimal: Animal;
    availablePartners: Animal[];
    onDataChange: (data: MatingFormData) => void;
    errors: Record<string, string>;
}

export default function MatingForm({
                                       currentAnimal,
                                       availablePartners,
                                       onDataChange,
                                       errors,
                                   }: MatingFormProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const isMale = currentAnimal.sex === 'male';
    const partnerLabel = isMale ? 'Wybierz samicę' : 'Wybierz samca';

    const [formData, setFormData] = useState<MatingFormData>({
        date: new Date().toISOString().split('T')[0],
        partnerId: '',
        result: 'in_progress',
        notes: '',
    });

    useEffect(() => {
        onDataChange(formData);
    }, [formData]);

    const updateField = <K extends keyof MatingFormData>(
        field: K,
        value: MatingFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const partnerOptions = availablePartners.map(animal => ({
        label: animal.name || animal.species || 'Bez nazwy',
        value: animal.id,
    }));

    const resultOptions = [
        { label: 'W trakcie', value: 'in_progress' },
        { label: 'Sukces', value: 'success' },
        { label: 'Porażka', value: 'failure' },
        { label: 'Nieznany', value: 'unknown' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Informacje o kopulacji */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        💕 Informacje o kopulacji
                    </Text>

                    <FormInput
                        label="Data kopulacji"
                        value={formData.date}
                        onChangeText={(value) => updateField('date', value)}
                        error={errors.date}
                        placeholder="YYYY-MM-DD"
                        required
                    />

                    <View style={styles.currentAnimalInfo}>
                        <Text variant="bodySmall" style={styles.label}>
                            {isMale ? 'Samiec' : 'Samica'} (aktualnie przeglądany)
                        </Text>
                        <Text variant="bodyLarge" style={styles.animalName}>
                            {currentAnimal.name || currentAnimal.species}
                        </Text>
                    </View>

                    {availablePartners.length > 0 ? (
                        <FormSelect
                            label={partnerLabel}
                            value={formData.partnerId}
                            onValueChange={(value) => updateField('partnerId', value)}
                            options={partnerOptions}
                            error={errors.partnerId}
                            required
                        />
                    ) : (
                        <View style={styles.noPartnersContainer}>
                            <Text variant="bodyMedium" style={styles.noPartnersText}>
                                ⚠️ Brak dostępnych {isMale ? 'samic' : 'samców'} w kolekcji
                            </Text>
                            <HelperText type="info">
                                Dodaj {isMale ? 'samicę' : 'samca'} tego samego gatunku, aby móc zarejestrować kopulację
                            </HelperText>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Wynik kopulacji */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        📊 Wynik
                    </Text>

                    <RadioButton.Group
                        onValueChange={(value) => updateField('result', value as MatingResult)}
                        value={formData.result}
                    >
                        {resultOptions.map((option) => (
                            <View key={option.value} style={styles.radioRow}>
                                <RadioButton.Android
                                    value={option.value}
                                    color={theme.colors.primary}
                                />
                                <Text
                                    variant="bodyMedium"
                                    style={styles.radioLabel}
                                    onPress={() => updateField('result', option.value as MatingResult)}
                                >
                                    {option.label}
                                </Text>
                            </View>
                        ))}
                    </RadioButton.Group>

                    {formData.result === 'success' && (
                        <HelperText type="info" style={styles.successHelper}>
                            ✅ Obserwuj samicę pod kątem złożenia kokonu w ciągu najbliższych tygodni
                        </HelperText>
                    )}

                    {formData.result === 'failure' && (
                        <HelperText type="info" style={styles.failureHelper}>
                            💡 Możesz spróbować ponownie po kilku dniach odpoczynku
                        </HelperText>
                    )}
                </Card.Content>
            </Card>

            {/* Notatki */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        📝 Notatki
                    </Text>

                    <FormInput
                        label="Obserwacje"
                        value={formData.notes}
                        onChangeText={(value) => updateField('notes', value)}
                        error={errors.notes}
                        placeholder="Zachowanie podczas kopulacji, czas trwania, agresja..."
                        multiline
                        numberOfLines={4}
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
        marginBottom: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    currentAnimalInfo: {
        backgroundColor: theme.colors.surfaceLight,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    label: {
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    animalName: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    noPartnersContainer: {
        backgroundColor: theme.colors.errorContainer,
        padding: 12,
        borderRadius: 8,
    },
    noPartnersText: {
        color: theme.colors.error,
        marginBottom: 4,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    radioLabel: {
        color: theme.colors.textPrimary,
    },
    successHelper: {
        backgroundColor: theme.colors.successContainer,
        marginTop: 8,
        borderRadius: 4,
    },
    failureHelper: {
        backgroundColor: theme.colors.primaryContainer,
        marginTop: 8,
        borderRadius: 4,
    },
});