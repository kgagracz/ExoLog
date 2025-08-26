import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Text } from '../../atoms';
import {Theme} from "../../../styles/theme";

interface AnimalInfoProps {
  name: string;
  species: string;
  style?: any;
}

const AnimalInfo: React.FC<AnimalInfoProps> = ({
  name,
  species,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Text variant="h3" style={styles.name}>
        {name}
      </Text>
      <Text variant="bodySmall" style={styles.species}>
        {species}
      </Text>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    marginRight: theme.spacing.small,
  },

  name: {
    marginBottom: 3,
    letterSpacing: 0.3,
    fontSize: theme.typography.fontSize.lg,
  },

  species: {
    fontStyle: 'italic',
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.tight,
  },
});

export default AnimalInfo;
