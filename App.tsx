import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './src/constants/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddImageScreen } from './src/screens/AddImageScreen';
import { OutfitPreviewScreen } from './src/screens/OutfitPreviewScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddImage" component={AddImageScreen} />
          <Stack.Screen name="OutfitPreview" component={OutfitPreviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
