import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type BookingsScreenProps = {
  navigation: any;
};

function BookingsScreen({ navigation }: BookingsScreenProps): React.JSX.Element {
  // Mock data for bookings - empty for now to show the empty state
  const bookings = [];

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
            <MaterialCommunityIcons name="hand-wave" size={32} color="#FF5E57" />
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
          {/* Bookings list would go here when there are bookings */}
          <Text>Your bookings will appear here</Text>
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
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    height: 150
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
    backgroundColor: '#FF5E57',
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
    padding: 16,
  },
});

export default BookingsScreen;
