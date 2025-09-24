import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, List, Divider, Button } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface FeedingSectionProps {
  animal: Animal;
  feedingHistory: any[];
  onShowHistory: () => void;
}

const FeedingSection: React.FC<FeedingSectionProps> = ({ 
  animal, 
  feedingHistory, 
  onShowHistory 
}) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        🍽️ Karmienie
      </Text>
      <List.Item
        title="Ostatnie karmienie"
        description={
          animal.feeding?.lastFed
            ? new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')
            : 'Nigdy nie karmione'
        }
        left={() => <List.Icon icon="food-apple" />}
      />
      <List.Item
        title="Harmonogram"
        description={animal.feeding?.schedule || 'Nie określono'}
        left={() => <List.Icon icon="calendar-clock" />}
      />
      <List.Item
        title="Preferowany pokarm"
        description={animal.feeding?.foodType || 'Nie określono'}
        left={() => <List.Icon icon="bug" />}
      />

      {feedingHistory.length > 0 && (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleSmall" style={styles.subsectionTitle}>
            Ostatnie karmienia
          </Text>
          {feedingHistory.slice(0, 3).map((feeding, index) => (
            <List.Item
              key={feeding.id}
              title={`${feeding.foodType} × ${feeding.quantity}`}
              description={new Date(feeding.date).toLocaleDateString('pl-PL')}
              left={() => <List.Icon icon="circle-small" />}
            />
          ))}
          {feedingHistory.length > 3 && (
            <Button
              mode="text"
              onPress={onShowHistory}
              style={styles.moreButton}
            >
              Zobacz wszystkie ({feedingHistory.length})
            </Button>
          )}
        </>
      )}
    </>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  moreButton: {
    alignSelf: 'flex-start',
  },
});

export default FeedingSection;
