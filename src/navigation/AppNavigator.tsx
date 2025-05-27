import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import 'react-native-gesture-handler';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import BookingsScreen from '../screens/Bookings/BookingsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Import navigators
import SearchNavigator from './SearchNavigator';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          return {
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string = 'help-circle'; // Default icon

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Explore') {
                iconName = focused ? 'search' : 'search-outline';
              } else if (route.name === 'Bookings') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              // You can return any component here
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#FF5E57',
            tabBarInactiveTintColor: '#999999',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            tabBarStyle: {
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
            headerShown: false,
          };
        }}
      >
        {/* <Tab.Screen name="Home" component={HomeScreen} /> */}
        <Tab.Screen 
          name="Explore" 
          component={SearchNavigator}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? '';
            const hideOnScreens = ['TripDetail', 'ConfirmPay'];
            const isTabBarHidden = hideOnScreens.includes(routeName);
            
            return {
              tabBarStyle: {
                height: 60,
                paddingBottom: 8,
                paddingTop: 4,
                display: isTabBarHidden ? 'none' : 'flex',
              }
            };
          }}
        />
        <Tab.Screen name="Bookings" component={BookingsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
