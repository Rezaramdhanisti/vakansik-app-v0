/**
 * MyTravel App
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';

// Import the AppNavigator
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF5E57" />
      <AppNavigator />
    </>
  );
}

export default App;
