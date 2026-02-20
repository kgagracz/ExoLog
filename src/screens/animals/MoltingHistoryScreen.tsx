// src/components/molecules/MoltingHistoryCard.tsx

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Chip, IconButton, Text} from 'react-native-paper';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import {MoltingEvent, MoltingEventData} from "../../types/events";
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
    const { t } = useAppTranslation('animals');
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

    const getMoltingStepLabel = ({
        previousStage,
        newStage,
        previousBodyLength,
        newBodyLength,
                                 }: MoltingEventData) => {
        const stageLabel = (previousStage && newStage) ? `L${previousStage} → L${newStage}` : ''
        const bodyLengthLabel = (previousBodyLength && newBodyLength) ? `${previousBodyLength}DC → ${newBodyLength}DC` : ''

        return t('moltingHistory.moltLabel', { stageLabel, bodyLengthLabel })
    }

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text variant="titleMedium" style={styles.title}>
                            {getMoltingStepLabel(molting.eventData)}
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
