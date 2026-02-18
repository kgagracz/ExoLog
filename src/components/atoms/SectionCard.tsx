import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
                {icon && (
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={theme.colors.primary}
                        style={styles.icon}
                    />
                )}
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
    margin: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.ms,
    paddingBottom: theme.spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: theme.spacing.small,
  },
  title: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  actionButton: {
    margin: 0,
  },
  contentWithHeader: {
    paddingTop: theme.spacing.small,
  },
});

export default SectionCard;
