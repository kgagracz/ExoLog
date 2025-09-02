import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {TabParamList} from "../types";
import AnimalsListScreen from "../screens/AnimalsList/AnimalsListScreen";
import {useTheme} from "../context/ThemeContext";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    const {theme} = useTheme()
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Animals') {
                        //@ts-ignore
                        iconName = focused ? 'spider' : 'spider-outline';
                    } else if (route.name === 'Events') {
                        iconName = focused ? 'calendar-check' : 'calendar-check-outline';
                    } else if (route.name === 'Stats') {
                        iconName = focused ? 'chart-line' : 'chart-line-variant';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'cog' : 'cog-outline';
                    } else {
                        iconName = 'help';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            {/*<Tab.Screen*/}
            {/*    name="Dashboard"*/}
            {/*    component={HomeScreen}*/}
            {/*    options={{*/}
            {/*        title: 'Pulpit',*/}
            {/*        headerShown: false, // HomeScreen ma własny header*/}
            {/*    }}*/}
            {/*/>*/}
            <Tab.Screen
                name="Animals"
                component={AnimalsListScreen}
                options={{
                    title: 'Zwierzęta',
                    headerTitle: 'Moje Zwierzęta',
                }}
            />
            {/*<Tab.Screen*/}
            {/*    name="Events"*/}
            {/*    component={EventsScreen}*/}
            {/*    options={{*/}
            {/*        title: 'Wydarzenia',*/}
            {/*        headerTitle: 'Historia Wydarzeń',*/}
            {/*    }}*/}
            {/*/>*/}
            {/*<Tab.Screen*/}
            {/*    name="Stats"*/}
            {/*    component={StatsScreen}*/}
            {/*    options={{*/}
            {/*        title: 'Statystyki',*/}
            {/*        headerTitle: 'Statystyki',*/}
            {/*    }}*/}
            {/*/>*/}
            {/*<Tab.Screen*/}
            {/*    name="Settings"*/}
            {/*    component={SettingsScreen}*/}
            {/*    options={{*/}
            {/*        title: 'Ustawienia',*/}
            {/*        headerShown: false, // SettingsScreen ma własny header*/}
            {/*    }}*/}
            {/*/>*/}
        </Tab.Navigator>
    );
}
