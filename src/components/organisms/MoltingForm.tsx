import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, Switch, HelperText} from 'react-native-paper';
import {useTheme} from "../../context/ThemeContext";
import FormInput from "../atoms/FormInput";
import FormNumberInput from "../atoms/FormNumberInput";
import {Theme} from "../../styles/theme";
import FormValueDisplay from "../molecules/FormValueDisplay";

interface MoltingFormData {
    date: string;
    previousStage?: number;
    newStage?: number;
    previousBodyLength: number | null;
    newBodyLength: number | null;
    notes: string;
}

interface MoltingFormProps {
    initialData?: Partial<MoltingFormData>;
    currentStage?: number;
    currentBodyLength?: number | null;
    onDataChange: (data: MoltingFormData) => void;
    errors: Record<string, string>;
}

export default function MoltingForm({
                                        initialData = {},
                                        currentStage,
                                        currentBodyLength,
                                        onDataChange,
                                        errors,
                                    }: MoltingFormProps) {
    const {theme} = useTheme();
    const styles = makeStyles(theme);

    const [formData, setFormData] = useState<MoltingFormData>({
        date: new Date().toISOString().split('T')[0],
        previousStage: currentStage,
        newStage: currentStage ? currentStage + 1 : undefined,
        previousBodyLength: currentBodyLength || null,
        newBodyLength: null,
        notes: '',
        ...initialData,
    });

    useEffect(() => {
        onDataChange(formData);
    }, [formData]);

    const updateField = <K extends keyof MoltingFormData>(
        field: K,
        value: MoltingFormData[K] | null
    ) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Podstawowe informacje */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        🦎 Informacje o wylince
                    </Text>

                    <FormInput
                        label="Data wylinki"
                        value={formData.date}
                        onChangeText={(value) => updateField('date', value)}
                        error={errors.date}
                        placeholder="YYYY-MM-DD"
                        required
                    />
                </Card.Content>
            </Card>

            {/* Stadium */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        📊 Stadium rozwoju
                    </Text>

                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <FormValueDisplay
                                label="Poprzednie stadium"
                                value={formData.previousStage ? `L${formData.previousStage}` : undefined}
                            />
                        </View>

                        <View style={styles.halfWidth}>
                            <FormNumberInput
                                label="Nowe stadium"
                                value={formData.newStage ?? null}
                                onValueChange={(value) => updateField('newStage', value)}
                                error={errors.newStage}
                                prefix="L"
                                min={formData.previousStage ? formData.previousStage + 1 : undefined}
                                max={16}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Pomiary */}
            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        📏 Długość ciała
                    </Text>

                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <FormValueDisplay
                                label="Poprzedni rozmiar"
                                value={formData.previousBodyLength}
                                unit="cm"
                            />
                        </View>

                        <View style={styles.halfWidth}>
                            <FormNumberInput
                                label="Nowy rozmiar"
                                value={formData.newBodyLength}
                                onValueChange={(value) => updateField('newBodyLength', value)}
                                error={errors.newBodyLength}
                                unit="cm"
                                min={0}
                                max={30}
                                decimal
                                placeholder="np. 6.2"
                            />
                        </View>
                    </View>

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
                        placeholder="Przebieg wylinki, problemy, obserwacje behawioralne..."
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        marginBottom: 8,
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
    successHelper: {
        backgroundColor: theme.colors.successContainer,
        padding: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    growthHelper: {
        backgroundColor: theme.colors.primaryContainer,
        padding: 8,
        borderRadius: 4,
        marginTop: 8,
        fontWeight: '500',
    },
});