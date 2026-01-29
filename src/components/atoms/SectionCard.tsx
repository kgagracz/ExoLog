import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  icon?: string;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  style?: any;
}

const SectionCard: React.FC<SectionCardProps> = ({
                                                   children,
                                                   title,
                                                   icon,
                                                   rightAction,
                                                   style
                                                 }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
      <Card style={[styles.card, style]}>
        {title && (
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <Text variant="titleMedium" style={styles.title}>{title}</Text>
              </View>
              {rightAction && (
                  <IconButton
                      icon={rightAction.icon}
                      size={20}
                      onPress={rightAction.onPress}
                      style={styles.actionButton}
                  />
              )}
            </View>
        )}
        <Card.Content style={title ? styles.contentWithHeader : undefined}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  actionButton: {
    margin: 0,
  },
  contentWithHeader: {
    paddingTop: 8,
  },
});

export default SectionCard;