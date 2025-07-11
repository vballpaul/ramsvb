import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabsNavigator from './app/tabs/TabsNavigator';
import { LineupProvider } from './app/context/LineupContext';
import { TendenciesProvider } from './app/context/TendenciesContext';

export default function App() {
  return (
    <TendenciesProvider> {/* TendenciesProvider wraps everything */}
      <LineupProvider> {/* LineupProvider inside TendenciesProvider */}
        <NavigationContainer>
          <TabsNavigator />
        </NavigationContainer>
      </LineupProvider>
    </TendenciesProvider>
  );
}
