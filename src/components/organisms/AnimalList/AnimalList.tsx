import React from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
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
    matingStatuses?: Record<string, MatingStatus>;
    cocoonStatuses?: Record<string, CocoonStatus>;
    lastMoltDates?: Record<string, string>;
}

const AnimalsList: React.FC<AnimalsListProps> = ({
                                                     animals,
                                                     loading,
                                                     onRefresh,
                                                     onAnimalPress,
                                                     matingStatuses = {},
                                                     cocoonStatuses = {},
                                                     lastMoltDates = {}
                                                 }) => {
    return (
        <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
        >
            {animals.map((animal) => (
                <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onPress={onAnimalPress}
                    matingStatus={matingStatuses[animal.id]}
                    cocoonStatus={cocoonStatuses[animal.id]}
                    lastMoltDate={lastMoltDates[animal.id]}
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