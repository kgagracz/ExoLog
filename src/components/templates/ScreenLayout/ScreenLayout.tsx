import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../theme/themes';

interface ScreenLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  showAddButton?: boolean;
  onBackPress?: () => void;
  onAddPress?: () => void;
  scrollable?: boolean;
  headerRight?: ReactNode;
  backgroundColor?: string;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  showAddButton = false,
  onBackPress,
  onAddPress,
  scrollable = true,
  headerRight,
  backgroundColor,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.container, backgroundColor && { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primary}
        translucent={false}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, showBackButton && styles.headerTitleWithBack]}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {headerRight}
          {showAddButton && (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={onAddPress}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.contentContainer}>
        {scrollable ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {children}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.medium,
    ...Platform.select({ ios: { paddingTop: theme.spacing.medium }, android: { elevation: 4 } }),
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.small,
  },
  backButtonText: { fontSize: theme.typography.fontSize.xl, color: theme.colors.textInverse, fontWeight: theme.typography.fontWeight.medium },
  headerTitle: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textInverse, letterSpacing: 0.5 },
  headerTitleWithBack: { marginLeft: 0 },
  addButton: {
    width: theme.sizes.button.medium.height - 8,
    height: theme.sizes.button.medium.height - 8,
    borderRadius: theme.borderRadius.large,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: theme.colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.small,
  },
  addButtonText: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.light, color: theme.colors.textInverse },
  contentContainer: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  scrollView: { flex: 1 },
  scrollContent: { padding: theme.spacing.medium, paddingBottom: theme.spacing.large },
  content: { flex: 1, padding: theme.spacing.medium },
});

export default ScreenLayout
