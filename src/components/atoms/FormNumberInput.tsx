import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useTheme } from "../../context/ThemeContext";

interface FormNumberInputProps {
  label: string;
  value: number | null;
  defaultValue?: string;
  onValueChange: (value: number | null) => void;
  error?: string;
  placeholder?: string;
  prefix?: string;
  unit?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  decimal?: boolean;
}

export default function FormNumberInput({
                                          label,
                                          value,
                                          onValueChange,
                                          error,
                                          placeholder,
                                          prefix,
                                          unit,
                                          min,
                                          max,
                                          disabled = false,
                                          required = false,
                                          decimal = false,
                                          defaultValue
                                        }: FormNumberInputProps) {
  const { theme } = useTheme();

  const handleChangeText = (text: string) => {
    if (text === '') {
      onValueChange(null);
      return;
    }

    const numValue = decimal ? parseFloat(text) : parseInt(text);

    if (isNaN(numValue)) {
      return;
    }

    onValueChange(numValue);
  };

  const styles = createStyles(theme);

  return (
      <>
        <TextInput
            label={required ? `${label} *` : label}
            value={value?.toString() || ''}
            onChangeText={handleChangeText}
            mode="outlined"
            placeholder={placeholder}
            keyboardType={decimal ? 'decimal-pad' : 'numeric'}
            disabled={disabled}
            error={!!error}
            style={[styles.input, disabled && styles.inputDisabled]}
            left={prefix ? <TextInput.Affix text={prefix} /> : undefined}
            right={unit ? <TextInput.Affix text={unit} /> : undefined}
            defaultValue={defaultValue}
            textColor={disabled ? theme.colors.textSecondary : undefined}
            outlineColor={disabled ? theme.colors.border : undefined}
        />
        {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
        )}
      </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  input: {
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
});