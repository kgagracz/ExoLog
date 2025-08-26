import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Text } from '../../atoms';
import {Theme} from "../../../styles/theme";

interface StatCardProps {
  value: string | number;
  label: string;
  style?: any;
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Text variant="body" style={styles.value}>
        {value}
      </Text>
      <Text variant="caption" style={styles.label}>
        {label}
      </Text>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    minHeight: 50,
  },

  value: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },

  label: {
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default StatCard;
