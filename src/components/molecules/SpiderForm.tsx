import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Card, HelperText, Switch, Text, TextInput} from 'react-native-paper';
import FormInput from '../atoms/FormInput';
import FormSelect from '../atoms/FormSelect';
import FormNumberInput from '../atoms/FormNumberInput';
import {Theme} from "../../styles/theme";
import {useTheme} from "../../context/ThemeContext";

interface SpiderSpeciesResult {
  canonical: string;
  genus: string;
  species: string;
  family: string;
  author: string;
  year: string;
  distribution: string;
}

interface SpiderFormData {
  name: string;
  species: string;
  sex: 'male' | 'female' | 'unknown';
  stage: number | null;
  dateAcquired: string;
  dateOfBirth: string;
  bodyLength: number | null;
  terrariumLength: number | null;
  terrariumWidth: number | null;
  terrariumHeight: number | null;
  feedingSchedule: string;
  notes: string;
  quantity: number; // Nowe pole
}

interface SpiderFormProps {
  initialData?: Partial<SpiderFormData>;
  onDataChange: (data: SpiderFormData) => void;
  errors: Record<string, string>;
  editMode?: boolean;
}

const sexOptions = [
  { label: 'Samiec', value: 'male' },
  { label: 'Samica', value: 'female' },
  { label: 'Nieznana', value: 'unknown' },
];

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

const getStageCategory = (stage: number | null): string => {
  if (!stage) return 'Nieznane';
  if (stage <= 3) return 'Młode (L1-L3)';
  if (stage <= 6) return 'Juvenile (L4-L6)';
  if (stage <= 8) return 'Subadult (L7-L8)';
  return 'Adult (L9+)';
};

export default function SpiderForm({ initialData = {}, onDataChange, errors, editMode = false }: SpiderFormProps) {
  const {theme} = useTheme()
  const styles = makeStyles(theme)
  const [addMultiple, setAddMultiple] = useState(false);
  const [formData, setFormData] = useState<SpiderFormData>({
    name: '',
    species: '',
    sex: 'unknown',
    stage: null,
    dateAcquired: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    bodyLength: null,
    terrariumLength: null,
    terrariumWidth: null,
    terrariumHeight: null,
    feedingSchedule: 'weekly',
    notes: '',
    quantity: 1, // Domyślnie 1
    ...initialData,
  });

  const [speciesSuggestions, setSpeciesSuggestions] = useState<SpiderSpeciesResult[]>([]);
  const [speciesLoading, setSpeciesLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchSpecies = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSpeciesSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSpeciesLoading(true);
    try {
      const response = await fetch(
        `https://spiders.invert.info/species/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const species = (data.results || []).filter((r: any) => r.rank === 'species');
      setSpeciesSuggestions(species);
      setShowSuggestions(species.length > 0);
    } catch {
      setSpeciesSuggestions([]);
    } finally {
      setSpeciesLoading(false);
    }
  }, []);

  const handleSpeciesChange = (value: string) => {
    updateField('species', value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => searchSpecies(value), 400);
  };

  const handleSpeciesSelect = (result: SpiderSpeciesResult) => {
    updateField('species', result.canonical);
    setShowSuggestions(false);
    setSpeciesSuggestions([]);
  };

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);

  const updateField = <K extends keyof SpiderFormData>(
      field: K,
      value: SpiderFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultipleToggle = () => {
    setAddMultiple(!addMultiple);
    if (addMultiple) {
      // Jeśli wyłączamy tryb wielokrotny, resetuj ilość do 1
      updateField('quantity', 1);
    }
  };

  return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Podstawowe informacje */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🕷️ Podstawowe informacje
            </Text>

            <View>
              <TextInput
                  label="Nazwa gatunkowa *"
                  value={formData.species}
                  onChangeText={handleSpeciesChange}
                  mode="outlined"
                  placeholder="np. Grammostola rosea"
                  error={!!errors.species}
                  style={styles.input}
                  right={speciesLoading ? <TextInput.Icon icon={() => <ActivityIndicator size={16} />} /> : undefined}
              />
              {errors.species && (
                  <HelperText type="error" visible={!!errors.species}>
                    {errors.species}
                  </HelperText>
              )}
              {showSuggestions && (
                  <View style={styles.suggestionsContainer}>
                    {speciesSuggestions.map((result, index) => (
                        <Pressable
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSpeciesSelect(result)}
                        >
                          <Text style={styles.suggestionName}>{result.canonical}</Text>
                          <Text style={styles.suggestionDetails}>
                            {result.family}{result.distribution ? ` · ${result.distribution}` : ''}
                            {result.author ? ` · ${result.author}, ${result.year}` : ''}
                          </Text>
                        </Pressable>
                    ))}
                  </View>
              )}
            </View>

            <FormInput
                label="Nazwa własna/Imię"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
                placeholder={addMultiple ? "np. Charlotte (opcjonalne przy ilości > 1)" : "np. Charlotte, Spider-1"}
            />

            {!editMode && <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text variant="bodyLarge" style={styles.switchLabel}>Dodaj wiele</Text>
                <Text variant="bodySmall" style={styles.switchHelper}>
                  Włącz, aby dodać wiele ptaszników tego samego gatunku jednocześnie
                </Text>
              </View>
              <Switch
                  value={addMultiple}
                  onValueChange={handleMultipleToggle}
                  color={theme.colors.primary}
              />
            </View>}

            {addMultiple && (
                <>
                  <FormNumberInput
                      label="Ilość ptaszników"
                      value={formData.quantity}
                      onValueChange={(value) => updateField('quantity', value || 1)}
                      error={errors.quantity}
                      min={1}
                      max={999}
                      placeholder="1"
                      required
                  />
                  <HelperText type="info" visible={formData.quantity > 1}>
                    {formData.quantity > 1
                        ? `Zostanie utworzonych ${formData.quantity} ptaszników z automatycznymi nazwami (np. ${formData.species.split(' ').pop() || 'Ptasznik'}-1, ${formData.species.split(' ').pop() || 'Ptasznik'}-2...)`
                        : 'Wprowadź liczbę większą niż 1, aby dodać wiele ptaszników jednocześnie'}
                  </HelperText>
                </>
            )}

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
        {!editMode && <Card style={styles.section}>
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
        </Card>}

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
    backgroundColor: theme.colors.backgroundSecondary,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: theme.colors.backgroundSecondary,
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
  input: {
    marginBottom: 8,
  },
  suggestionsContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border || '#ccc',
    borderRadius: 8,
    marginTop: -4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border || '#ccc',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    color: theme.colors.text,
  },
  suggestionDetails: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});