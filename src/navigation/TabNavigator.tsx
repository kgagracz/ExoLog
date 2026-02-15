import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimalStackNavigator from "./AnimalStackNavigator";
import CocoonStackNavigator from "./CocoonStackNavigator";
import SocialStackNavigator from "./SocialStackNavigator";
import QRScannerScreen from "../screens/QRScannerScreen";
import {useTheme} from "../context/ThemeContext";
import Text from "../components/atoms/Text";


export type TabParamList = {
    Dashboard: undefined;
    Animals: undefined;
    Cocoons: undefined;
    Community: undefined;
    QRScanner: undefined;
    Events: undefined;
    Stats: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    const {theme} = useTheme()
    const insets = useSafeAreaInsets()
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
                    } else if (route.name === 'Cocoons') {
                        iconName = focused ? 'egg' : 'egg-outline';
                    } else if (route.name === 'Community') {
                        iconName = focused ? 'account-group' : 'account-group-outline';
                    } else if (route.name === 'QRScanner') {
                        iconName = focused ? 'qrcode-scan' : 'qrcode-scan';
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
                    height: 60 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
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
            {/*<Tab.Screen */}
            {/*  name="Dashboard" */}
            {/*  component={() => <Text>HomeScreen</Text>}*/}
            {/*  options={{*/}
            {/*    title: 'Pulpit',*/}
            {/*    headerShown: false,*/}
            {/*  }}*/}
            {/*/>*/}
            <Tab.Screen
                name="Animals"
                component={AnimalStackNavigator}
                options={{
                    title: 'Zwierzęta',
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Cocoons"
                component={CocoonStackNavigator}
                options={{
                    title: 'Kokony',
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Community"
                component={SocialStackNavigator}
                options={{
                    title: 'Społeczność',
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="QRScanner"
                component={QRScannerScreen}
                options={{
                    title: 'Skanuj',
                    headerShown: false,
                }}
            />
            {/*<Tab.Screen */}
            {/*  name="Events" */}
            {/*  component={() => <Text>EventsScreen</Text>}*/}
            {/*  options={{*/}
            {/*    title: 'Wydarzenia',*/}
            {/*    headerTitle: 'Historia Wydarzeń',*/}
            {/*  }}*/}
            {/*/>*/}
            {/*<Tab.Screen */}
            {/*  name="Stats" */}
            {/*  component={() => <Text>StatsScreen</Text>}*/}
            {/*  options={{*/}
            {/*    title: 'Statystyki',*/}
            {/*    headerTitle: 'Statystyki',*/}
            {/*  }}*/}
            {/*/>*/}
            {/*<Tab.Screen */}
            {/*  name="Settings" */}
            {/*  component={() => <Text>SettingsScreen</Text>}*/}
            {/*  options={{*/}
            {/*    title: 'Ustawienia',*/}
            {/*    headerShown: false,*/}
            {/*  }}*/}
            {/*/>*/}
        </Tab.Navigator>
    );
}