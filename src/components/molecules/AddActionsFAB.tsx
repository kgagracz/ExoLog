import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";

interface AddActionsFABProps {
  visible: boolean;
  open: boolean;
  onStateChange: (state: { open: boolean }) => void;
  onAddAnimal: () => void;
  onAddFeeding: () => void;
}

const AddActionsFAB: React.FC<AddActionsFABProps> = ({
  visible,
  open,
  onStateChange,
  onAddAnimal,
  onAddFeeding
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={true}
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'spider',
            label: 'Dodaj pająka',
            onPress: onAddAnimal,
            style: { backgroundColor: theme.colors.primary },
          },
          {
            icon: 'food-apple',
            label: 'Dodaj karmienie',
            onPress: onAddFeeding,
            style: { backgroundColor: theme.colors.secondary },
          },
        ]}
        onStateChange={onStateChange}
        style={styles.fabGroup}
        fabStyle={{ backgroundColor: theme.colors.primary }}
      />
    </Portal>
  );
};

const styles = StyleSheet.create({
  fabGroup: {
    paddingBottom: 16,
  },
});

export default AddActionsFAB;
