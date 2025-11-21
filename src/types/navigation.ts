export type RootStackParamList = {
    Home: undefined;
    AddAnimal: undefined;
    EditAnimal: { animalId: string }; // DODAJ
    AnimalDetails: { animalId: string };
    AddMolting: { animalId: string };

};