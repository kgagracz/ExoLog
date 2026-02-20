import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Card, Checkbox, HelperText, IconButton, Switch, Text, TextInput} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useAppTranslation } from '../../hooks/useAppTranslation';
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
  feedingSchedule: string;
  notes: string;
  quantity: number;
  hasCites: boolean;
  citesDocumentUri: string;
  citesDocumentName: string;
}

interface SpiderFormProps {
  initialData?: Partial<SpiderFormData>;
  onDataChange: (data: SpiderFormData) => void;
  errors: Record<string, string>;
  editMode?: boolean;
}

export default function SpiderForm({ initialData = {}, onDataChange, errors, editMode = false }: SpiderFormProps) {
  const {theme} = useTheme()
  const { t } = useAppTranslation('forms');

  const sexOptions = [
    { label: t('spider.sex.male'), value: 'male' },
    { label: t('spider.sex.female'), value: 'female' },
    { label: t('spider.sex.unknown'), value: 'unknown' },
  ];

  const feedingScheduleOptions = [
    { label: t('spider.feedingSchedule.weekly'), value: 'weekly' },
    { label: t('spider.feedingSchedule.biweekly'), value: 'biweekly' },
    { label: t('spider.feedingSchedule.monthly'), value: 'monthly' },
    { label: t('spider.feedingSchedule.irregular'), value: 'irregular' },
  ];

  const foodTypeOptions = [
    { label: t('spider.foodType.cricket'), value: 'cricket' },
    { label: t('spider.foodType.roach'), value: 'roach' },
    { label: t('spider.foodType.mealworm'), value: 'mealworm' },
    { label: t('spider.foodType.superworm'), value: 'superworm' },
    { label: t('spider.foodType.other'), value: 'other' },
  ];

  const getStageCategory = (stage: number | null): string => {
    if (!stage) return t('spider.stageCategories.unknown');
    if (stage <= 3) return t('spider.stageCategories.young');
    if (stage <= 6) return t('spider.stageCategories.juvenile');
    if (stage <= 8) return t('spider.stageCategories.subadult');
    return t('spider.stageCategories.adult');
  };
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
    feedingSchedule: 'weekly',
    notes: '',
    quantity: 1,
    hasCites: false,
    citesDocumentUri: '',
    citesDocumentName: '',
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

  const handlePickCitesDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        updateField('citesDocumentUri', file.uri);
        updateField('citesDocumentName', file.name);
      }
    } catch {
      // User cancelled
    }
  };

  const handleRemoveCitesDocument = () => {
    updateField('citesDocumentUri', '');
    updateField('citesDocumentName', '');
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
              {t('spider.basicInfo')}
            </Text>

            <View>
              <TextInput
                  label={t('spider.speciesLabel')}
                  value={formData.species}
                  onChangeText={handleSpeciesChange}
                  mode="outlined"
                  placeholder={t('spider.speciesPlaceholder')}
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
                label={t('spider.nameLabel')}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
                placeholder={addMultiple ? t('spider.namePlaceholderMultiple') : t('spider.namePlaceholderSingle')}
            />

            {!editMode && <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text variant="bodyLarge" style={styles.switchLabel}>{t('spider.addMultiple')}</Text>
                <Text variant="bodySmall" style={styles.switchHelper}>
                  {t('spider.addMultipleHelper')}
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
                      label={t('spider.quantityLabel')}
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
                        ? t('spider.quantityHelper', { count: formData.quantity, prefix: formData.species.split(' ').pop() || t('animals:addSpider.defaultName') })
                        : t('spider.quantityHelperSingle')}
                  </HelperText>
                </>
            )}

            <FormSelect
                label={t('spider.sexLabel')}
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
              {t('spider.measurements')}
            </Text>

            <FormNumberInput
                label={t('spider.stageLabel')}
                value={formData.stage}
                onValueChange={(value) => updateField('stage', value)}
                error={errors.stage}
                min={1}
                max={15}
                placeholder={t('spider.stagePlaceholder')}
                helperText={formData.stage ? t('spider.stageHelper', { category: getStageCategory(formData.stage) }) : t('spider.stageHelperDefault')}
            />

            <FormNumberInput
                label={t('spider.bodyLengthLabel')}
                value={formData.bodyLength}
                onValueChange={(value) => updateField('bodyLength', value)}
                error={errors.legSpan}
                unit="cm"
                min={0}
                max={30}
                decimal
                placeholder={t('spider.bodyLengthPlaceholder')}
            />

          </Card.Content>
        </Card>

        {/* Daty */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('common:dates')}
            </Text>

            <FormInput
                label={t('spider.dateAcquiredLabel')}
                value={formData.dateAcquired}
                onChangeText={(value) => updateField('dateAcquired', value)}
                error={errors.dateAcquired}
                placeholder="YYYY-MM-DD"
                required
            />

            <FormInput
                label={t('spider.dateOfBirthLabel')}
                value={formData.dateOfBirth}
                onChangeText={(value) => updateField('dateOfBirth', value)}
                error={errors.dateOfBirth}
                placeholder="YYYY-MM-DD"
            />
          </Card.Content>
        </Card>

        {/* Karmienie */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('spider.feedingSection')}
            </Text>

            <FormSelect
                label={t('spider.feedingScheduleLabel')}
                value={formData.feedingSchedule}
                onValueChange={(value) => updateField('feedingSchedule', value)}
                options={feedingScheduleOptions}
                error={errors.feedingSchedule}
            />

          </Card.Content>
        </Card>

        {/* CITES */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('spider.documentsSection')}
            </Text>

            <Pressable
                style={styles.checkboxRow}
                onPress={() => {
                  const newValue = !formData.hasCites;
                  updateField('hasCites', newValue);
                  if (!newValue) {
                    handleRemoveCitesDocument();
                  }
                }}
            >
              <Checkbox
                  status={formData.hasCites ? 'checked' : 'unchecked'}
                  onPress={() => {
                    const newValue = !formData.hasCites;
                    updateField('hasCites', newValue);
                    if (!newValue) {
                      handleRemoveCitesDocument();
                    }
                  }}
                  color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>{t('spider.hasCites')}</Text>
            </Pressable>

            {formData.hasCites && (
                <View style={styles.citesContainer}>
                  {formData.citesDocumentUri ? (
                      <View style={styles.citesFileRow}>
                        <View style={styles.citesFileInfo}>
                          <Text style={styles.citesFileName} numberOfLines={1}>
                            {formData.citesDocumentName || 'dokument.pdf'}
                          </Text>
                          <Text style={styles.citesFileHint}>PDF</Text>
                        </View>
                        <IconButton
                            icon="close-circle"
                            size={20}
                            onPress={handleRemoveCitesDocument}
                        />
                      </View>
                  ) : (
                      <Button
                          mode="outlined"
                          icon="file-pdf-box"
                          onPress={handlePickCitesDocument}
                          style={styles.citesButton}
                      >
                        {t('spider.selectPdf')}
                      </Button>
                  )}
                </View>
            )}
          </Card.Content>
        </Card>

        {/* Notatki */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('spider.notesSection')}
            </Text>

            <FormInput
                label={t('spider.notesLabel')}
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                error={errors.notes}
                placeholder={t('spider.notesPlaceholder')}
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  citesContainer: {
    marginLeft: 8,
    marginBottom: 8,
  },
  citesButton: {
    alignSelf: 'flex-start',
  },
  citesFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight || theme.colors.backgroundSecondary,
    borderRadius: 8,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  citesFileInfo: {
    flex: 1,
  },
  citesFileName: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  citesFileHint: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
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