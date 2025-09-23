import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import {useAnimals, useAnimalTypes, useCategories} from "../../hooks";
import {Animal} from "../../types";
import SpiderForm from "../../components/molecules/SpiderForm";
import {Theme} from "../../styles/theme";
import {useTheme} from "../../context/ThemeContext";

interface AddSpiderScreenProps {
  navigation: any;
}

export default function AddSpiderScreen({ navigation }: AddSpiderScreenProps) {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { addAnimal } = useAnimals();
  const { categories } = useCategories();
  const { animalTypes } = useAnimalTypes('tsXnqoMTNElLOrIplWhn');

  const {theme} = useTheme()
  const styles = createStyles(theme)

  // Funkcja do wyciągnięcia ostatniego słowa z gatunku
  const getLastWordFromSpecies = (species: string): string => {
    if (!species) return 'Ptasznik';

    const words = species.split(' ');
    const lastWord = words[words.length - 1];

    // Kapitalizuj pierwszą literę
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola');
      return;
    }

    setSaving(true);

    try {
      // Znajdź ID kategorii pajęczaków
      const arachnidsCategory = categories.find(cat => cat.name === 'arachnids');
      if (!arachnidsCategory) {
        Alert.alert('Błąd', 'Nie znaleziono kategorii pajęczaków. Zainicjalizuj bazę danych.');
        return;
      }

      // Znajdź ID typu ptasznik
      const tarantulaType = animalTypes.find(type =>
          type.name === 'tarantula' && type.categoryId === arachnidsCategory.id
      );
      if (!tarantulaType) {
        Alert.alert('Błąd', 'Nie znaleziono typu ptasznik. Zainicjalizuj bazę danych.');
        return;
      }

      // Przygotuj dane zwierzęcia
      const animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
        categoryId: arachnidsCategory.id,
        animalTypeId: tarantulaType.id,
        name: formData.name ? formData.name.trim() : getLastWordFromSpecies(formData.species),
        species: formData.species?.trim(),
        sex: formData.sex,
        stage: formData.stage,
        dateAcquired: formData.dateAcquired,
        dateOfBirth: formData.dateOfBirth || undefined,
        measurements: {
          weight: formData.weight || undefined,
          length: formData.bodyLength || undefined,
          lastMeasured: new Date().toISOString().split('T')[0],
        },
        specificData: {
          webType: formData.webType || 'minimal',
          urticatingHairs: formData.urticatingHairs || false,
          temperament: formData.temperament || 'unknown',
          legSpan: formData.bodyLength,
        },
        healthStatus: 'healthy',
        isActive: true,
        housing: {
          type: 'terrarium',
          dimensions: {
            length: formData.terrariumLength || undefined,
            width: formData.terrariumWidth || undefined,
            height: formData.terrariumHeight || undefined,
          },
          substrate: formData.substrate || 'coconut_fiber',
          temperature: {
            day: formData.temperature || undefined,
          },
          humidity: formData.humidity || undefined,
          accessories: [],
        },
        feeding: {
          schedule: formData.feedingSchedule || 'weekly',
          foodType: formData.foodType || 'cricket',
        },
        photos: [],
        notes: formData.notes?.trim() || '',
        behavior: formData.temperament || 'unknown',
        tags: ['tarantula'],
        veterinary: {
          vaccinations: [],
          medications: [],
          allergies: [],
        },
      };

      const result = await addAnimal(animalData);

      if (result.success) {
        Alert.alert(
            'Sukces',
            `Ptasznik "${animalData.name}" został dodany!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Błąd', result.error || 'Nie udało się dodać ptasznika');
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
            label={saving ? "Zapisywanie..." : "Zapisz"}
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