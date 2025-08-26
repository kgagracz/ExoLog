import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <ActivityIndicator
      size={size}
      color={color || theme.colors.primary}
      style={[styles.spinner, style]}
    />
  );
};

const styles = StyleSheet.create({
  spinner: {
    // Dodatkowe style jeśli potrzeba
  },
});

export default LoadingSpinner;
