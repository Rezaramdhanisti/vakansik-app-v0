import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';

type BookingsScreenProps = {
  navigation: any;
};

function BookingsScreen({ navigation }: BookingsScreenProps): React.JSX.Element {
  // Mock data for bookings
  const bookings = [
    {
      id: '1',
      destination: 'Nusa Penida',
      title: 'Nusa Penida Day Tour With Snorkeling',
      date: 'Jun 18',
      time: '06:00',
      host: 'I Dewa Made',
      status: 'canceled',
      image: require('../../../assets/images/lovina-1.jpg'),
    },
    // You can add more mock bookings here
  ];

  const handleStartSearching = () => {
    navigation.navigate('Explore');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="hand-wave" size={32} color="#FF6F00" />
          </View>
          <Text style={styles.emptyStateTitle}>No bookings booked...yet!</Text>
          <Text style={styles.emptyStateSubtitle}>
            Time to dust off your bags and start planning your next adventure
          </Text>
          <TouchableOpacity 
            style={styles.startSearchingButton}
            onPress={handleStartSearching}
          >
            <Text style={styles.startSearchingButtonText}>Start exploring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bookingsContainer}>
          <Text style={styles.destinationTitle}>{bookings[0].destination}</Text>
          
          <View style={styles.flashListContainer}>
            <FlashList
              data={bookings}
              renderItem={({ item: booking }) => (
                <TouchableOpacity 
                  style={styles.bookingCard}
                  onPress={() => navigation.navigate('DetailBooking', { booking })}
                >
                  <View style={styles.bookingContent}>
                    <Image source={booking.image} style={styles.bookingImage} />
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingTitle}>{booking.title}</Text>
                      <Text style={styles.bookingInfo}>
                        {booking.date} · {booking.time} · Hosted by {booking.host}
                      </Text>
                      {booking.status === 'canceled' && (
                        <Text style={styles.canceledText}>Canceled</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              estimatedItemSize={100}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 10,
    height: 50
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -40, // Adjust to center the content visually
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '80%',
  },
  startSearchingButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  startSearchingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  bookingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flashListContainer: {
    flex: 1,
    height: '100%',
    marginBottom: 16,
  },
  destinationTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 10,
    marginTop: 5,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingContent: {
    flexDirection: 'row',
  },
  bookingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  bookingDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 4,
  },
  bookingInfo: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 4,
  },
  canceledText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FF6F00',
  },
  pastTripsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  pastTripsText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  luggageIcon: {
    width: 36,
    height: 36,
    position: 'absolute',
    right: 24,
  },
});

export default BookingsScreen;
