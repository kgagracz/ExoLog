import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Text } from '../../atoms';
import {Theme} from "../../../styles/theme";

interface EmptyStateContentProps {
  emoji?: string;
  title: string;
  description: string;
  style?: any;
}

const EmptyStateContent: React.FC<EmptyStateContentProps> = ({
  emoji = "📭",
  title,
  description,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="h2" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" style={styles.description}>
        {description}
      </Text>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.xl + theme.spacing.large,
    minHeight: 300,
  },

  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.large,
    opacity: 0.7,
  },

  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.small + 2,
  },

  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default EmptyStateContent;
