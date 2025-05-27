import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SearchScreen from '../screens/Search/SearchScreen';
import TripDetailScreen from '../screens/TripDetail/TripDetailScreen';

// Define the type for the property object
type Property = {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: string;
  reviews: string;
  location?: string;
  images?: string[];
  features?: {
    bedrooms: number;
    beds: number;
    bathrooms: string;
  };
  isFavorite: boolean;
};

// Define the type for the search stack navigation
export type SearchStackParamList = {
  SearchMain: undefined;
  TripDetail: { property: Property };
};

const Stack = createStackNavigator<SearchStackParamList>();

function SearchNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen 
        name="TripDetail" 
        component={TripDetailScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}

export default SearchNavigator;
