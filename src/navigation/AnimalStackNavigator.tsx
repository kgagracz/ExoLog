import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimalsListScreen from "../screens/animals/AnimalsListScreen";
import AddSpiderScreen from "../screens/animals/AddSpiderScreen";
import {AddFeedingScreen} from "../screens/animals/AddFeedingScreen";

type AnimalStackParamList = {
  AnimalsList: undefined;
  AddSpider: undefined;
  AddFeeding: undefined;
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
    </Stack.Navigator>
  );
}
