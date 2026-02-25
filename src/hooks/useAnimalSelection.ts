import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useDeleteMultipleAnimalsMutation } from '../api/animals';
import { useAppTranslation } from './useAppTranslation';
import { Animal } from '../types';

export function useAnimalSelection(visibleAnimals: Animal[]) {
    const { t } = useAppTranslation('animals');
    const deleteMultipleMutation = useDeleteMultipleAnimalsMutation();

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const enterSelection = useCallback(() => setSelectionMode(true), []);

    const exitSelection = useCallback(() => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    }, []);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(visibleAnimals.map(a => a.id)));
    }, [visibleAnimals]);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const allSelected = selectedIds.size === visibleAnimals.length && visibleAnimals.length > 0;

    const confirmDeleteSelected = useCallback((onDeleted?: () => void) => {
        if (selectedIds.size === 0) return;

        Alert.alert(
            t('list.deleteSelectedTitle'),
            t('list.deleteSelectedMessage', { count: selectedIds.size }),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('common:delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMultipleMutation.mutate([...selectedIds], {
                            onSuccess: () => {
                                setSelectionMode(false);
                                setSelectedIds(new Set());
                                onDeleted?.();
                            },
                        });
                    },
                },
            ],
        );
    }, [selectedIds, t, deleteMultipleMutation]);

    return {
        selectionMode,
        selectedIds,
        enterSelection,
        exitSelection,
        toggleSelect,
        selectAll,
        deselectAll,
        allSelected,
        confirmDeleteSelected,
        deleteMultipleMutation,
    };
}
