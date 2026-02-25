import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { useAddSpiderMutation, useAddMultipleSpidersMutation, useUpdateAnimalMutation, useUploadCitesMutation } from "../../api/animals";
import { useAuth } from "../../hooks/useAuth";
import { Theme } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";
import SpiderForm from "../../components/molecules/SpiderForm";
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface AddSpiderScreenProps {
  navigation: any;
}

export default function AddSpiderScreen({ navigation }: AddSpiderScreenProps) {
  const { t } = useAppTranslation('animals');
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSpiderMutation = useAddSpiderMutation();
  const addMultipleSpidersMutation = useAddMultipleSpidersMutation();
  const updateAnimalMutation = useUpdateAnimalMutation();
  const uploadCitesMutation = useUploadCitesMutation();
  const saving = addSpiderMutation.isPending || addMultipleSpidersMutation.isPending || uploadCitesMutation.isPending || updateAnimalMutation.isPending;
  const { user } = useAuth();

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getLastWordFromSpecies = (species: string): string => {
    if (!species) return 'Ptasznik';
    const words = species.split(' ');
    const lastWord = words[words.length - 1];
    return lastWord.charAt(0).toUpperCase() + lastWord.slice(1).toLowerCase();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.species?.trim()) {
      newErrors.species = t('addSpider.validation.speciesRequired');
    }

    if (!formData.sex) {
      newErrors.sex = t('addSpider.validation.sexRequired');
    }

    if (!formData.dateAcquired) {
      newErrors.dateAcquired = t('addSpider.validation.dateRequired');
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = t('addSpider.validation.quantityMin');
    }

    if (formData.quantity > 999) {
      newErrors.quantity = t('addSpider.validation.quantityMax');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadCitesIfNeeded = async (animalId: string) => {
    if (!formData.hasCites || !formData.citesDocumentUri || !user) return;

    const uploadResult = await uploadCitesMutation.mutateAsync({
        userId: user.uid, animalId, fileUri: formData.citesDocumentUri,
    });

    await updateAnimalMutation.mutateAsync({ animalId, updates: {
      specificData: {
        hasCites: true,
        citesDocumentUrl: uploadResult.url,
        citesDocumentPath: uploadResult.path,
      },
    }});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert(t('common:error'), t('common:fillRequiredFields'));
      return;
    }

    try {
      const quantity = formData.quantity || 1;
      const speciesLastWord = getLastWordFromSpecies(formData.species);

      // Przygotuj bazowe dane pająka
      const numericStage = formData.stage as number | null;
      const getLifecycleStage = (stage: number | null): 'baby' | 'juvenile' | 'subadult' | 'adult' => {
        if (!stage || stage <= 3) return 'baby';
        if (stage <= 6) return 'juvenile';
        if (stage <= 8) return 'subadult';
        return 'adult';
      };

      const baseSpiderData = {
        species: formData.species?.trim(),
        sex: formData.sex as 'male' | 'female' | 'unknown',
        stage: getLifecycleStage(numericStage),
        currentStage: numericStage ?? undefined,
        dateAcquired: formData.dateAcquired,
        dateOfBirth: formData.dateOfBirth || undefined,
        weight: formData.weight || undefined,
        bodyLength: formData.bodyLength || undefined,
        temperament: formData.temperament || 'unknown',
        feedingSchedule: formData.feedingSchedule || 'weekly',
        foodType: formData.foodType || 'cricket',
        notes: formData.notes?.trim() || '',
      };

      if (quantity === 1) {
        // Pojedynczy pająk
        const name = formData.name?.trim() || speciesLastWord;
        const result = await addSpiderMutation.mutateAsync({
          ...baseSpiderData,
          name,
        });

        if (result.success) {
          if (result.id) {
            await uploadCitesIfNeeded(result.id);
          }
          Alert.alert(
              t('common:success'),
              t('addSpider.successSingle', { name }),
              [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(t('common:error'), result.error || t('addSpider.errorAdd'));
        }
      } else {
        // Wiele pająków
        const namePrefix = formData.name?.trim() || speciesLastWord;

        // Niestandardowy generator nazw z prefixem
        const nameGenerator = (index: number, total: number): string => {
          return `${namePrefix}-${index}`;
        };

        const result = await addMultipleSpidersMutation.mutateAsync({
            baseData: baseSpiderData,
            quantity,
            nameGenerator,
        });

        const { added, failed, names } = result;
        if (failed === 0) {
          const displayNames = names.slice(0, 5).join(', ');
          const moreText = names.length > 5 ? '\n' + t('addSpider.successMultipleMore', { count: names.length - 5 }) : '';

          Alert.alert(
              t('common:success'),
              t('addSpider.successMultiple', { added, names: displayNames }) + moreText,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
              t('common:partialSuccess'),
              t('addSpider.partialSuccessMessage', { added, failed }),
              [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message || t('common:unexpectedError'));
    }
  };

  return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={t('addSpider.title')} />
        </Appbar.Header>

        <SpiderForm
            onDataChange={setFormData}
            errors={errors}
        />

        <FAB
            icon="check"
            style={styles.fab}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            label={saving ? t('common:saving') : formData.quantity > 1 ? t('addSpider.saveCount', { count: formData.quantity }) : t('common:save')}
        />
      </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});