import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import BookingsScreen from '../screens/Bookings/BookingsScreen';
import DetailBookingScreen from '../screens/Bookings/DetailBookinScreen';

// Define the type for the booking object
type Booking = {
  id: string;
  destination: string;
  title: string;
  date: string;
  time: string;
  host: string;
  status: string;
  image: any;
};

// Define the type for the bookings stack navigation
export type BookingsStackParamList = {
  BookingsList: undefined;
  DetailBooking: { booking: Booking };
};

const Stack = createStackNavigator<BookingsStackParamList>();

function BookingsNavigator() {
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
      <Stack.Screen name="BookingsList" component={BookingsScreen} />
      <Stack.Screen 
        name="DetailBooking" 
        component={DetailBookingScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
}

export default BookingsNavigator;
