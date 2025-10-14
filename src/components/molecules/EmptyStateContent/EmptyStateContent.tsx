// EmptyStateContent.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '../../../context/ThemeContext';
import { Text } from '../../atoms';
import { Theme } from "../../../styles/theme";

export interface EmptyStateContentProps {
  emoji?: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
  buttonIcon?: string;
  style?: any;
}

const EmptyStateContent: React.FC<EmptyStateContentProps> = ({
                                                               emoji = "📭",
                                                               title,
                                                               description,
                                                               buttonText,
                                                               onButtonPress,
                                                               buttonIcon,
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

        {buttonText && onButtonPress && (
            <Button
                mode="contained"
                onPress={onButtonPress}
                icon={buttonIcon}
                style={styles.button}
            >
              {buttonText}
            </Button>
        )}
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
    marginBottom: theme.spacing.large,
  },

  button: {
    marginTop: theme.spacing.medium,
  },
});

export default EmptyStateContent;