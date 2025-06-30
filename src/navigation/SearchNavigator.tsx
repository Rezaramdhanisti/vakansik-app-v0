import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SearchScreen from '../screens/Search/SearchScreen';
import TripDetailScreen from '../screens/TripDetail/TripDetailScreen';
import ConfirmPayScreen from '../screens/ConfirmPay/ConfirmPayScreen';

// Define the type for the activity in the itinerary
type Activity = {
  icon: string;
  title: string;
  description: string;
};

// Define the type for a day in the itinerary
type ItineraryDay = {
  day: string;
  activities: Activity[];
};

// Define the type for the property object
type Property = {
  id: string;
  name?: string;  // Added name field from SearchScreen data
  title?: string; // Made optional since we might use name instead
  description: string;
  price: string;
  rating: string;
  reviews: string;
  location?: string;
  image_urls?: string[]; // Added image_urls from SearchScreen data
  images?: string[];     // Keep original images field for backward compatibility
  features?: {
    bedrooms: number;
    beds: number;
    bathrooms: string;
  };
  isFavorite: boolean;
  price_information?: string; // Added price_information from API
  itinerary?: ItineraryDay[]; // Added itinerary from API
  meeting_point?: string;     // Added meeting_point from API
  available_dates?: Record<string, Record<string, number[]>>; // Added available_dates field for calendar availability
};

// Define the type for the search stack navigation
export type SearchStackParamList = {
  SearchMain: undefined;
  TripDetail: { property: Property; guestCount?: number };
  ConfirmPay: {
    tripDetails: {
      title: string;
      image: any;
      rating: number;
      reviewCount: number;
      date: string;
      timeSlot: string;
      price: string;
      guestCount: number;
    };
  };
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
      <Stack.Screen 
        name="ConfirmPay" 
        component={ConfirmPayScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}

export default SearchNavigator;
