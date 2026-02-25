import React, { useRef } from 'react';
import { ScrollView, RefreshControl, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import {Animal, AnimalListItem, SpeciesGroup} from "../../../types";
import AnimalCard from "../../molecules/AnimalCard";
import SpeciesGroupCard from "../../molecules/SpeciesGroupCard";

interface MatingStatus {
    hasMating: boolean;
    lastMatingDate?: string;
    lastMatingResult?: string;
}

interface CocoonStatus {
    hasCocoon: boolean;
    lastCocoonDate?: string;
    cocoonStatus?: string;
}

interface AnimalsListProps {
    animals: Animal[];
    loading: boolean;
    onRefresh: () => void;
    onAnimalPress: (animal: Animal) => void;
    onScrollDirectionChange?: (hidden: boolean) => void;
    matingStatuses?: Record<string, MatingStatus>;
    cocoonStatuses?: Record<string, CocoonStatus>;
    lastMoltDates?: Record<string, string>;
    groupedItems?: AnimalListItem[];
    onGroupPress?: (species: string) => void;
    onGroupLongPress?: (group: SpeciesGroup) => void;
    selectionMode?: boolean;
    selectedIds?: Set<string>;
    onToggleSelect?: (id: string) => void;
    onAnimalLongPress?: (animal: Animal) => void;
    onAnimalMenuPress?: (animal: Animal) => void;
}

const AnimalsList: React.FC<AnimalsListProps> = ({
                                                     animals,
                                                     loading,
                                                     onRefresh,
                                                     onAnimalPress,
                                                     onScrollDirectionChange,
                                                     matingStatuses = {},
                                                     cocoonStatuses = {},
                                                     lastMoltDates = {},
                                                     groupedItems,
                                                     onGroupPress,
                                                     onGroupLongPress,
                                                     selectionMode,
                                                     selectedIds,
                                                     onToggleSelect,
                                                     onAnimalLongPress,
                                                     onAnimalMenuPress,
                                                 }) => {
    const lastOffsetRef = useRef(0);
    const directionAnchorRef = useRef(0);
    const isHiddenRef = useRef(false);

    const SCROLL_THRESHOLD = 20;

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!onScrollDirectionChange) return;
        const currentOffset = e.nativeEvent.contentOffset.y;
        const delta = currentOffset - directionAnchorRef.current;

        if (delta > SCROLL_THRESHOLD && currentOffset > 10 && !isHiddenRef.current) {
            isHiddenRef.current = true;
            onScrollDirectionChange(true);
            directionAnchorRef.current = currentOffset;
        } else if (delta < -SCROLL_THRESHOLD && isHiddenRef.current) {
            isHiddenRef.current = false;
            onScrollDirectionChange(false);
            directionAnchorRef.current = currentOffset;
        }

        lastOffsetRef.current = currentOffset;
    };

    const renderGroupedItems = () => {
        if (!groupedItems) return null;

        return groupedItems.map((item, index) => {
            if (item.type === 'group') {
                return (
                    <SpeciesGroupCard
                        key={`group-${item.species}`}
                        group={item}
                        onPress={onGroupPress ?? (() => {})}
                        onLongPress={onGroupLongPress}
                        index={index}
                    />
                );
            }
            return (
                <AnimalCard
                    key={item.animal.id}
                    animal={item.animal}
                    onPress={onAnimalPress}
                    onLongPress={onAnimalLongPress}
                    onMenuPress={onAnimalMenuPress}
                    matingStatus={matingStatuses[item.animal.id]}
                    cocoonStatus={cocoonStatuses[item.animal.id]}
                    lastMoltDate={lastMoltDates[item.animal.id]}
                    index={index}
                    selectable={selectionMode}
                    selected={selectedIds?.has(item.animal.id)}
                    onToggleSelect={onToggleSelect}
                />
            );
        });
    };

    return (
        <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
        >
            {groupedItems ? renderGroupedItems() : (
                animals.map((animal, index) => (
                    <AnimalCard
                        key={animal.id}
                        animal={animal}
                        onPress={onAnimalPress}
                        onLongPress={onAnimalLongPress}
                        onMenuPress={onAnimalMenuPress}
                        matingStatus={matingStatuses[animal.id]}
                        cocoonStatus={cocoonStatuses[animal.id]}
                        lastMoltDate={lastMoltDates[animal.id]}
                        index={index}
                        selectable={selectionMode}
                        selected={selectedIds?.has(animal.id)}
                        onToggleSelect={onToggleSelect}
                    />
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
});

export default AnimalsList;
