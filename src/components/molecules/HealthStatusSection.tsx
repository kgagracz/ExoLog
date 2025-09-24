import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface HealthStatusSectionProps {
  animal: Animal;
}

const HealthStatusSection: React.FC<HealthStatusSectionProps> = ({ animal }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        ❤️ Status zdrowia
      </Text>
      <List.Item
        title="Stan zdrowia"
        description={animal.healthStatus || 'Nieznany'}
        left={() => <List.Icon icon="heart-pulse" />}
      />
      <List.Item
        title="Status aktywności"
        description={animal.isActive ? 'Aktywne' : 'Nieaktywne'}
        left={() => <List.Icon icon="power" />}
      />
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

export default HealthStatusSection;
