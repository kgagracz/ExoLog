import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, RadioButton, HelperText, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from "../../context/ThemeContext";
import FormInput from "../atoms/FormInput";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

export type CocoonStatus = 'laid' | 'incubating' | 'hatched' | 'failed';

interface CocoonFormData {
    date: string;
    estimatedHatchDate: string;
    status: CocoonStatus;
    notes: string;
    setReminder: boolean;
}

interface CocoonFormProps {
    currentAnimal: Animal;
    onDataChange: (data: CocoonFormData) => void;
    errors: Record<string, string>;
}

// Funkcja do obliczania przewidywanej daty wylęgu (średnio 8-10 tygodni)
const calculateEstimatedHatchDate = (layDate: string, weeksToAdd: number = 9): string => {
    const date = new Date(layDate);
    date.setDate(date.getDate() + (weeksToAdd * 7));
    return date.toISOString().split('T')[0];
};

export default function CocoonForm({
                                       currentAnimal,
                                       onDataChange,
                                       errors,
                                   }: CocoonFormProps) {
    const { theme } = useTheme();
    const { t } = useTranslation('forms');
    const styles = makeStyles(theme);

    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<CocoonFormData>({
        date: today,
        estimatedHatchDate: calculateEstimatedHatchDate(today),
        status: 'laid',
        notes: '',
        setReminder: true,
    });

    useEffect(() => {
        onDataChange(formData);
    }, [formData]);

    const updateField = <K extends keyof CocoonFormData>(
        field: K,
        value: CocoonFormData[K]
    ) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Automatycznie przelicz datę wylęgu gdy zmienia się data złożenia
            if (field === 'date' && typeof value === 'string') {
                updated.estimatedHatchDate = calculateEstimatedHatchDate(value);
            }

            return updated;
        });
    };

    const statusOptions = [
        { label: t('cocoon.statusLaid'), value: 'laid' },
        { label: t('cocoon.statusIncubating'), value: 'incubating' },
        { label: t('cocoon.statusHatched'), value: 'hatched' },
        { label: t('cocoon.statusFailed'), value: 'failed' },
    ];

    const getDaysUntilHatch = (): number | null => {
        if (!formData.estimatedHatchDate) return null;
        const today = new Date();
        const hatchDate = new Date(formData.estimatedHatchDate);
        const diffTime = hatchDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilHatch = getDaysUntilHatch();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Informacje o samicy */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        {t('cocoon.femaleSection')}
                    </Text>

                    <View style={styles.animalInfo}>
                        <Text variant="bodySmall" style={styles.label}>
                            {t('cocoon.femaleLabel')}
                        </Text>
                        <Text variant="bodyLarge" style={styles.animalName}>
                            {currentAnimal.name || currentAnimal.species}
                        </Text>
                        <Text variant="bodySmall" style={styles.speciesName}>
                            {currentAnimal.species}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Daty */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        {t('cocoon.datesSection')}
                    </Text>

                    <FormInput
                        label={t('cocoon.layDateLabel')}
                        value={formData.date}
                        onChangeText={(value) => updateField('date', value)}
                        error={errors.date}
                        placeholder="YYYY-MM-DD"
                        required
                    />

                    <FormInput
                        label={t('cocoon.estimatedHatchLabel')}
                        value={formData.estimatedHatchDate}
                        onChangeText={(value) => updateField('estimatedHatchDate', value)}
                        error={errors.estimatedHatchDate}
                        placeholder="YYYY-MM-DD"
                    />

                    {daysUntilHatch !== null && daysUntilHatch > 0 && (
                        <HelperText type="info" style={styles.hatchInfo}>
                            {t('cocoon.daysUntilHatch', { days: daysUntilHatch })}
                        </HelperText>
                    )}

                    {daysUntilHatch !== null && daysUntilHatch <= 0 && formData.status !== 'hatched' && (
                        <HelperText type="info" style={styles.hatchWarning}>
                            {t('cocoon.hatchDatePassed')}
                        </HelperText>
                    )}
                </Card.Content>
            </Card>

            {/* Status kokonu */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        {t('cocoon.statusSection')}
                    </Text>

                    <RadioButton.Group
                        onValueChange={(value) => updateField('status', value as CocoonStatus)}
                        value={formData.status}
                    >
                        {statusOptions.map((option) => (
                            <View key={option.value} style={styles.radioRow}>
                                <RadioButton.Android
                                    value={option.value}
                                    color={theme.colors.primary}
                                />
                                <Text
                                    variant="bodyMedium"
                                    style={styles.radioLabel}
                                    onPress={() => updateField('status', option.value as CocoonStatus)}
                                >
                                    {option.label}
                                </Text>
                            </View>
                        ))}
                    </RadioButton.Group>

                    {formData.status === 'laid' && (
                        <HelperText type="info" style={styles.statusHelper}>
                            {t('cocoon.statusLaidHelper')}
                        </HelperText>
                    )}

                    {formData.status === 'incubating' && (
                        <HelperText type="info" style={styles.statusHelper}>
                            {t('cocoon.statusIncubatingHelper')}
                        </HelperText>
                    )}

                    {formData.status === 'hatched' && (
                        <HelperText type="info" style={styles.successHelper}>
                            {t('cocoon.statusHatchedHelper')}
                        </HelperText>
                    )}

                    {formData.status === 'failed' && (
                        <HelperText type="info" style={styles.failureHelper}>
                            {t('cocoon.statusFailedHelper')}
                        </HelperText>
                    )}
                </Card.Content>
            </Card>

            {/* Przypomnienie */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        {t('cocoon.reminderSection')}
                    </Text>

                    <View style={styles.switchRow}>
                        <View style={styles.switchContent}>
                            <Text variant="bodyLarge" style={styles.switchLabel}>
                                {t('cocoon.setReminder')}
                            </Text>
                            <Text variant="bodySmall" style={styles.switchHelper}>
                                {t('cocoon.reminderHelper')}
                            </Text>
                        </View>
                        <Switch
                            value={formData.setReminder}
                            onValueChange={(value) => updateField('setReminder', value)}
                            color={theme.colors.primary}
                        />
                    </View>
                </Card.Content>
            </Card>

            {/* Notatki */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        {t('common:notesIcon')}
                    </Text>

                    <FormInput
                        label={t('cocoon.notesLabel')}
                        value={formData.notes}
                        onChangeText={(value) => updateField('notes', value)}
                        error={errors.notes}
                        placeholder={t('cocoon.notesPlaceholder')}
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
    animalInfo: {
        backgroundColor: theme.colors.surfaceLight,
        padding: 12,
        borderRadius: 8,
    },
    label: {
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    animalName: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    speciesName: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 2,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    radioLabel: {
        color: theme.colors.textPrimary,
    },
    hatchInfo: {
        backgroundColor: theme.colors.primaryContainer,
        marginTop: 8,
        borderRadius: 4,
    },
    hatchWarning: {
        backgroundColor: theme.colors.errorContainer,
        marginTop: 8,
        borderRadius: 4,
    },
    statusHelper: {
        backgroundColor: theme.colors.surfaceLight,
        marginTop: 8,
        borderRadius: 4,
    },
    successHelper: {
        backgroundColor: theme.colors.successContainer,
        marginTop: 8,
        borderRadius: 4,
    },
    failureHelper: {
        backgroundColor: theme.colors.errorContainer,
        marginTop: 8,
        borderRadius: 4,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    switchContent: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontWeight: '500',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    switchHelper: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 12,
    },
});