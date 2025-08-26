import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Theme } from '../../../theme/themes';
import ScreenLayout from '../ScreenLayout/ScreenLayout';

interface ListScreenLayoutProps {
  title: string;
  searchComponent?: ReactNode;
  listComponent: ReactNode;
  showBackButton?: boolean;
  showAddButton?: boolean;
  onBackPress?: () => void;
  onAddPress?: () => void;
  headerRight?: ReactNode;
}

const ListScreenLayout: React.FC<ListScreenLayoutProps> = ({
  title,
  searchComponent,
  listComponent,
  showBackButton = false,
  showAddButton = false,
  onBackPress,
  onAddPress,
  headerRight,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <ScreenLayout
      title={title}
      showBackButton={showBackButton}
      showAddButton={showAddButton}
      onBackPress={onBackPress}
      onAddPress={onAddPress}
      headerRight={headerRight}
      scrollable={false}
    >
      {searchComponent && (
        <View style={styles.searchSection}>{searchComponent}</View>
      )}
      <View style={styles.listSection}>{listComponent}</View>
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  searchSection: {},
  listSection: { flex: 1 },
});

export default ListScreenLayout
