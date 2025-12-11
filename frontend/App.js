import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { LightTheme, DarkTheme } from './src/theme';
import { PreferencesProvider, PreferencesContext } from './src/context/PreferencesContext';

function Main() {
  const { isThemeDark } = useContext(PreferencesContext);
  const theme = isThemeDark ? DarkTheme : LightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <Main />
    </PreferencesProvider>
  );
}
