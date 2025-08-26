import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../theme/themes';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'button';

interface CustomTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  onPress?: () => void;
}

const Text: React.FC<CustomTextProps> = ({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getVariantStyle = (variant: TextVariant): TextStyle => {
    switch (variant) {
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'body': return styles.body;
      case 'bodySmall': return styles.bodySmall;
      case 'caption': return styles.caption;
      case 'button': return styles.button;
      default: return styles.body;
    }
  };

  return (
    <RNText
      style={[getVariantStyle(variant), color && { color }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  h1: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.xxxl * 1.2,
  },
  h2: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.xxl * 1.25,
  },
  h3: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.xl * 1.3,
  },
  body: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },
  caption: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.textLight,
    lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.tight,
  },
  button: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textInverse,
    lineHeight: theme.typography.fontSize.base * 1.2,
  },
});

export default Text;
