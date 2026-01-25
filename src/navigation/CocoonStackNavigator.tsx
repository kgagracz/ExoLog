import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CocoonsListScreen from "../screens/cocoons/CocoonsListScreen";
import CocoonDetailsScreen from "../screens/cocoons/CocoonDetailsScreen";
import OpenCocoonScreen from "../screens/cocoons/OpenCocoonScreen";

type CocoonStackParamList = {
    CocoonsList: undefined;
    CocoonDetails: { cocoonId: string; animalId: string };
    OpenCocoon: {
        cocoonId: string;
        animalId: string;
        animalName?: string;
        species?: string;
    };
};

const Stack = createNativeStackNavigator<CocoonStackParamList>();

export default function CocoonStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CocoonsList" component={CocoonsListScreen} />
            <Stack.Screen name="CocoonDetails" component={CocoonDetailsScreen} />
            <Stack.Screen name="OpenCocoon" component={OpenCocoonScreen} />
        </Stack.Navigator>
    );
}