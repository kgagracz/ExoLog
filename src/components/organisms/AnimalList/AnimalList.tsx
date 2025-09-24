import React from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import {Animal} from "../../../types";
import AnimalCard from "../../molecules/AnimalCard";

interface AnimalsListProps {
  animals: Animal[];
  loading: boolean;
  onRefresh: () => void;
  onAnimalPress: (animal: Animal) => void;
}

const AnimalsList: React.FC<AnimalsListProps> = ({
                                                   animals,
                                                   loading,
                                                   onRefresh,
                                                   onAnimalPress
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