import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Card, Button, TextInput, HelperText, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import { useAddMultipleSpidersMutation } from "../../api/animals";
import { useUpdateCocoonStatusMutation } from "../../api/events";
import { Theme } from "../../styles/theme";

export default function OpenCocoonScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { cocoonId, animalId, animalName, species } = route.params;

    const updateCocoonStatusMutation = useUpdateCocoonStatusMutation();
    const addMultipleSpidersMutation = useAddMultipleSpidersMutation();

    const [spiderCount, setSpiderCount] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const validateCount = (value: string): boolean => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 1) {
            setError('Wprowadź prawidłową liczbę (minimum 1)');
            return false;
        }
        if (num > 2000) {
            setError('Maksymalna liczba młodych to 2000');
            return false;
        }
        setError('');
        return true;
    };

    const handleCountChange = (value: string) => {
        // Tylko cyfry
        const numericValue = value.replace(/[^0-9]/g, '');
        setSpiderCount(numericValue);
        if (numericValue) {
            validateCount(numericValue);
        } else {
            setError('');
        }
    };

    const handleOpenCocoon = async () => {
        if (!validateCount(spiderCount)) {
            return;
        }

        const count = parseInt(spiderCount, 10);

        Alert.alert(
            'Potwierdź otwarcie kokonu',
            `Czy na pewno chcesz otworzyć kokon i dodać ${count} młodych pająków?\n\nZostaną dodane jako "${species || 'Nieznany'} L1 #001" itd.`,
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Otwórz i dodaj',
                    onPress: handleConfirmOpen,
                }
            ]
        );
    };

    const handleConfirmOpen = async () => {
        const count = parseInt(spiderCount, 10);
        setSaving(true);

        try {
            // 1. Zaktualizuj status kokonu na "hatched"
            await updateCocoonStatusMutation.mutateAsync({ eventId: cocoonId, newStatus: 'hatched', hatchedCount: count });

            // 2. Dodaj młode pająki do systemu
            const nameGenerator = (index: number, total: number): string => {
                const padLength = total >= 100 ? 3 : total >= 10 ? 2 : 1;
                const paddedIndex = String(index).padStart(padLength, '0');
                return `${species || 'Nieznany'} #${paddedIndex}`;
            };

            const result = await addMultipleSpidersMutation.mutateAsync({
                baseData: {
                    species: species || 'Nieznany gatunek',
                    sex: 'unknown',
                    currentStage: 1,
                    //@ts-ignore
                    stage: 1,
                    notes: `Potomstwo z kokonu. Matka: ${animalName || 'Nieznana'}`,
                    parentFemaleId: animalId,
                    cocoonId: cocoonId,
                },
                quantity: count,
                nameGenerator,
            });

            if (result.added === count) {
                Alert.alert(
                    '🎉 Sukces!',
                    `Kokon został otwarty.\nDodano ${result.added} młodych pająków do hodowli.`,
                    [{
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('CocoonsList');
                        }
                    }]
                );
            } else if (result.added > 0) {
                Alert.alert(
                    'Częściowy sukces',
                    `Dodano ${result.added} z ${count} pająków.\n\nBłędy: ${result.failed}`,
                    [{ text: 'OK', onPress: () => navigation.navigate('CocoonsList') }]
                );
            } else {
                Alert.alert('Błąd', 'Nie udało się dodać żadnego pająka.');
            }
        } catch (error: any) {
            console.error('Error opening cocoon:', error);
            Alert.alert('Błąd', error.message || 'Nie udało się otworzyć kokonu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Otwórz kokon" />
            </Appbar.Header>

            <ScrollView style={styles.content}>
                {/* Informacje o kokonie */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            🥚 Kokon
                        </Text>
                        <Text variant="bodyLarge" style={styles.animalName}>
                            {animalName || 'Nieznana samica'}
                        </Text>
                        <Text variant="bodyMedium" style={styles.speciesName}>
                            {species || 'Nieznany gatunek'}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Formularz */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            🐣 Ilość młodych
                        </Text>

                        <Text variant="bodyMedium" style={styles.description}>
                            Podaj liczbę młodych pająków, które wykluwają się z kokonu.
                            Zostaną automatycznie dodane do Twojej hodowli jako L1.
                        </Text>

                        <TextInput
                            label="Liczba młodych"
                            value={spiderCount}
                            onChangeText={handleCountChange}
                            keyboardType="number-pad"
                            mode="outlined"
                            style={styles.input}
                            error={!!error}
                            left={<TextInput.Icon icon="spider" />}
                            placeholder="np. 150"
                        />

                        {error ? (
                            <HelperText type="error" visible={!!error}>
                                {error}
                            </HelperText>
                        ) : (
                            <HelperText type="info" visible={!!spiderCount && !error}>
                                Zostanie dodanych {spiderCount} pająków o nazwie "{species || 'Nieznany'} L1 #001" itd.
                            </HelperText>
                        )}
                    </Card.Content>
                </Card>

                {/* Podsumowanie */}
                {spiderCount && !error && (
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                📋 Podsumowanie
                            </Text>

                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium" style={styles.summaryLabel}>
                                    Liczba młodych:
                                </Text>
                                <Text variant="titleLarge" style={styles.summaryValue}>
                                    {spiderCount}
                                </Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium" style={styles.summaryLabel}>
                                    Stadium:
                                </Text>
                                <Text variant="bodyLarge" style={styles.summaryValue}>
                                    L1 (baby)
                                </Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium" style={styles.summaryLabel}>
                                    Nazwa:
                                </Text>
                                <Text variant="bodyLarge" style={styles.summaryValue}>
                                    {species || 'Nieznany'} L1 #001...
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Przycisk */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleOpenCocoon}
                        disabled={!spiderCount || !!error || saving}
                        loading={saving}
                        icon="egg-easter"
                        style={styles.openButton}
                        contentStyle={styles.openButtonContent}
                    >
                        {saving ? 'Dodawanie pająków...' : 'Otwórz kokon i dodaj młode'}
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        disabled={saving}
                        style={styles.cancelButton}
                    >
                        Anuluj
                    </Button>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {saving && (
                <View style={styles.savingOverlay}>
                    <Card style={styles.savingCard}>
                        <Card.Content style={styles.savingContent}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text variant="titleMedium" style={styles.savingText}>
                                Dodawanie {spiderCount} pająków...
                            </Text>
                            <Text variant="bodySmall" style={styles.savingSubtext}>
                                To może chwilę potrwać
                            </Text>
                        </Card.Content>
                    </Card>
                </View>
            )}
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    card: {
        margin: 16,
        marginBottom: 0,
        backgroundColor: theme.colors.surface,
    },
    summaryCard: {
        margin: 16,
        marginBottom: 0,
        backgroundColor: theme.colors.successContainer,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 12,
    },
    animalName: {
        fontWeight: '600',
        color: theme.colors.onSurface,
    },
    speciesName: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    description: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: 16,
        lineHeight: 22,
    },
    input: {
        backgroundColor: theme.colors.background,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
        color: theme.colors.success,
        fontWeight: '600',
    },
    buttonContainer: {
        padding: 16,
        gap: 12,
    },
    openButton: {
        backgroundColor: theme.colors.events.cocoon.color,
    },
    openButtonContent: {
        paddingVertical: 8,
    },
    cancelButton: {
        borderColor: theme.colors.border,
    },
    bottomSpacer: {
        height: 24,
    },
    savingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    savingCard: {
        width: '100%',
        maxWidth: 300,
    },
    savingContent: {
        alignItems: 'center',
        padding: 24,
    },
    savingText: {
        marginTop: 16,
        color: theme.colors.onSurface,
    },
    savingSubtext: {
        marginTop: 8,
        color: theme.colors.onSurfaceVariant,
    },
});