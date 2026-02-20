import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
    Text,
    Appbar,
    Checkbox,
    Button,
    List,
    Divider,
    ActivityIndicator,
    Chip, SegmentedButtons
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppTranslation } from '../hooks/useAppTranslation';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from "../context/ThemeContext";
import { useAnimalsQuery } from "../api/animals";
import { Theme } from "../styles/theme";
import { Animal } from "../types";

export default function QRPrintScreen() {
    const { t } = useAppTranslation('scanner');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const { data: animals = [], isLoading: loading } = useAnimalsQuery();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [generating, setGenerating] = useState(false);

    // Domyślnie zaznacz wszystkie
    useEffect(() => {
        if (animals.length > 0) {
            setSelectedIds(new Set(animals.map(a => a.id)));
        }
    }, [animals]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(animals.map(a => a.id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const generateQRHtml = (selectedAnimals: Animal[]): string => {
        const qrCards = selectedAnimals.map(animal => {
            const qrValue = `exolog:animal:${animal.id}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrValue)}`;

            return `
                <div class="qr-card">
                    <img src="${qrUrl}" alt="QR Code" class="qr-image" />
                    <div class="animal-name">${animal.name || t('qrPrint.noName')}</div>
                    <div class="animal-species">${animal.species || ''}</div>
                </div>
            `;
        }).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t('qrPrint.htmlTitleTag')}</title>
                <style>
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 10mm;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 10mm;
                        padding-bottom: 5mm;
                        border-bottom: 1px solid #ccc;
                    }
                    .header h1 {
                        font-size: 18pt;
                        color: #333;
                    }
                    .header p {
                        font-size: 10pt;
                        color: #666;
                        margin-top: 2mm;
                    }
                    .qr-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 5mm;
                        justify-content: flex-start;
                    }
                    .qr-card {
                        width: 45mm;
                        padding: 3mm;
                        border: 1px solid #ddd;
                        border-radius: 2mm;
                        text-align: center;
                        page-break-inside: avoid;
                        background: #fafafa;
                    }
                    .qr-image {
                        width: 35mm;
                        height: 35mm;
                    }
                    .animal-name {
                        font-size: 10pt;
                        font-weight: bold;
                        margin-top: 2mm;
                        color: #333;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .animal-species {
                        font-size: 8pt;
                        color: #666;
                        font-style: italic;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    @media print {
                        body {
                            padding: 5mm;
                        }
                        .header {
                            margin-bottom: 5mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${t('qrPrint.htmlTitle')}</h1>
                    <p>${t('qrPrint.htmlSubtitle')}</p>
                </div>
                <div class="qr-grid">
                    ${qrCards}
                </div>
            </body>
            </html>
        `;
    };

    const handlePrint = async () => {
        if (selectedIds.size === 0) {
            Alert.alert(t('qrPrint.noSelection'), t('qrPrint.noSelectionMessage'));
            return;
        }

        setGenerating(true);

        try {
            const selectedAnimals = animals.filter(a => selectedIds.has(a.id));
            const html = generateQRHtml(selectedAnimals);

            await Print.printAsync({
                html,
                orientation: Print.Orientation.portrait,
            });
        } catch (error) {
            console.error('Error printing:', error);
            Alert.alert(t('common:error'), t('qrPrint.printError'));
        } finally {
            setGenerating(false);
        }
    };

    const handleSharePdf = async () => {
        if (selectedIds.size === 0) {
            Alert.alert(t('qrPrint.noSelection'), t('qrPrint.noSelectionMessage'));
            return;
        }

        setGenerating(true);

        try {
            const selectedAnimals = animals.filter(a => selectedIds.has(a.id));
            const html = generateQRHtml(selectedAnimals);

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: t('qrPrint.shareTitle'),
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert(t('qrPrint.sharingUnavailable'), t('qrPrint.sharingUnavailableMessage'));
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            Alert.alert(t('common:error'), t('qrPrint.pdfError'));
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title={t('qrPrint.title')} />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={t('qrPrint.title')} />
            </Appbar.Header>

            <View style={styles.content}>
                {/* Podsumowanie i przyciski wyboru */}
                <View style={styles.summaryBar}>
                    <Chip
                        icon="check-circle"
                        style={styles.summaryChip}
                        textStyle={styles.summaryChipText}
                    >
                        {selectedIds.size} / {animals.length}
                    </Chip>
                    <SegmentedButtons
                        multiSelect={false}
                        value={selectedIds.size === animals.length ? 'all' : selectedIds.size === 0 ? 'none' : 'partial'}
                        onValueChange={(value) => {
                            if (value === 'all') selectAll();
                            else if (value === 'none') deselectAll();
                        }}
                        buttons={[
                            { value: 'all', label: t('qrPrint.selectAll'), icon: 'checkbox-multiple-marked' },
                            { value: 'none', label: t('qrPrint.selectNone'), icon: 'checkbox-multiple-blank-outline' },
                        ]}
                        style={styles.segmentedButtons}
                    />
                </View>

                <Divider />

                {/* Lista zwierząt */}
                <ScrollView style={styles.list}>
                    {animals.map(animal => (
                        <List.Item
                            key={animal.id}
                            title={animal.name || t('qrPrint.noName')}
                            description={animal.species}
                            titleStyle={styles.listItemTitle}
                            descriptionStyle={styles.listItemDescription}
                            left={() => (
                                <Checkbox
                                    status={selectedIds.has(animal.id) ? 'checked' : 'unchecked'}
                                    onPress={() => toggleSelection(animal.id)}
                                    color={theme.colors.primary}
                                />
                            )}
                            onPress={() => toggleSelection(animal.id)}
                            style={[
                                styles.listItem,
                                selectedIds.has(animal.id) && styles.listItemSelected
                            ]}
                        />
                    ))}
                </ScrollView>

                {/* Przyciski akcji */}
                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={handleSharePdf}
                        icon="share-variant"
                        style={styles.actionButton}
                        disabled={generating || selectedIds.size === 0}
                        loading={generating}
                    >
                        {t('qrPrint.savePdf')}
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handlePrint}
                        icon="printer"
                        style={styles.actionButton}
                        disabled={generating || selectedIds.size === 0}
                        loading={generating}
                    >
                        {t('qrPrint.print')}
                    </Button>
                </View>
            </View>
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
    summaryBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.surfaceLight,
    },
    summaryChip: {
        backgroundColor: theme.colors.primaryContainer,
    },
    summaryChipText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    segmentedButtons: {
        maxWidth: 220,
    },
    list: {
        flex: 1,
    },
    listItem: {
        paddingVertical: 4,
    },
    listItemTitle: {
        color: theme.colors.onSurface,
        fontWeight: '500',
    },
    listItemDescription: {
        color: theme.colors.primary,
        fontStyle: 'italic',
    },
    listItemSelected: {
        backgroundColor: theme.colors.primaryContainer + '30',
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    actionButton: {
        flex: 1,
    },
});