// app/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // For tab icons
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import LineupScreen from './screens/LineupScreen';
import TendenciesScreen from './screens/TendenciesScreen';
import ScoutingScreen from './screens/ScoutingScreen';
import { LineupProvider } from './context/LineupContext';
import { TendenciesProvider } from './context/TendenciesContext';

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <TendenciesProvider>
      <LineupProvider>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName = route.name === 'Home' ? 'home' : 'bar-chart';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
          <Tab.Screen name="Lineup" component={LineupScreen} />
          <Tab.Screen name="Tendencies" component={TendenciesScreen} />
          <Tab.Screen name="Scouting" component={ScoutingScreen} />
        </Tab.Navigator>
      </LineupProvider>
    </TendenciesProvider>
  );
}

