import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimalsListScreen from "../screens/animals/AnimalsListScreen";
import AddSpiderScreen from "../screens/animals/AddSpiderScreen";
import {AddFeedingScreen} from "../screens/animals/AddFeedingScreen";
import AnimalDetailsScreen from "../screens/animals/AnimalDetailsScreen";
import EditAnimalScreen from "../screens/animals/EditAnimalScreen";
import AddMoltingScreen from "../screens/animals/AddMoltingScreen";
import AddMatingScreen from "../screens/animals/AddMatingScreen";
import AddCocoonScreen from "../screens/animals/AddCocoonScreen";
import AnimalPhotosScreen from "../screens/animals/AnimalPhotoScreen";
import QRPrintScreen from "../screens/QRPrintScreen";
import ProfileScreen from "../screens/ProfileScreen";

type AnimalStackParamList = {
    AnimalsList: undefined;
    AddSpider: undefined;
    AddFeeding: { preSelectedAnimal?: string } | undefined;
    AnimalDetails: { animalId: string };
    EditAnimal: { animalId: string };
    AddMolting: { animalId: string };
    AddMating: { animalId: string };
    AddCocoon: { animalId: string };
    AnimalPhotos: { animalId: string; animalName: string };
    QRPrint: undefined;
    FeedingHistory: { animalId: string };
    Profile: undefined;
};

const Stack = createNativeStackNavigator<AnimalStackParamList>();

export default function AnimalStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="AnimalsList" component={AnimalsListScreen} />
            <Stack.Screen name="AddSpider" component={AddSpiderScreen} />
            <Stack.Screen name="AddFeeding" component={AddFeedingScreen} />
            <Stack.Screen
                name="AnimalDetails"
                component={AnimalDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditAnimal"
                component={EditAnimalScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddMolting"
                component={AddMoltingScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddMating"
                component={AddMatingScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddCocoon"
                component={AddCocoonScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AnimalPhotos"
                component={AnimalPhotosScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="QRPrint"
                component={QRPrintScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}