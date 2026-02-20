import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Card, Button, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useTheme } from "../../context/ThemeContext";
import { useAnimalQuery } from "../../api/animals";
import { useCocoonHistoryQuery, useUpdateCocoonStatusMutation } from "../../api/events";
import { Theme } from "../../styles/theme";
import { CocoonEvent } from "../../types/events";
import { Animal } from "../../types";

export default function CocoonDetailsScreen() {
    const { theme } = useTheme();
    const { t } = useAppTranslation('cocoons');
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { cocoonId, animalId } = route.params;

    const { data: animal } = useAnimalQuery(animalId);
    const { data: cocoonHistoryData = [], isLoading: loading } = useCocoonHistoryQuery(animalId, 20);
    const updateCocoonStatusMutation = useUpdateCocoonStatusMutation();

    const cocoon = cocoonHistoryData.find(c => c.id === cocoonId) ?? null;

    const getDaysSinceLaid = (date: string): number => {
        const laid = new Date(date);
        const today = new Date();
        const diffTime = today.getTime() - laid.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysUntilHatch = (estimatedHatchDate?: string): number | null => {
        if (!estimatedHatchDate) return null;
        const today = new Date();
        const hatchDate = new Date(estimatedHatchDate);
        const diffTime = hatchDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getWeeksSinceLaid = (date: string): number => {
        const days = getDaysSinceLaid(date);
        return Math.floor(days / 7);
    };

    const handleOpenCocoon = () => {
        navigation.navigate('OpenCocoon', {
            cocoonId,
            animalId,
            animalName: animal?.name,
            species: animal?.species,
        });
    };

    const handleMarkAsFailed = () => {
        Alert.alert(
            t('details.markAsFailedTitle'),
            t('details.markAsFailedMessage'),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('details.markAsFailedConfirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateCocoonStatusMutation.mutateAsync({ eventId: cocoonId, newStatus: 'failed' });
                            Alert.alert('OK', t('details.markAsFailedSuccess'));
                            navigation.goBack();
                        } catch {
                            Alert.alert(t('common:error'), t('details.statusUpdateError'));
                        }
                    }
                }
            ]
        );
    };

    const handleChangeToIncubating = async () => {
        try {
            const result = await updateCocoonStatusMutation.mutateAsync({ eventId: cocoonId, newStatus: 'incubating' });
        } catch {
            Alert.alert(t('common:error'), t('details.statusUpdateError'));
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title={t('details.title')} />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    if (!cocoon) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title={t('details.title')} />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <Text>{t('details.notFound')}</Text>
                </View>
            </View>
        );
    }

    const daysSinceLaid = getDaysSinceLaid(cocoon.date);
    const weeksSinceLaid = getWeeksSinceLaid(cocoon.date);
    const daysUntilHatch = getDaysUntilHatch(cocoon.eventData?.estimatedHatchDate);

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('details.title')} />
            </Appbar.Header>

            <ScrollView style={styles.content}>
                {/* Informacje o samicy */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            {t('details.femaleSection')}
                        </Text>
                        <Text variant="headlineSmall" style={styles.animalName}>
                            {animal?.name || t('details.unknownFemale')}
                        </Text>
                        <Text variant="bodyLarge" style={styles.speciesName}>
                            {animal?.species || ''}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Status kokonu */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            {t('details.statusSection')}
                        </Text>

                        <View style={styles.statusContainer}>
                            {cocoon.eventData?.cocoonStatus === 'laid' && (
                                <Chip icon="egg" style={styles.statusChip} textStyle={styles.statusChipText}>
                                    {t('details.statusLaid')}
                                </Chip>
                            )}
                            {cocoon.eventData?.cocoonStatus === 'incubating' && (
                                <Chip icon="thermometer" style={styles.incubatingChip} textStyle={styles.incubatingChipText}>
                                    {t('details.statusIncubating')}
                                </Chip>
                            )}
                        </View>

                        {cocoon.eventData?.cocoonStatus === 'laid' && (
                            <Button
                                mode="outlined"
                                onPress={handleChangeToIncubating}
                                style={styles.statusButton}
                                icon="thermometer"
                            >
                                {t('details.changeToIncubating')}
                            </Button>
                        )}
                    </Card.Content>
                </Card>

                {/* Daty i czas */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            {t('details.scheduleSection')}
                        </Text>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium" style={styles.infoLabel}>
                                {t('details.layDate')}
                            </Text>
                            <Text variant="bodyLarge" style={styles.infoValue}>
                                {new Date(cocoon.date).toLocaleDateString('pl-PL')}
                            </Text>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium" style={styles.infoLabel}>
                                {t('details.daysSinceLaid')}
                            </Text>
                            <Text variant="headlineMedium" style={styles.daysValue}>
                                {daysSinceLaid}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium" style={styles.infoLabel}>
                                {t('details.weeksSinceLaid')}
                            </Text>
                            <Text variant="titleLarge" style={styles.weeksValue}>
                                {weeksSinceLaid}
                            </Text>
                        </View>

                        {cocoon.eventData?.estimatedHatchDate && (
                            <>
                                <Divider style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <Text variant="bodyMedium" style={styles.infoLabel}>
                                        {t('details.expectedHatch')}
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.infoValue}>
                                        {new Date(cocoon.eventData.estimatedHatchDate).toLocaleDateString('pl-PL')}
                                    </Text>
                                </View>

                                {daysUntilHatch !== null && (
                                    <View style={styles.infoRow}>
                                        <Text variant="bodyMedium" style={styles.infoLabel}>
                                            {t('details.daysRemaining')}
                                        </Text>
                                        <Text variant="headlineMedium" style={[
                                            styles.daysValue,
                                            daysUntilHatch <= 0 && styles.overdueValue,
                                            daysUntilHatch > 0 && daysUntilHatch <= 7 && styles.urgentValue,
                                        ]}>
                                            {daysUntilHatch <= 0 ? t('details.deadlinePassed') : daysUntilHatch}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </Card.Content>
                </Card>

                {/* Notatki */}
                {cocoon.description && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                {t('details.notesSection')}
                            </Text>
                            <Text variant="bodyMedium" style={styles.notesText}>
                                {cocoon.description}
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Przyciski akcji */}
                <View style={styles.actionsContainer}>
                    <Button
                        mode="contained"
                        onPress={handleOpenCocoon}
                        icon="egg-easter"
                        style={styles.openButton}
                        contentStyle={styles.openButtonContent}
                    >
                        {t('details.openCocoon')}
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={handleMarkAsFailed}
                        icon="close-circle"
                        textColor={theme.colors.error}
                        style={styles.failButton}
                    >
                        {t('details.markAsFailed')}
                    </Button>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    card: {
        margin: 16,
        marginBottom: 0,
        backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 12,
    },
    animalName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    speciesName: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statusChip: {
        backgroundColor: theme.colors.events.cocoon.background,
    },
    statusChipText: {
        color: theme.colors.events.cocoon.color,
    },
    incubatingChip: {
        backgroundColor: theme.colors.primaryContainer,
    },
    incubatingChipText: {
        color: theme.colors.primary,
    },
    statusButton: {
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        color: theme.colors.onSurfaceVariant,
    },
    infoValue: {
        color: theme.colors.onSurface,
        fontWeight: '500',
    },
    daysValue: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    weeksValue: {
        color: theme.colors.primary,
    },
    urgentValue: {
        color: theme.colors.warning,
    },
    overdueValue: {
        color: theme.colors.error,
    },
    divider: {
        marginVertical: 8,
    },
    notesText: {
        color: theme.colors.onSurface,
        lineHeight: 22,
    },
    actionsContainer: {
        padding: 16,
        gap: 12,
    },
    openButton: {
        backgroundColor: theme.colors.events.cocoon.color,
    },
    openButtonContent: {
        paddingVertical: 8,
    },
    failButton: {
        borderColor: theme.colors.error,
    },
    bottomSpacer: {
        height: 24,
    },
});