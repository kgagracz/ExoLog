import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, HelperText, Text } from 'react-native-paper';
import { theme } from '@styles/theme';
import {Theme} from "../../styles/theme";
import {useTheme} from "../../context/ThemeContext";

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function FormSelect({
  label,
  value,
  onValueChange,
  options,
  error,
  placeholder = "Wybierz opcję",
  disabled = false,
  required = false
}: FormSelectProps) {
  const {theme} = useTheme()
  const styles = makeStyles(theme)

  const [visible, setVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        {required ? `${label} *` : label}
      </Text>
      
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setVisible(true)}
            disabled={disabled}
            style={[
              styles.selectButton,
              error ? styles.errorButton : null
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={[
              styles.buttonLabel,
              !selectedOption ? styles.placeholderText : null
            ]}
          >
            {displayValue}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onValueChange(option.value);
              setVisible(false);
            }}
            title={option.label}
          />
        ))}
      </Menu>
      
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    color: theme.colors.textSecondary,
  },
  selectButton: {
    justifyContent: 'flex-start',
  },
  errorButton: {
    borderColor: theme.colors.error,
  },
  buttonContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  buttonLabel: {
    textAlign: 'left',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
  },
});
