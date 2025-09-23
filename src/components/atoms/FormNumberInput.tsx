import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface FormNumberInputProps {
  label: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  error?: string;
  placeholder?: string;
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
  unit,
  min,
  max,
  disabled = false,
  required = false,
  decimal = false
}: FormNumberInputProps) {
  
  const handleChangeText = (text: string) => {
    if (text === '') {
      onValueChange(null);
      return;
    }

    const numValue = decimal ? parseFloat(text) : parseInt(text);
    
    if (isNaN(numValue)) {
      return;
    }

    if (min !== undefined && numValue < min) {
      return;
    }

    if (max !== undefined && numValue > max) {
      return;
    }

    onValueChange(numValue);
  };

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
        style={styles.input}
        right={unit ? <TextInput.Affix text={unit} /> : undefined}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 8,
  },
});
