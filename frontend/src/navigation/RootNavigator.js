import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import InfluencerDetailScreen from '../screens/InfluencerDetailScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
                name="InfluencerDetail"
                component={InfluencerDetailScreen}
                options={{ headerShown: true, title: 'Analyst Report Card' }}
            />
        </Stack.Navigator>
    );
}
