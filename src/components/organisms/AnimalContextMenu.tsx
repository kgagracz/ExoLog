import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Dialog, Divider, List, Portal } from 'react-native-paper';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useTheme } from '../../context/ThemeContext';
import { useDeleteAnimalMutation, useMarkDeceasedMutation } from '../../api/animals';
import { Animal } from '../../types';
import { Theme } from '../../styles/theme';

interface AnimalContextMenuProps {
    animal: Animal | null;
    visible: boolean;
    onDismiss: () => void;
    navigation: any;
}

const AnimalContextMenu: React.FC<AnimalContextMenuProps> = ({ animal, visible, onDismiss, navigation }) => {
    const { t } = useAppTranslation('animals');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const deleteAnimalMutation = useDeleteAnimalMutation();
    const markDeceasedMutation = useMarkDeceasedMutation();
    const [deceasedLoading, setDeceasedLoading] = useState(false);

    if (!animal) return null;

    const navigate = (screen: string, params?: Record<string, any>) => {
        onDismiss();
        navigation.navigate(screen, params);
    };

    const handleEdit = () => navigate('EditAnimal', { animalId: animal.id });
    const handleFeed = () => navigate('AddFeeding', { preSelectedAnimal: animal.id });
    const handleFeedingHistory = () => navigate('FeedingHistory', { animalId: animal.id });
    const handleMolting = () => navigate('AddMolting', { animalId: animal.id });

    const handleMating = () => {
        onDismiss();
        if (animal.sex === 'unknown') {
            Alert.alert(t('details.unknownSexTitle'), t('details.unknownSexMessage'));
            return;
        }
        navigation.navigate('AddMating', { animalId: animal.id });
    };

    const handleCocoon = () => {
        onDismiss();
        if (animal.sex !== 'female') {
            Alert.alert(t('details.onlyFemalesTitle'), t('details.onlyFemalesMessage'));
            return;
        }
        navigation.navigate('AddCocoon', { animalId: animal.id });
    };

    const handlePhotos = () => navigate('AnimalPhotos', {
        animalId: animal.id,
        animalName: animal.name || t('details.animalFallback'),
    });

    const handleMarkDeceased = () => {
        onDismiss();
        Alert.alert(
            t('details.deceasedTitle'),
            t('details.deceasedMessage', { name: animal.name }),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('details.markDeceased'),
                    style: 'destructive',
                    onPress: async () => {
                        setDeceasedLoading(true);
                        try {
                            await markDeceasedMutation.mutateAsync({ animalId: animal.id });
                        } finally {
                            setDeceasedLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const handleDelete = () => {
        onDismiss();
        Alert.alert(
            t('details.deleteTitle'),
            t('details.deleteMessage', { name: animal.name }),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('common:delete'),
                    style: 'destructive',
                    onPress: () => deleteAnimalMutation.mutate(animal.id),
                },
            ],
        );
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={deceasedLoading ? undefined : onDismiss} style={styles.dialog}>
                <Dialog.Title style={styles.title}>{animal.name}</Dialog.Title>
                {deceasedLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                <Dialog.ScrollArea style={styles.scrollArea}>
                    <View>
                        <List.Item title={t('common:edit')} left={props => <List.Icon {...props} icon="pencil" />} onPress={handleEdit} />
                        <List.Item title={t('details.fabFeeding')} left={props => <List.Icon {...props} icon="food-apple" />} onPress={handleFeed} />
                        <List.Item title={t('details.feedingHistory')} left={props => <List.Icon {...props} icon="history" />} onPress={handleFeedingHistory} />
                        <List.Item title={t('details.fabMolting')} left={props => <List.Icon {...props} icon="sync" />} onPress={handleMolting} />
                        <List.Item title={t('details.fabMating')} left={props => <List.Icon {...props} icon="heart" />} onPress={handleMating} />
                        {animal.sex === 'female' && (
                            <List.Item title={t('details.fabCocoon')} left={props => <List.Icon {...props} icon="egg" />} onPress={handleCocoon} />
                        )}
                        <List.Item title={t('details.fabPhoto')} left={props => <List.Icon {...props} icon="camera" />} onPress={handlePhotos} />
                        <Divider />
                        <List.Item
                            title={t('details.deceasedTitle')}
                            left={props => <List.Icon {...props} icon="skull" color={theme.colors.textSecondary} />}
                            titleStyle={styles.deceasedText}
                            onPress={handleMarkDeceased}
                        />
                        <List.Item
                            title={t('details.deleteTitle')}
                            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
                            titleStyle={styles.deleteText}
                            onPress={handleDelete}
                        />
                    </View>
                </Dialog.ScrollArea>
                )}
            </Dialog>
        </Portal>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    dialog: {
        maxHeight: '80%',
    },
    title: {
        fontSize: 18,
    },
    scrollArea: {
        paddingHorizontal: 0,
    },
    deceasedText: {
        color: theme.colors.textSecondary,
    },
    deleteText: {
        color: theme.colors.error,
    },
    loadingContainer: {
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AnimalContextMenu;
