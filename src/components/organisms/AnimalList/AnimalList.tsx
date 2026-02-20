import React, { useRef } from 'react';
import { ScrollView, RefreshControl, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import {Animal} from "../../../types";
import AnimalCard from "../../molecules/AnimalCard";

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
}

const AnimalsList: React.FC<AnimalsListProps> = ({
                                                     animals,
                                                     loading,
                                                     onRefresh,
                                                     onAnimalPress,
                                                     onScrollDirectionChange,
                                                     matingStatuses = {},
                                                     cocoonStatuses = {},
                                                     lastMoltDates = {}
                                                 }) => {
    const lastOffsetRef = useRef(0);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!onScrollDirectionChange) return;
        const currentOffset = e.nativeEvent.contentOffset.y;
        const scrollingDown = currentOffset > lastOffsetRef.current && currentOffset > 10;
        onScrollDirectionChange(scrollingDown);
        lastOffsetRef.current = currentOffset;
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
            {animals.map((animal, index) => (
                <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onPress={onAnimalPress}
                    matingStatus={matingStatuses[animal.id]}
                    cocoonStatus={cocoonStatuses[animal.id]}
                    lastMoltDate={lastMoltDates[animal.id]}
                    index={index}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
});

export default AnimalsList;