import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface MeasurementsSectionProps {
  animal: Animal;
}

const MeasurementsSection: React.FC<MeasurementsSectionProps> = ({ animal }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const calculateAge = (dateAcquired: string, dateOfBirth?: string): string => {
    const referenceDate = dateOfBirth ? new Date(dateOfBirth) : new Date(dateAcquired);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - referenceDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} dni`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} miesięcy`;
    return `${Math.floor(diffDays / 365)} lat`;
  };

  return (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        📏 Pomiary i wiek
      </Text>
      <List.Item
        title="Długość ciała"
        description={animal.measurements?.length ? `${animal.measurements.length} cm` : 'Nie zmierzono'}
        left={() => <List.Icon icon="ruler" />}
      />
      <List.Item
        title="Wiek"
        description={calculateAge(animal.dateAcquired, animal.dateOfBirth)}
        left={() => <List.Icon icon="calendar" />}
      />
      <List.Item
        title="Data nabycia"
        description={new Date(animal.dateAcquired).toLocaleDateString('pl-PL')}
        left={() => <List.Icon icon="calendar-plus" />}
      />
      {animal.dateOfBirth && (
        <List.Item
          title="Data urodzenia"
          description={new Date(animal.dateOfBirth).toLocaleDateString('pl-PL')}
          left={() => <List.Icon icon="cake" />}
        />
      )}
    </>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
});

export default MeasurementsSection;
