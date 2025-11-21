import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimalsListScreen from "../screens/animals/AnimalsListScreen";
import AddSpiderScreen from "../screens/animals/AddSpiderScreen";
import {AddFeedingScreen} from "../screens/animals/AddFeedingScreen";
import AnimalDetailsScreen from "../screens/animals/AnimalDetailsScreen";
import EditAnimalScreen from "../screens/animals/EditAnimalScreen";
import MoltingHistoryCard from "../screens/animals/MoltingHistoryScreen";
import AddMoltingScreen from "../screens/animals/AddMoltingScreen";

type AnimalStackParamList = {
  AnimalsList: undefined;
  AddSpider: undefined;
  AddFeeding: undefined;
  AnimalDetails: undefined;
  EditAnimal: undefined
  AddMolting: undefined
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
    </Stack.Navigator>
  );
}
