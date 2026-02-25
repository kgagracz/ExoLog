// src/components/molecules/MoltingHistoryCard.tsx

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import { useAppTranslation } from '../../hooks/useAppTranslation';
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
    const { t } = useAppTranslation('animals');
    const styles = makeStyles(theme);
    const { previousStage, newStage, previousBodyLength, newBodyLength } = molting.eventData;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const hasStage = previousStage != null && newStage != null;
    const hasBodyLength = previousBodyLength != null && newBodyLength != null;
    const hasOnlyNewBodyLength = previousBodyLength == null && newBodyLength != null;

    const growthDiff = hasBodyLength ? newBodyLength - previousBodyLength : null;
    const growthPercent = hasBodyLength && previousBodyLength > 0
        ? Math.round(((newBodyLength - previousBodyLength) / previousBodyLength) * 100)
        : null;

    return (
        <View style={styles.card}>
            <View style={styles.accentBar} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {hasStage ? (
                            <View style={styles.stageRow}>
                                <View style={styles.stageBadge}>
                                    <Text style={styles.stageBadgeText}>L{previousStage}</Text>
                                </View>
                                <Text style={styles.stageArrow}>→</Text>
                                <View style={[styles.stageBadge, styles.stageBadgeNew]}>
                                    <Text style={[styles.stageBadgeText, styles.stageBadgeNewText]}>L{newStage}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.title}>{t('moltingHistory.moltLabelFallback')}</Text>
                        )}
                        <Text style={styles.date}>{formatDate(molting.date)}</Text>
                    </View>
                    {onDelete && (
                        <IconButton
                            icon="delete-outline"
                            size={18}
                            onPress={onDelete}
                            iconColor={theme.colors.onSurfaceVariant}
                            style={styles.deleteButton}
                        />
                    )}
                </View>

                {(hasBodyLength || hasOnlyNewBodyLength) && (
                    <View style={styles.bodyLengthSection}>
                        <Text style={styles.bodyLengthIcon}>📏</Text>
                        {hasBodyLength ? (
                            <View style={styles.bodyLengthContent}>
                                <Text style={styles.bodyLengthText}>
                                    {previousBodyLength} cm → {newBodyLength} cm
                                </Text>
                                {growthDiff != null && growthDiff > 0 && (
                                    <View style={styles.growthBadge}>
                                        <Text style={styles.growthBadgeText}>
                                            +{growthDiff.toFixed(1)} cm ({growthPercent}%)
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Text style={styles.bodyLengthText}>{newBodyLength} cm</Text>
                        )}
                    </View>
                )}

                {molting.description && (
                    <Text style={styles.notes} numberOfLines={2}>
                        {molting.description}
                    </Text>
                )}
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 1,
    },
    accentBar: {
        width: 4,
        backgroundColor: theme.colors.events.molting.color,
    },
    content: {
        flex: 1,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    stageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    stageBadge: {
        backgroundColor: theme.colors.events.molting.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stageBadgeNew: {
        backgroundColor: theme.colors.events.molting.color,
    },
    stageBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.events.molting.color,
    },
    stageBadgeNewText: {
        color: '#fff',
    },
    stageArrow: {
        fontSize: 16,
        color: theme.colors.onSurfaceVariant,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: theme.colors.onSurfaceVariant,
        marginTop: 2,
    },
    deleteButton: {
        margin: -8,
    },
    bodyLengthSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border || theme.colors.onSurfaceVariant + '20',
    },
    bodyLengthIcon: {
        fontSize: 14,
    },
    bodyLengthContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    bodyLengthText: {
        fontSize: 13,
        color: theme.colors.onSurface,
    },
    growthBadge: {
        backgroundColor: theme.colors.successContainer,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    growthBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.success,
    },
    notes: {
        fontSize: 12,
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
        marginTop: 8,
    },
});
