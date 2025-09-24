import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface BehaviorSectionProps {
  animal: Animal;
}

const BehaviorSection: React.FC<BehaviorSectionProps> = ({ animal }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  if (!animal.specificData) return null;

  return (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        🕷️ Zachowanie
      </Text>
      <List.Item
        title="Temperament"
        description={animal.specificData.temperament || 'Nieznany'}
        left={() => <List.Icon icon="emoticon-outline" />}
      />
      <List.Item
        title="Typ sieci"
        description={animal.specificData.webType || 'Nieznany'}
        left={() => <List.Icon icon="web" />}
      />
      {animal.specificData.urticatingHairs !== undefined && (
        <List.Item
          title="Włoski żądlące"
          description={animal.specificData.urticatingHairs ? 'Tak' : 'Nie'}
          left={() => <List.Icon icon="alert" />}
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

export default BehaviorSection;
