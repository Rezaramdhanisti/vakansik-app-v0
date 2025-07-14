import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import supabase from '../services/supabaseClient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';
import 'react-native-gesture-handler';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Import navigators
import SearchNavigator from './SearchNavigator';
import BookingsNavigator from './BookingsNavigator';
import AuthNavigator from './AuthNavigator';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator for the app's primary screens
const MainNavigator = () => {
  return (
    <Tab.Navigator
        screenOptions={({ route }) => {
          return {
            tabBarIcon: ({ focused, color, size }) => {
              // Use custom image icons based on the route name and focused state
              if (route.name === 'Explore') {
                return (
                  <Image
                    source={focused ? require('../../assets/images/search.png') : require('../../assets/images/search-inactive.png')}
                    style={{ width: size, height: size }}
                  />
                );
              } else if (route.name === 'Bookings') {
                return (
                  <Image
                    source={focused ? require('../../assets/images/calendar.png') : require('../../assets/images/calendar-inactive.png')}
                    style={{ width: size, height: size }}
                  />
                );
              } else if (route.name === 'Profile') {
                return (
                  <Image
                    source={focused ? require('../../assets/images/profile.png') : require('../../assets/images/profile-inactive.png')}
                    style={{ width: size, height: size }}
                  />
                );
              }
              
              // Default icon (should not reach here in normal operation)
              return (
                <Image
                  source={require('../../assets/images/search.png')}
                  style={{ width: size, height: size }}
                />
              );
            },
            tabBarActiveTintColor: '#FF6F00',
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
        <Tab.Screen 
          name="Bookings" 
          component={BookingsNavigator}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? '';
            const hideOnScreens = ['DetailBooking'];
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
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
  );
};

// Create a context for authentication state
export const AuthContext = React.createContext({
  isLoggedIn: false,
  userId: null as string | null,
  login: () => {},
  logout: () => {},
});

// Root navigator that handles authentication flow
function AppNavigator() {
  // State to track if user is logged in and user ID
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Auth context value
  const authContext = {
    isLoggedIn,
    userId,
    login: async () => {
      const success = await userService.initializeFromSession();
      if (success) {
        setIsLoggedIn(true);
        setUserId(userService.getUserId());
      }
      return success;
    },
    logout: async () => {
      await supabase.auth.signOut();
      userService.clearUserData();
      setIsLoggedIn(false);
      setUserId(null);
    },
  };

  // Check if user is already logged in when app starts
  useEffect(() => {
    async function checkLoginStatus() {
      const success = await userService.initializeFromSession();
      if (success) {
        setIsLoggedIn(true);
        setUserId(userService.getUserId());
      }
    }
    
    checkLoginStatus();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          userService.storeUserData(session.user.id, session.user.email || undefined);
          setIsLoggedIn(true);
          setUserId(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          userService.clearUserData();
          setIsLoggedIn(false);
          setUserId(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <AuthContext.Provider value={authContext}>
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      </AuthContext.Provider>
    </NavigationContainer>
  );
}

export default AppNavigator;
