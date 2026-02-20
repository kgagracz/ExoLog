import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityScreen from '../screens/social/CommunityScreen';
import UserSearchScreen from '../screens/social/UserSearchScreen';
import UserProfileScreen from '../screens/social/UserProfileScreen';
import FriendRequestsScreen from '../screens/social/FriendRequestsScreen';
import UserAnimalsScreen from '../screens/social/UserAnimalsScreen';
import AnimalDetailsScreen from '../screens/animals/AnimalDetailsScreen';
import ActivityFeedScreen from '../screens/social/ActivityFeedScreen';

type SocialStackParamList = {
    CommunityHome: undefined;
    UserSearch: undefined;
    UserProfile: { userId: string };
    FriendRequests: undefined;
    UserAnimals: { userId: string; displayName: string };
    UserAnimalDetails: { animalId: string };
    ActivityFeed: undefined;
};

const Stack = createNativeStackNavigator<SocialStackParamList>();

export default function SocialStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CommunityHome" component={CommunityScreen} />
            <Stack.Screen name="UserSearch" component={UserSearchScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
            <Stack.Screen name="UserAnimals" component={UserAnimalsScreen} />
            <Stack.Screen name="UserAnimalDetails" component={AnimalDetailsScreen} />
            <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} />
        </Stack.Navigator>
    );
}
