export type RootStackParamList = {
    Home: undefined;
    AddAnimal: undefined;
    EditAnimal: { animalId: string }; // DODAJ
    AnimalDetails: { animalId: string };
    // ... inne ekrany
};