import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { FlashList } from '@shopify/flash-list';
import { getUserOrdersWithDestinations, OrderListItem } from '../../services/orderService';
import { AuthContext } from '../../navigation/AppNavigator';

type BookingsScreenProps = {
  navigation: any;
};

function BookingsScreen({ navigation }: BookingsScreenProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<OrderListItem[]>([]);
  
  // Get user context from AuthContext
  const { userId } = useContext(AuthContext);
  
  const fetchUserOrders = async () => {
    try {
      // Check if userId is available from context
      if (!userId) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Fetch orders using the userId from context
      const orders = await getUserOrdersWithDestinations(userId);
      
      setBookings(orders);
    } catch (err) {
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchUserOrders();
  }, [userId]);
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserOrders();
  };

  const handleBookingPress = (booking: OrderListItem) => {
    navigation.navigate('DetailBooking', { orderId: booking.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={60} color="#999" />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>Your bookings will appear here once you make a reservation.</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Destinations</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bookingsContainer}>
          <View style={styles.flashListContainer}>
            <FlashList
              data={bookings}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
              renderItem={({ item: booking }) => (
                <TouchableOpacity 
                  style={styles.bookingCard}
                  onPress={() => handleBookingPress(booking)}
                >
                  <View style={styles.bookingContent}>
                    <Image 
                      source={booking.image ? { uri: booking.image } : require('../../../assets/images/beach.webp')} 
                      style={styles.bookingImage} 
                    />
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingTitle}>{booking.title}</Text>
                      <Text style={styles.bookingInfo}>
                        {dayjs(booking.date, 'YYYY-MM-DD').format('dddd, MMMM D YYYY')}
                      </Text>
                      {booking.status === 'FAILED' ? (
                        <Text style={styles.canceledText}>Failed</Text>
                      ): booking.status === 'PENDING' ?(
                        <Text style={styles.pendingText}>Pending Payment</Text>
                      ): (
                        <Text style={styles.successText}>Paid</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              estimatedItemSize={100}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#FF6F00']}
                  tintColor="#FF6F00"
                />
              }
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
    lineHeight: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  bookingsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  flashListContainer: {
    flex: 1,
    height: '100%',
  },
  listingsContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 16,
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
    width: 80,
    height: 80,
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
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
    marginBottom: 4,
  },
  canceledText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: 'red',
  },
  pendingText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FF6F00',
  },
  successText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: 'green',
  },
  pastTripsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  pastTripsButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FF6F00',
    marginRight: 8,
  },
  luggageIcon: {
    marginRight: 8,
  },
});

export default BookingsScreen;
