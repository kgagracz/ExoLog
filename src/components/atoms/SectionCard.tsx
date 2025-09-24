import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";

interface SectionCardProps {
  children: ReactNode;
  style?: any;
}

const SectionCard: React.FC<SectionCardProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
});

export default SectionCard;
