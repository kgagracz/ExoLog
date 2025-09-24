import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator, FAB } from 'react-native-paper';
import { useAnimals } from "../hooks";
import { Theme } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";
import { Animal } from "../types";

// Komponenty
import AnimalDetailsHeader from '../components/molecules/AnimalDetailsHeader';
import SectionCard from '../components/atoms/SectionCard';
import AnimalHeader from '../components/molecules/AnimalHeader';
import MeasurementsSection from '../components/molecules/MeasurementsSection';
import TerrariumSection from '../components/molecules/TerrariumSection';
import FeedingSection from '../components/molecules/FeedingSection';
import BehaviorSection from '../components/molecules/BehaviorSection';
import HealthStatusSection from '../components/molecules/HealthStatusSection';

interface AnimalDetailsScreenProps {
  route: {
    params: {
      animalId: string;
    }
  };
  navigation: any;
}

const AnimalDetailsScreen: React.FC<AnimalDetailsScreenProps> = ({ route, navigation }) => {
  const { animalId } = route.params;
  const { getAnimal, getFeedingHistory } = useAnimals();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [feedingHistory, setFeedingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadAnimalDetails();
  }, [animalId]);

  const loadAnimalDetails = async () => {
    setLoading(true);
    try {
      const [animalResult, feedingResult] = await Promise.all([
        getAnimal(animalId),
        getFeedingHistory(animalId)
      ]);

      if (animalResult.success && animalResult.data) {
        setAnimal(animalResult.data);
      }

      if (feedingResult.success && feedingResult.data) {
        setFeedingHistory(feedingResult.data);
      }
    } catch (error) {
      console.error('Błąd ładowania szczegółów:', error);
      Alert.alert('Błąd', 'Nie udało się załadować szczegółów zwierzęcia');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('EditAnimal', { animalId });
  };

  const handleAddFeeding = () => {
    setMenuVisible(false);
    navigation.navigate('AddFeeding', { preSelectedAnimal: animalId });
  };

  const handleFeedingHistory = () => {
    setMenuVisible(false);
    navigation.navigate('FeedingHistory', { animalId });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <AnimalDetailsHeader
          animalName="Szczegóły zwierzęcia"
          menuVisible={false}
          onMenuToggle={() => {}}
          onGoBack={() => navigation.goBack()}
          onEdit={() => {}}
          onAddFeeding={() => {}}
          onShowHistory={() => {}}
        />
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Ładowanie szczegółów...</Text>
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <AnimalDetailsHeader
          animalName="Szczegóły zwierzęcia"
          menuVisible={false}
          onMenuToggle={() => {}}
          onGoBack={() => navigation.goBack()}
          onEdit={() => {}}
          onAddFeeding={() => {}}
          onShowHistory={() => {}}
        />
        <Text>Nie znaleziono zwierzęcia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimalDetailsHeader
        animalName={animal.name}
        menuVisible={menuVisible}
        onMenuToggle={setMenuVisible}
        onGoBack={() => navigation.goBack()}
        onEdit={handleEdit}
        onAddFeeding={handleAddFeeding}
        onShowHistory={handleFeedingHistory}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Podstawowe informacje */}
        <SectionCard>
          <AnimalHeader animal={animal} />
        </SectionCard>

        {/* Pomiary i wiek */}
        <SectionCard>
          <MeasurementsSection animal={animal} />
        </SectionCard>

        {/* Terrarium */}
        {animal.housing && (
          <SectionCard>
            <TerrariumSection animal={animal} />
          </SectionCard>
        )}

        {/* Karmienie */}
        <SectionCard>
          <FeedingSection
            animal={animal}
            feedingHistory={feedingHistory}
            onShowHistory={handleFeedingHistory}
          />
        </SectionCard>

        {/* Zachowanie */}
        {animal.specificData && (
          <SectionCard>
            <BehaviorSection animal={animal} />
          </SectionCard>
        )}

        {/* Notatki */}
        {animal.notes && (
          <SectionCard>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📝 Notatki
            </Text>
            <Text variant="bodyMedium" style={styles.notesText}>
              {animal.notes}
            </Text>
          </SectionCard>
        )}

        {/* Status zdrowia */}
        <SectionCard>
          <HealthStatusSection animal={animal} />
        </SectionCard>

        {/* Spacer dla FAB */}
        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* FAB do szybkich akcji */}
      <FAB
        icon="food-apple"
        style={styles.fab}
        onPress={handleAddFeeding}
        label="Nakarm"
      />
    </View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.onSurfaceVariant,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  notesText: {
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  fabSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default AnimalDetailsScreen;
