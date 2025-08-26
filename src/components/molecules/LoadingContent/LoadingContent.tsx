import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../theme/themes';
import { LoadingSpinner, Text } from '../../atoms';

interface LoadingContentProps {
  message?: string;
  size?: 'small' | 'large';
  style?: any;
}

const LoadingContent: React.FC<LoadingContentProps> = ({
  message = "Ładowanie...",
  size = "large",
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <LoadingSpinner size={size} />
      {message && (
        <Text variant="body" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },

  message: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default LoadingContent;
