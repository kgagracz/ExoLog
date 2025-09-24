import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface TerrariumSectionProps {
  animal: Animal;
}

const TerrariumSection: React.FC<TerrariumSectionProps> = ({ animal }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  if (!animal.housing) return null;

  return (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        🏠 Terrarium
      </Text>
      <List.Item
        title="Wymiary"
        description={
          animal.housing.dimensions?.length && animal.housing.dimensions?.width && animal.housing.dimensions?.height
            ? `${animal.housing.dimensions.length} × ${animal.housing.dimensions.width} × ${animal.housing.dimensions.height} cm`
            : 'Nie określono'
        }
        left={() => <List.Icon icon="cube-outline" />}
      />
      <List.Item
        title="Podłoże"
        description={animal.housing.substrate || 'Nie określono'}
        left={() => <List.Icon icon="layers" />}
      />
      {animal.housing.temperature?.day && (
        <List.Item
          title="Temperatura"
          description={`${animal.housing.temperature.day}°C`}
          left={() => <List.Icon icon="thermometer" />}
        />
      )}
      {animal.housing.humidity && (
        <List.Item
          title="Wilgotność"
          description={`${animal.housing.humidity}%`}
          left={() => <List.Icon icon="water-percent" />}
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

export default TerrariumSection;
