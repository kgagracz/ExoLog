// src/components/molecules/MoltingHistoryCard.tsx

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Chip, IconButton, Text} from 'react-native-paper';
import {MoltingEvent} from "../../types/events";
import {useTheme} from "../../context/ThemeContext";
import {Theme} from "../../styles/theme";


interface MoltingHistoryCardProps {
    molting: MoltingEvent;
    onDelete?: () => void;
}

export default function MoltingHistoryCard({
                                               molting,
                                               onDelete
                                           }: MoltingHistoryCardProps) {
    const {theme} = useTheme();
    const styles = makeStyles(theme);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const calculateGrowth = (): string | null => {
        const prevLength = molting.eventData.previousBodyLength;
        const newLength = molting.eventData.newBodyLength;

        if (!prevLength || !newLength) return null;

        const growth = newLength - prevLength;
        const percentage = (growth / prevLength) * 100;
        return `+${growth.toFixed(1)}cm (${percentage.toFixed(0)}%)`;
    };

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text variant="titleMedium" style={styles.title}>
                            {molting.title || `L${molting.eventData.previousStage} → L${molting.eventData.newStage}`}
                        </Text>
                        <Text variant="bodySmall" style={styles.date}>
                            {formatDate(molting.date)}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {onDelete && (
                            <IconButton
                                icon="delete"
                                size={20}
                                onPress={onDelete}
                                iconColor={theme.colors.error}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.infoRow}>
                    {calculateGrowth() && (
                        <Chip
                            mode="outlined"
                            compact
                            icon="ruler"
                            style={styles.growthChip}
                        >
                            {calculateGrowth()}
                        </Chip>
                    )}
                </View>

                {molting.description && (
                    <Text variant="bodySmall" style={styles.notes} numberOfLines={2}>
                        {molting.description}
                    </Text>
                )}
            </Card.Content>
        </Card>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: theme.colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    date: {
        color: theme.colors.onSurfaceVariant,
    },
    chip: {
        height: 28,
    },
    chipText: {
        fontSize: 12,
    },
    successChip: {
        backgroundColor: theme.colors.successContainer,
    },
    failChip: {
        backgroundColor: theme.colors.errorContainer,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    categoryChip: {
        height: 28,
    },
    growthChip: {
        height: 28,
    },
    notes: {
        color: theme.colors.onSurfaceVariant,
        marginTop: 8,
        fontStyle: 'italic',
    },
});

// ## 6. Zaktualizuj indeksy Firestore
//
// W Firebase Console utwórz następujące indeksy:

// Collection: events
// Index 1:
// - animalId (Ascending)
// - eventTypeId (Ascending)
// - date (Descending)
//
// Index 2:
// - userId (Ascending)
// - eventTypeId (Ascending)
// - date (Descending)
//
// Index 3:
// - animalId (Ascending)
// - date (Descending)