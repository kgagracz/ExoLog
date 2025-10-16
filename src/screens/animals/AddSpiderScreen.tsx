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

  const { addAnimal, addMultipleAnimals } = useAnimals();
  const { categories } = useCategories();
  const { animalTypes } = useAnimalTypes('tsXnqoMTNElLOrIplWhn');

  const {theme} = useTheme()
  const styles = createStyles(theme)

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

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola');
      return;
    }

    setSaving(true);

    try {
      const arachnidsCategory = categories.find(cat => cat.name === 'arachnids');
      if (!arachnidsCategory) {
        Alert.alert('Błąd', 'Nie znaleziono kategorii pajęczaków. Zainicjalizuj bazę danych.');
        setSaving(false);
        return;
      }

      const tarantulaType = animalTypes.find(type =>
          type.name === 'tarantula' && type.categoryId === arachnidsCategory.id
      );
      if (!tarantulaType) {
        Alert.alert('Błąd', 'Nie znaleziono typu ptasznik. Zainicjalizuj bazę danych.');
        setSaving(false);
        return;
      }

      const quantity = formData.quantity || 1;
      const baseName = formData.name?.trim() || getLastWordFromSpecies(formData.species);
      const speciesLastWord = getLastWordFromSpecies(formData.species);

      // Przygotuj bazowe dane zwierzęcia (bez nazwy)
      const baseAnimalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'name'> = {
        categoryId: arachnidsCategory.id,
        animalTypeId: tarantulaType.id,
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

      // Dodaj ptaszniki
      const results = [];
      const errors = [];

      for (let i = 0; i < quantity; i++) {
        // Określ nazwę: jeśli quantity = 1, użyj podanej nazwy lub domyślnej
        // Jeśli quantity > 1, zawsze numeruj
        let animalName: string;
        if (quantity === 1) {
          animalName = baseName;
        } else {
          // Jeśli użytkownik podał własną nazwę i dodaje wiele, użyj tej nazwy + numer
          // Jeśli nie podał, użyj ostatniego słowa z gatunku + numer
          const namePrefix = formData.name?.trim() || speciesLastWord;
          animalName = `${namePrefix}-${i + 1}`;
        }

        const animalData = {
          ...baseAnimalData,
          name: animalName,
        };

        const result = await addAnimal(animalData);

        if (result.success) {
          results.push(animalName);
        } else {
          errors.push({ name: animalName, error: result.error });
        }
      }

      // Pokaż podsumowanie
      if (errors.length === 0) {
        const message = quantity === 1
            ? `Ptasznik "${results[0]}" został dodany!`
            : `Dodano ${results.length} ptaszników:\n${results.slice(0, 5).join(', ')}${results.length > 5 ? `\n... i ${results.length - 5} więcej` : ''}`;

        Alert.alert(
            'Sukces',
            message,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else if (results.length > 0) {
        // Częściowy sukces
        Alert.alert(
            'Częściowy sukces',
            `Dodano ${results.length} ptaszników, ale ${errors.length} nie udało się dodać.\n\nBłędy:\n${errors.map(e => `${e.name}: ${e.error}`).join('\n')}`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Całkowita porażka
        Alert.alert(
            'Błąd',
            `Nie udało się dodać żadnego ptasznika.\n\nBłędy:\n${errors.map(e => `${e.name}: ${e.error}`).join('\n')}`
        );
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