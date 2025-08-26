import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import {Theme} from "../../../styles/theme";

interface SeparatorProps {
  height?: number;
  width?: number;
  color?: string;
  style?: any;
}

const Separator: React.FC<SeparatorProps> = ({
  height,
  width,
  color = 'transparent',
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, height, width, color);

  return <View style={[styles.separator, style]} />;
};

const createStyles = (theme: Theme, customHeight?: number, customWidth?: number, color?: string) => StyleSheet.create({
  separator: {
    height: customHeight || theme.spacing.xs,
    width: customWidth || '100%',
    backgroundColor: color,
  },
});

export default Separator;
