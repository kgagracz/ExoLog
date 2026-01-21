export type RootStackParamList = {
    Home: undefined;
    AddAnimal: undefined;
    EditAnimal: { animalId: string };
    AnimalDetails: { animalId: string };
    AddMolting: { animalId: string };
};

export type AnimalStackParamList = {
    AnimalsList: undefined;
    AddSpider: undefined;
    AddFeeding: { preSelectedAnimal?: string } | undefined;
    AnimalDetails: { animalId: string };
    EditAnimal: { animalId: string };
    AddMolting: { animalId: string };
    AddMating: { animalId: string };
    FeedingHistory: { animalId: string };
    Profile: undefined;
};