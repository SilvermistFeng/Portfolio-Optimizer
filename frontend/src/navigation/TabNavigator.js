import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import AssessmentScreen from '../screens/AssessmentScreen';
import ResultScreen from '../screens/ResultScreen';
import HypeMeterScreen from '../screens/HypeMeterScreen';
import TrackingScreen from '../screens/TrackingScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Assessment"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#6200ea',
            }}
        >
            <Tab.Screen
                name="Assessment"
                component={AssessmentScreen}
                options={{
                    tabBarLabel: 'Start',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="clipboard-text-outline" size={26} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Results"
                component={ResultScreen}
                options={{
                    tabBarLabel: 'Plan',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="chart-pie" size={26} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="HypeMeter"
                component={HypeMeterScreen}
                options={{
                    tabBarLabel: 'HypeMeter',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group" size={26} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Tracking"
                component={TrackingScreen}
                options={{
                    tabBarLabel: 'Track',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="finance" size={26} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="cog" size={26} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
