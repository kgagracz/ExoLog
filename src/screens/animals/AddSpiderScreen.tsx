import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { useAnimals } from "../../hooks";
import { useAuth } from "../../hooks/useAuth";
import { Theme } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";
import SpiderForm from "../../components/molecules/SpiderForm";
import { storageService } from "../../services/firebase/storageService";

interface AddSpiderScreenProps {
  navigation: any;
}

export default function AddSpiderScreen({ navigation }: AddSpiderScreenProps) {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { addSpider, addMultipleSpiders, updateAnimal } = useAnimals();
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
      newErrors.species = 'Gatunek jest wymagany';
    }

    if (!formData.sex) {
      newErrors.sex = 'Płeć jest wymagana';
    }

    if (!formData.dateAcquired) {
      newErrors.dateAcquired = 'Data nabycia jest wymagana';
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Ilość musi być większa niż 0';
    }

    if (formData.quantity > 999) {
      newErrors.quantity = 'Maksymalna ilość to 999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadCitesIfNeeded = async (animalId: string) => {
    if (!formData.hasCites || !formData.citesDocumentUri || !user) return;

    const uploadResult = await storageService.uploadCitesDocument(
        user.uid, animalId, formData.citesDocumentUri
    );

    if (uploadResult.success) {
      await updateAnimal(animalId, {
        specificData: {
          hasCites: true,
          citesDocumentUrl: uploadResult.url,
          citesDocumentPath: uploadResult.path,
        },
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola');
      return;
    }

    setSaving(true);

    try {
      const quantity = formData.quantity || 1;
      const speciesLastWord = getLastWordFromSpecies(formData.species);

      // Przygotuj bazowe dane pająka
      const baseSpiderData = {
        species: formData.species?.trim(),
        sex: formData.sex as 'male' | 'female' | 'unknown',
        stage: formData.stage as 'baby' | 'juvenile' | 'subadult' | 'adult',
        currentStage: formData.currentStage,
        dateAcquired: formData.dateAcquired,
        dateOfBirth: formData.dateOfBirth || undefined,
        weight: formData.weight || undefined,
        bodyLength: formData.bodyLength || undefined,
        temperament: formData.temperament || 'unknown',
        terrariumLength: formData.terrariumLength || undefined,
        terrariumWidth: formData.terrariumWidth || undefined,
        terrariumHeight: formData.terrariumHeight || undefined,
        substrate: formData.substrate || 'coconut_fiber',
        temperature: formData.temperature || undefined,
        humidity: formData.humidity || undefined,
        feedingSchedule: formData.feedingSchedule || 'weekly',
        foodType: formData.foodType || 'cricket',
        notes: formData.notes?.trim() || '',
      };

      if (quantity === 1) {
        // Pojedynczy pająk
        const name = formData.name?.trim() || speciesLastWord;
        const result = await addSpider({
          ...baseSpiderData,
          name,
        });

        if (result.success) {
          if (result.id) {
            await uploadCitesIfNeeded(result.id);
          }
          Alert.alert(
              'Sukces',
              `Ptasznik "${name}" został dodany!`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Błąd', result.error || 'Nie udało się dodać ptasznika');
        }
      } else {
        // Wiele pająków
        const namePrefix = formData.name?.trim() || speciesLastWord;

        // Niestandardowy generator nazw z prefixem
        const nameGenerator = (index: number, total: number): string => {
          return `${namePrefix}-${index}`;
        };

        const result = await addMultipleSpiders(baseSpiderData, quantity, nameGenerator);

        if (result.success) {
          const { added, failed, names } = result;
          if(!(added && failed && names)) {
            return
          }
          if (failed === 0) {
            const displayNames = names.slice(0, 5).join(', ');
            const moreText = names.length > 5 ? `\n... i ${names.length - 5} więcej` : '';

            Alert.alert(
                'Sukces',
                `Dodano ${added} ptaszników:\n${displayNames}${moreText}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } else {
            Alert.alert(
                'Częściowy sukces',
                `Dodano ${added} ptaszników, ale ${failed} nie udało się dodać.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        } else {
          Alert.alert('Błąd', result.error || 'Nie udało się dodać ptaszników');
        }
      }
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Wystąpił nieoczekiwany błąd');
    } finally {
      setSaving(false);
    }
  };

  return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Dodaj Ptasznika" />
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
            label={saving ? "Zapisywanie..." : formData.quantity > 1 ? `Zapisz (${formData.quantity})` : "Zapisz"}
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