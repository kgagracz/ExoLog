import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, List, Divider, Button } from 'react-native-paper';
import { useAppTranslation } from '../../hooks/useAppTranslation';
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
  const { t } = useAppTranslation('animals');
  const styles = makeStyles(theme);

  return (
    <>
      <List.Item
        title={t('addFeeding.lastFeeding')}
        description={
          animal.feeding?.lastFed
            ? new Date(animal.feeding.lastFed).toLocaleDateString('pl-PL')
            : t('addFeeding.neverFed')
        }
        left={() => <List.Icon icon="food-apple" />}
      />
      <List.Item
        title={t('forms:spider.feedingScheduleLabel')}
        description={animal.feeding?.schedule || t('addFeeding.neverFed')}
        left={() => <List.Icon icon="calendar-clock" />}
      />
      <List.Item
        title={t('details.feeding')}
        description={animal.feeding?.foodType || t('addFeeding.neverFed')}
        left={() => <List.Icon icon="bug" />}
      />

      {feedingHistory.length > 0 && (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleSmall" style={styles.subsectionTitle}>
            {t('addFeeding.lastFeeding')}
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
