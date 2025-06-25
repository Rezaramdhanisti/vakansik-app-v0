import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Login/LoginScreen';
import LoginScreenEmail from '../screens/Login/LoginScreenEmail';
import SignupScreen from '../screens/Signup/SignupScreen';
import SignupScreenEmail from '../screens/Signup/SignupScreenEmail';
import { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LoginEmail" component={LoginScreenEmail} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SignupEmail" component={SignupScreenEmail} />
      {/* Add more auth screens here (Register, ForgotPassword, etc.) */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
