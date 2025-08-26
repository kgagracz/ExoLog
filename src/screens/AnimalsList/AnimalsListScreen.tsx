// screens/AnimalsList/AnimalsListScreen.tsx
import React, { useState } from 'react';
import {
    ListScreenLayout,
    SearchBar,
    AnimalList,
    LoadingState,
} from '../../components';
import { useAnimals } from '../../hooks';

// Typy
interface Animal {
    id: string;
    name: string;
    species: string;
    type: 'tarantula' | 'scorpion' | 'other';
    dateAdded: Date;
    eventsCount: number;
    age: number;
}

interface AnimalsListScreenProps {
    navigation?: any; // Dodaj właściwy typ nawigacji jeśli używasz React Navigation
}

const AnimalsListScreen: React.FC<AnimalsListScreenProps> = ({ navigation }) => {
    const {
        animals,
        loading,
        error,
        refresh,
        addNewAnimal,
        removeAnimal,
    } = useAnimals();

    const [searchText, setSearchText] = useState<string>('');

    const handleAddAnimal = async (): Promise<void> => {
        try {
            await addNewAnimal({
                name: "Nowy Ptasznik",
                species: "Gatunek do określenia",
                type: 'tarantula',
                age: 0,
            });
        } catch (error) {
            console.error('Error adding animal:', error);
            // Tutaj możesz dodać toast/alert z błędem
        }
    };

    const handleAnimalPress = (animal: Animal): void => {
        // navigation?.navigate('AnimalDetail', { animalId: animal.id });
        console.log('Przejście do szczegółów:', animal.name);
    };

    const filteredAnimals = animals.filter(animal =>
        animal.name.toLowerCase().includes(searchText.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchText.toLowerCase())
    );

    // Pokazuj loading state gdy ładuje dane po raz pierwszy
    if (loading && animals.length === 0) {
        return (
            <ListScreenLayout
                title="🕷️ Moje Ptaszniki"
                showAddButton={true}
                onAddPress={handleAddAnimal}
                listComponent={
                    <LoadingState message="Ładowanie ptaszników..." />
                }
            />
        );
    }

    return (
        <ListScreenLayout
            title="🕷️ Moje Ptaszniki"
            showAddButton={true}
            onAddPress={handleAddAnimal}
            searchComponent={
                <SearchBar
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Szukaj ptaszników..."
                />
            }
            listComponent={
                <AnimalList
                    animals={filteredAnimals}
                    onAnimalPress={handleAnimalPress}
                    onRefresh={refresh}
                    refreshing={loading && animals.length > 0}
                    emptyStateTitle="Brak ptaszników"
                    emptyStateDescription="Dodaj swojego pierwszego ptasznika, aby rozpocząć zarządzanie hodowlą"
                    emptyStateEmoji="🕷️"
                />
            }
        />
    );
};

export default AnimalsListScreen;