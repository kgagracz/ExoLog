import React from 'react';
import { View, StyleSheet } from 'react-native';
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";
import {Text} from "../atoms";

interface FormValueDisplayProps {
    label: string;
    value: string | number | null | undefined;
    unit?: string;
    placeholder?: string;
}

export default function FormValueDisplay({
                                             label,
                                             value,
                                             unit,
                                             placeholder = '—',
                                         }: FormValueDisplayProps) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const displayValue = value !== null && value !== undefined
        ? `${value}${unit ? ` ${unit}` : ''}`
        : placeholder;

    const hasValue = value !== null && value !== undefined;

    return (
        <View style={styles.container}>
            <Text variant="caption" style={styles.label}>{label}</Text>
            <View style={styles.valueContainer}>
                <Text
                    variant="body"
                    color={hasValue ? theme.colors.textPrimary : theme.colors.textLight}
                >
                    {displayValue}
                </Text>
            </View>
        </View>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    label: {
        marginBottom: 6,
        color: theme.colors.textSecondary,
    },
    valueContainer: {
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
});