import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import FormInput from '@components/atoms/FormInput';
import FormSelect from '@components/atoms/FormSelect';
import FormNumberInput from '@components/atoms/FormNumberInput';
import { Animal } from '@types/index';
import { theme } from '@styles/theme';
import {Theme} from "../../styles/theme";
import {useTheme} from "../../context/ThemeContext";

interface SpiderFormData {
  name: string;
  species: string;
  sex: 'male' | 'female' | 'unknown';
  stage: number | null; // Zmienione na numeryczne
  dateAcquired: string;
  dateOfBirth: string;
  bodyLength: number | null;
  terrariumLength: number | null;
  terrariumWidth: number | null;
  terrariumHeight: number | null;
  feedingSchedule: string;
  notes: string;
}

interface SpiderFormProps {
  initialData?: Partial<SpiderFormData>;
  onDataChange: (data: SpiderFormData) => void;
  errors: Record<string, string>;
}

const sexOptions = [
  { label: 'Samiec', value: 'male' },
  { label: 'Samica', value: 'female' },
  { label: 'Nieznana', value: 'unknown' },
];

// Usunięte stageOptions - zastąpione polem numerycznym

const webTypeOptions = [
  { label: 'Brak sieci', value: 'none' },
  { label: 'Sieć lejkowata', value: 'funnel' },
  { label: 'Sieć płaska', value: 'sheet' },
  { label: 'Sieć kołowa', value: 'orb' },
  { label: 'Minimalna', value: 'minimal' },
];

const temperamentOptions = [
  { label: 'Spokojny', value: 'docile' },
  { label: 'Defensywny', value: 'defensive' },
  { label: 'Agresywny', value: 'aggressive' },
  { label: 'Płochliwy', value: 'skittish' },
  { label: 'Nieznany', value: 'unknown' },
];

const feedingScheduleOptions = [
  { label: 'Co tydzień', value: 'weekly' },
  { label: 'Co 2 tygodnie', value: 'biweekly' },
  { label: 'Co miesiąc', value: 'monthly' },
  { label: 'Nieregularnie', value: 'irregular' },
];

const foodTypeOptions = [
  { label: 'Świerszcz', value: 'cricket' },
  { label: 'Karaluch', value: 'roach' },
  { label: 'Mącznik', value: 'mealworm' },
  { label: 'Pączki', value: 'superworm' },
  { label: 'Inne', value: 'other' },
];

const substrateOptions = [
  { label: 'Włókno kokosowe', value: 'coconut_fiber' },
  { label: 'Torf', value: 'peat' },
  { label: 'Ziemia', value: 'soil' },
  { label: 'Piasek', value: 'sand' },
  { label: 'Mieszanka', value: 'mix' },
];

// Funkcja pomocnicza do określenia kategorii stadium na podstawie numeru
const getStageCategory = (stage: number | null): string => {
  if (!stage) return 'Nieznane';
  if (stage <= 3) return 'Młode (L1-L3)';
  if (stage <= 6) return 'Juvenile (L4-L6)';
  if (stage <= 8) return 'Subadult (L7-L8)';
  return 'Adult (L9+)';
};

export default function SpiderForm({ initialData = {}, onDataChange, errors }: SpiderFormProps) {
  const {theme} = useTheme()
  const styles = makeStyles(theme)
  const [formData, setFormData] = useState<SpiderFormData>({
    name: '',
    species: '',
    sex: 'unknown',
    stage: null, // Zmienione na null dla liczby
    dateAcquired: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    webType: 'minimal',
    urticatingHairs: false,
    temperament: 'unknown',
    bodyLength: null,
    weight: null,
    terrariumLength: null,
    terrariumWidth: null,
    terrariumHeight: null,
    substrate: 'coconut_fiber',
    temperature: null,
    humidity: null,
    feedingSchedule: 'weekly',
    foodType: 'cricket',
    notes: '',
    ...initialData,
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);

  const updateField = <K extends keyof SpiderFormData>(
      field: K,
      value: SpiderFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Podstawowe informacje */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🕷️ Podstawowe informacje
            </Text>

            <FormInput
                label="Gatunek naukowy"
                value={formData.species}
                onChangeText={(value) => updateField('species', value)}
                error={errors.species}
                placeholder="np. Grammostola rosea"
                required
            />

            <FormInput
                label="Nazwa/Imię"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
                placeholder="np. Charlotte, Spider-1"
            />

            <FormSelect
                label="Płeć"
                value={formData.sex}
                onValueChange={(value) => updateField('sex', value as any)}
                options={sexOptions}
                error={errors.sex}
                required
            />

          </Card.Content>
        </Card>

        {/* Pomiary */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📏 Pomiary
            </Text>

            <FormNumberInput
                label="Stadium (numer wylinki)"
                value={formData.stage}
                onValueChange={(value) => updateField('stage', value)}
                error={errors.stage}
                min={1}
                max={15}
                placeholder="np. 5"
                helperText={formData.stage ? `Kategoria: ${getStageCategory(formData.stage)}` : 'Wprowadź numer ostatniej wylinki (L1, L2, L3...)'}
            />

            <FormNumberInput
                label="Długość ciała"
                value={formData.bodyLength}
                onValueChange={(value) => updateField('bodyLength', value)}
                error={errors.legSpan}
                unit="cm"
                min={0}
                max={30}
                decimal
                placeholder="np. 12.5"
            />

          </Card.Content>
        </Card>

        {/* Daty */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📅 Daty
            </Text>

            <FormInput
                label="Data nabycia"
                value={formData.dateAcquired}
                onChangeText={(value) => updateField('dateAcquired', value)}
                error={errors.dateAcquired}
                placeholder="YYYY-MM-DD"
                required
            />

            <FormInput
                label="Data urodzenia (jeśli znana)"
                value={formData.dateOfBirth}
                onChangeText={(value) => updateField('dateOfBirth', value)}
                error={errors.dateOfBirth}
                placeholder="YYYY-MM-DD"
            />
          </Card.Content>
        </Card>


        {/* Terrarium */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🏠 Terrarium
            </Text>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormNumberInput
                    label="Długość"
                    value={formData.terrariumLength}
                    onValueChange={(value) => updateField('terrariumLength', value)}
                    error={errors.terrariumLength}
                    unit="cm"
                    min={10}
                    max={200}
                />
              </View>
              <View style={styles.halfWidth}>
                <FormNumberInput
                    label="Szerokość"
                    value={formData.terrariumWidth}
                    onValueChange={(value) => updateField('terrariumWidth', value)}
                    error={errors.terrariumWidth}
                    unit="cm"
                    min={10}
                    max={200}
                />
              </View>
            </View>

            <FormNumberInput
                label="Wysokość"
                value={formData.terrariumHeight}
                onValueChange={(value) => updateField('terrariumHeight', value)}
                error={errors.terrariumHeight}
                unit="cm"
                min={10}
                max={200}
            />

          </Card.Content>
        </Card>

        {/* Karmienie */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🍽️ Karmienie
            </Text>

            <FormSelect
                label="Harmonogram karmienia"
                value={formData.feedingSchedule}
                onValueChange={(value) => updateField('feedingSchedule', value)}
                options={feedingScheduleOptions}
                error={errors.feedingSchedule}
            />

          </Card.Content>
        </Card>

        {/* Notatki */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📝 Notatki
            </Text>

            <FormInput
                label="Dodatkowe informacje"
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                error={errors.notes}
                placeholder="Zachowanie, preferencje, obserwacje..."
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
});