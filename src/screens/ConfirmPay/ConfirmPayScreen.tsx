import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Switch, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';

interface ConfirmPayScreenProps {
  route: {
    params: {
      tripDetails?: {
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
}

// Define payment method types
type PaymentMethodType = 'card' | 'gopay' | 'other';

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  title: string;
  subtitle?: string;
  icon?: any;
  isSelected?: boolean;
}

const ConfirmPayScreen: React.FC<ConfirmPayScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card-1');
  
  // Payment methods data
  const paymentMethods = useMemo<PaymentMethod[]>(() => [
    {
      id: 'card-1',
      type: 'card',
      title: '5560',
      subtitle: 'Mastercard',
      isSelected: selectedPaymentMethod === 'card-1'
    },
    {
      id: 'gopay-1',
      type: 'gopay',
      title: 'GoPay',
      isSelected: selectedPaymentMethod === 'gopay-1'
    },
    {
      id: 'shopee-1',
      type: 'gopay',
      title: 'Shopee',
      isSelected: selectedPaymentMethod === 'shopee-1'
    }
  ], [selectedPaymentMethod]);
  
  // Handle payment method selection
  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethod(id);
  };
  
  // Default trip details if not provided through route params
  const tripDetails = route.params?.tripDetails || {
    title: 'Explore Bali Highlights -Customized Full day Tour',
    image: require('../../../assets/images/lovina-1.jpg'),
    rating: 4.9,
    reviewCount: 5098,
    date: 'Saturday, Jun 28, 2025',
    timeSlot: '3:30 AM – 11:45 AM',
    price: 'Rp780,000',
    guestCount: 2
  };
  
  const togglePrivateBooking = () => {
    setIsPrivate(!isPrivate);
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handleBookNow = () => {
    // Handle booking logic here
    console.log('Booking confirmed');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm and pay</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        style={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Trip Details */}
        <View style={styles.tripDetailsContainer}>
          <View style={styles.tripImageContainer}>
            <Image source={tripDetails.image} style={styles.tripImage} />
          </View>
          <View style={styles.tripInfoContainer}>
            <Text style={styles.tripTitle}>{tripDetails.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#000" />
              <Text style={styles.ratingText}>{tripDetails.rating} ({tripDetails.reviewCount})</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Date and Time */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Date</Text>
          <Text style={styles.sectionContent}>{tripDetails.date}</Text>
          <Text style={styles.sectionContent}>{tripDetails.timeSlot}</Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Guests */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Guests</Text>
          </View>
          <Text style={styles.sectionContent}>{tripDetails.guestCount} adults</Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Price */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Total price</Text>
          </View>
          <Text style={styles.priceText}>{tripDetails.price} IDR</Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Cancellation Policy */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Free cancellation</Text>
          <Text style={styles.cancellationText}>
            Cancel before Jun 27, 3:30 AM (WITA) for full refund.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Private Booking Option */}
        {/* <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Book for just your group</Text>
          <View style={styles.privateBookingContainer}>
            <View style={styles.privateBookingRow}>
              <Text style={styles.privateBookingText}>Make it private for Rp420,000 more</Text>
              <Switch
                value={isPrivate}
                onValueChange={togglePrivateBooking}
                trackColor={{ false: '#DDDDDD', true: '#222222' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
            <Text style={styles.privateBookingDescription}>
              Just meet the host's Rp1,200,000 minimum before taxes or discounts.
            </Text>
            <TouchableOpacity>
              <Text style={styles.learnMoreText}>Learn more</Text>
            </TouchableOpacity>
          </View>
        </View> */}
        
        <View style={styles.divider} />
        
        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <View style={[styles.paymentMethodsContainer, { height: paymentMethods.length * 60 }]}>
            <FlashList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              estimatedItemSize={60}
              renderItem={({ item, index }) => (
                <>
                  <TouchableOpacity 
                    style={styles.paymentMethodCard}
                    onPress={() => handleSelectPaymentMethod(item.id)}
                  >
                    <View style={styles.paymentMethodContent}>
                      {item.type === 'card' && (
                        <View style={styles.cardIconContainer}>
                          <View style={styles.masterCardIcon}>
                            <View style={[styles.cardCircle, { backgroundColor: '#FF5F00' }]} />
                            <View style={[styles.cardCircle, { backgroundColor: '#FF0000', marginLeft: -10 }]} />
                          </View>
                          <Text style={styles.paymentMethodText}>{item.title}</Text>
                        </View>
                      )}
                      {item.type === 'gopay' && (
                        <View style={styles.goPayIconContainer}>
                          <View style={styles.goPayIcon}>
                            <Text style={styles.goPayIconText}>G</Text>
                          </View>
                          <Text style={styles.paymentMethodText}>{item.title}</Text>
                        </View>
                      )}
                    </View>
                    {item.isSelected ? (
                      <View style={styles.radioButton}>
                        <View style={styles.radioButtonInner} />
                      </View>
                    ) : (
                      <View style={styles.radioButtonEmpty} />
                    )}
                  </TouchableOpacity>
                  
                  {index < paymentMethods.length - 1 && (
                    <View style={styles.paymentDivider} />
                  )}
                </>
              )}
              ItemSeparatorComponent={null}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
          
         
          
          {/* Coupons Section */}
          <View style={[styles.sectionContainer]}>
            <Text style={styles.sectionTitle}>Coupons</Text>
            <TouchableOpacity style={styles.couponButton}>
              <Text style={styles.couponButtonText}>Enter a coupon</Text>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Price Details */}
          <View style={[styles.sectionContainer, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Price details</Text>
            <View style={styles.priceDetailsRow}>
              <Text style={styles.priceDetailsText}>Rp390,000.00 x 2 adults</Text>
              <Text style={styles.priceDetailsValue}>Rp780,000.00</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceDetailsRow}>
              <Text style={styles.totalText}>Total <Text style={styles.totalCurrency}>IDR</Text></Text>
              <Text style={styles.totalValue}>Rp780,000.00</Text>
            </View>
          </View>
          
          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By selecting the button, I agree to the <Text style={styles.termsLink}>booking terms</Text>, <Text style={styles.termsLink}>release and waiver</Text> and <Text style={styles.termsLink}>updated Terms of Service</Text>. View <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  placeholder: {
    width: 24,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  tripDetailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tripImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  tripInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tripTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  sectionContainer: {
    marginBottom: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
  },
  changeButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  priceText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  cancellationText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
    lineHeight: 22,
  },
  privateBookingContainer: {
    marginTop: 8,
  },
  privateBookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  privateBookingText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    flex: 1,
    marginRight: 16,
  },
  privateBookingDescription: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 8,
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    textDecorationLine: 'underline',
  },
  // Payment Methods Section
  paymentMethodsContainer: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterCardIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cardCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  radioButtonEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDDDDD',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  goPayIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goPayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00AEEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goPayIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  paymentMethodText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  moreOptionsText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  paymentLogosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  visaLogo: {
    marginRight: 16,
  },
  visaLogoText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#1A1F71',
    fontStyle: 'italic',
  },
  masterCardLogoSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  cardCircleSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  goPayLogoSmall: {
    marginRight: 16,
  },
  goPayLogoText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#00AEEF',
  },
  // Coupon Section
  couponButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
  },
  couponButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  // Price Details
  priceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceDetailsText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
  },
  priceDetailsValue: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  totalCurrency: {
    textDecorationLine: 'underline',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  // Terms
  termsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
  // Book Button
  bookButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bookButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
});

export default ConfirmPayScreen;
