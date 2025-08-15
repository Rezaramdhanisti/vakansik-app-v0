import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthContext } from '../../navigation/AppNavigator';
import userService from '../../services/userService';
import Text from '../../components/Text';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import GuestBottomSheet, { GuestBottomSheetRef, GuestData } from '../../components/GuestBottomSheet';
import PaymentNumberBottomSheet, { PaymentNumberBottomSheetRef } from '../../components/PaymentNumberBottomSheet';
import PaymentSuccessBottomSheet, { PaymentSuccessBottomSheetRef } from '../../components/PaymentSuccessBottomSheet';
import { FONTS } from '../../config/fonts';
import supabase from '../../services/supabaseClient';

interface ConfirmPayScreenProps {
  route: {
    params: {
      tripDetails?: {
        property?: any; // The entire property object
        tripId?: string;
        title: string;
        image: any;
        rating: number;
        reviewCount: number;
        date: string;
        timeSlot: string;
        price: string;
        guestCount: number;
        requiredIdCard?: boolean;
        is_need_ktp?: boolean;
      };
    };
  };
}

// Define guest interface
interface Guest {
  id: string;
  name: string;
  title: 'Tuan' | 'Nona' | '';
  phoneNumber: string;
  idCardNumber: string; // Changed from optional to required to match GuestData
}

// Define payment method types
type PaymentMethodType = 'card' | 'gopay' | 'shopee' | 'other';

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
  const { userId } = useContext(AuthContext);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('shopee-1');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentNumber, setPaymentNumber] = useState('');
  
  // Log user ID when component mounts
  useEffect(() => {
    if (userId) {
      console.log('Current user ID from context:', userId);
    }
  }, [userId]);

  // Default trip details if not provided through route params
  const tripDetails = route.params?.tripDetails || {
    tripId: `trip-${Date.now()}`, // Default trip ID using timestamp
    title: 'Explore Bali Highlights -Customized Full day Tour',
    image: require('../../../assets/images/lovina-1.jpg'),
    rating: 4.9,
    reviewCount: 5098,
    date: 'Saturday, Jun 28, 2025',
    timeSlot: '3:30 AM – 11:45 AM',
    price: 'Rp780,000',
    guestCount: 2,
    requiredIdCard: true
  };
  
  // Guest state management - initialize based on guestCount from route params
  const [guests, setGuests] = useState<Guest[]>(() => {
    const count = tripDetails.guestCount || 2;
    return Array.from({ length: count }, (_, index) => ({
      id: (index + 1).toString(),
      name: '',
      title: 'Tuan' as const, // Use const assertion to ensure type compatibility
      phoneNumber: '+62',
      idCardNumber: ''
    }));
  });
  const [isGuestModalVisible, setIsGuestModalVisible] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [editedGuest, setEditedGuest] = useState<Guest | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Payment methods data
  const paymentMethods = useMemo<PaymentMethod[]>(() => [
    {
      id: 'shopee-1',
      type: 'shopee',
      title: 'Shopee Pay',
      isSelected: selectedPaymentMethod === 'shopee-1'
    },
    // {
    //   id: 'gopay-1',
    //   type: 'gopay',
    //   title: 'Gopay',
    //   isSelected: selectedPaymentMethod === 'gopay-1'
    // }
  ], [selectedPaymentMethod]);
  
  // Handle payment method selection
  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethod(id);
  };
  
  const togglePrivateBooking = () => {
    setIsPrivate(!isPrivate);
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handleBookNow = async () => {
    // Check if all guests have been filled out
    const allGuestsFilled = guests.every(guest => {
      const nameValid = guest.name.trim() !== '';
      const phoneValid = guest.phoneNumber.trim() !== '' && guest.phoneNumber.trim() !== '+62';
      const idCardValid = !tripDetails.requiredIdCard || (guest.idCardNumber && guest.idCardNumber.trim() !== '');
      return nameValid && phoneValid && idCardValid;
    });
    
    if (!allGuestsFilled) {
      setErrorMessage('Please fill out all guest information before booking.');
      setIsErrorModalVisible(true);
      return;
    }
    
    // If Shopee or GoPay payment method is selected, show payment number input
    if (selectedPaymentMethod === 'shopee-1' || selectedPaymentMethod === 'gopay-1') {
      // Show payment number bottom sheet
      const paymentMethodName = selectedPaymentMethod === 'shopee-1' ? 'Shopee' : 'GoPay';
      paymentNumberBottomSheetRef.current?.present();
      return;
    }
    
    // For other payment methods, proceed directly
    // proceedWithPayment();
  };
  
  // Handle payment number save
  const handlePaymentNumberSave = (number: string) => {
    setPaymentNumber(number);
    // Proceed with payment after getting the number
    proceedWithPayment(number);
  };
 
  // Proceed with payment after validation
  const proceedWithPayment = async (number: string) => {
    // Set loading state to true
    setIsLoading(true);
    
    // Create a booking object from the current trip details and guest information
    const booking = {
      id: route.params?.tripDetails?.tripId || `trip-${Date.now()}`, // Use real trip ID or generate a timestamp-based ID as fallback
      destination: tripDetails.title.split('-')[0].trim(),
      title: tripDetails.title,
      date: tripDetails.date,
      time: tripDetails.timeSlot,
      host: 'Local Guide',
      status: 'Upcoming',
      image: tripDetails.image,
      property: route.params?.tripDetails?.property, // Store the entire property object for future reference
    };
    
    // Variable to store the order_id from the response
    // Default to booking.id in case we don't get an order_id from the API
    let orderId: string = booking.id;
    
    try {
      // If Shopee or GoPay payment method is selected, call the edge function
      if (selectedPaymentMethod === 'shopee-1' || selectedPaymentMethod === 'gopay-1') {
        // Format guests data for the API call
        const joinedUsers = guests.map(guest => ({
          name: guest.name,
          phone_number: guest.phoneNumber,
          id_card_number: guest.idCardNumber || '' // Include KTP number if it exists
        }));
        
        // Check if we have the current user ID
        if (!userId) {
          throw new Error('User ID not available. Please log in again.');
        }
        
        // Call the edge function
        console.log('Calling Supabase edge function for payment with user ID:', userId);
        const { data, error } = await supabase.functions.invoke('create_payment_request', {
          body: {
            trip_id: route.params?.tripDetails?.tripId, // Using the real trip ID
            trip_date: tripDetails.date,
            payment_number: number, // Include the payment number
            payment_method: selectedPaymentMethod === 'shopee-1' ? 'shopee' : 'gopay',
            joined_users: joinedUsers,
            user_id: userId // Include the user ID from context
          }
        });
        
        if (error) {
          throw new Error(`Payment request failed: ${error.message}`);
        }
        
        console.log('Payment request successful:', data);
        
        // Store the order_id from the response for later use in navigation
        orderId = data.order_id;
        
        // Handle the response - open the payment URL if available
        if (data.actions && data.actions.length > 0) {
          console.log('Payment actions received:', JSON.stringify(data.actions));
          
          // Look for the deeplink URL in the actions array
          // The action structure has changed - now using type and descriptor
          const deepLinkAction = data.actions.find(
            (a: any) => a.type === 'REDIRECT_CUSTOMER' && a.descriptor === 'DEEPLINK_URL'
          );
          
          if (deepLinkAction && deepLinkAction.value) {
            // Reset loading state
            setIsLoading(false);
            
            console.log('Found deeplink URL:', deepLinkAction.value);
            
            Linking.openURL(deepLinkAction.value);
          } else {
            console.log('No suitable deeplink found in actions');
          }
        }
      }
      
      // For other payment methods or if Shopee payment doesn't return a URL, continue with the original flow
      // Add a 5-second delay before navigating
      setTimeout(() => {
        // Reset loading state
        setIsLoading(false);
        
        // Navigate to the Bookings tab and then to DetailBookingScreen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'Bookings' },
            ],
          })
        );
        
        // Add a small delay to ensure the tab navigation completes before navigating to the detail screen
        setTimeout(() => {
          navigation.dispatch({
            ...CommonActions.navigate('Bookings', {
              screen: 'DetailBooking',
              params: { orderId: orderId }, // Use order_id from the response
            }),
          });
        }, 100);
      }, 5000); // 5 seconds delay
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setIsLoading(false);
      Alert.alert('Payment Error', `An error occurred while processing your payment: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Reference to the bottom sheets
  const guestBottomSheetRef = useRef<GuestBottomSheetRef>(null);
  const paymentNumberBottomSheetRef = useRef<PaymentNumberBottomSheetRef>(null);
  const paymentSuccessBottomSheetRef = useRef<PaymentSuccessBottomSheetRef>(null);
  
  // Guest modal functions
  const openGuestModal = (guest: Guest) => {
    console.log('Opening guest modal, requiredIdCard:', tripDetails.requiredIdCard);
    setCurrentGuest(guest);
    // Create a deep copy of the guest object to prevent reference issues
    setEditedGuest({
      id: guest.id,
      name: guest.name || '',
      title: guest.title || 'Tuan',
      phoneNumber: guest.phoneNumber || '+62',
      idCardNumber: guest.idCardNumber || ''
    });
    setShowValidation(false);
    guestBottomSheetRef.current?.present();
  };
  
  const closeGuestModal = () => {
    guestBottomSheetRef.current?.dismiss();
    setCurrentGuest(null);
    setEditedGuest(null);
    setShowValidation(false);
  };
  
  const handleSaveGuest = (guestData: GuestData) => {
    if (currentGuest) {
      // Convert GuestData to Guest type with the current ID
      const updatedGuest: Guest = {
        ...guestData,
        id: currentGuest.id,
        title: guestData.title as 'Tuan' | 'Nona' | '' // Ensure type compatibility
      };
      
      // Update the guests array
      setGuests(guests.map(guest => 
        guest.id === currentGuest.id ? updatedGuest : guest
      ));
      
      // Close the bottom sheet after saving
      closeGuestModal();
    }
  };
  
  // Set up deep link handler for payment success
  useEffect(() => {
    // Add event listener for deep links
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('Deep link received:', url);
      
      // Handle payment success deeplink
      if (url.includes('payment-success')) {
        paymentSuccessBottomSheetRef.current?.present();
      }
    };
    
    // Set up listeners
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    // Clean up listener on component unmount
    return () => {
      subscription.remove();
    };
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <BottomSheetModalProvider>
      {/* Guest Bottom Sheet */}
      <GuestBottomSheet
        ref={guestBottomSheetRef}
        onDismiss={closeGuestModal}
        onSave={handleSaveGuest}
        showIdCardField={tripDetails.is_need_ktp}
        initialGuestData={editedGuest ? {
          title: editedGuest.title,
          name: editedGuest.name,
          phoneNumber: editedGuest.phoneNumber,
          idCardNumber: editedGuest.idCardNumber || ''
        } : {
          title: 'Tuan',
          name: '',
          phoneNumber: '+62',
          idCardNumber: ''
        }}
      />
      
      {/* Payment Number Bottom Sheet */}
      <PaymentNumberBottomSheet
        ref={paymentNumberBottomSheetRef}
        onDismiss={() => {}}
        onSave={handlePaymentNumberSave}
        initialPaymentNumber={paymentNumber}
        paymentMethod={selectedPaymentMethod === 'shopee-1' ? 'Shopee' : 'GoPay'}
      />

      {/* Payment Success Bottom Sheet */}
      <PaymentSuccessBottomSheet
        ref={paymentSuccessBottomSheetRef}
        onDismiss={() => {}}
        onContinue={() => {
          // Navigate to Bookings tab after payment success
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'Bookings' },
              ],
            })
          );
        }}
      />
      
      {/* Payment processing indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Processing payment...</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Confirm and pay</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
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
          
          {/* Guest List */}
          <View style={styles.guestListContainer}>
            {guests.map((guest, index) => (
              <TouchableOpacity 
                key={guest.id} 
                style={styles.guestItem}
                onPress={() => openGuestModal(guest)}
              >
                <View style={styles.guestItemContent}>
                  <Text style={styles.guestItemTitle}>
                    Guest {index + 1}{guest.name ? `: ${guest.name}` : ''}
                  </Text>
                  {guest.name ? (
                    <Text style={styles.guestItemSubtitle}>
                      {guest.title} • {guest.phoneNumber}
                    </Text>
                  ) : (
                    <Text style={styles.guestItemSubtitle}>
                      Tap to add details
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
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
                      <View style={styles.paymentIconContainer}>
                        <Image 
                          source={item.type === 'gopay' 
                            ? require('../../../assets/images/g-pay.webp')
                            : require('../../../assets/images/s-pay.webp')} 
                          style={styles.paymentIcon} 
                          resizeMode="contain"
                        />
                        <Text style={styles.paymentMethodText}>{item.title}</Text>
                      </View>
                    </View>
                    {item.isSelected ? (
                      <View style={styles.paymentRadioButton}>
                        <View style={styles.paymentRadioButtonInner} />
                      </View>
                    ) : (
                      <View style={styles.paymentRadioButtonEmpty} />
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
        </ScrollView>
        
        {/* Book Now Button */}
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookNowButtonText}>Book now</Text>
            )}
          </TouchableOpacity>
        </View>
      
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.errorModalBackdrop}>
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#FF6F00"
              style={styles.lottieAnimation}
            />
            <Text style={styles.loadingOverlayText}>Processing your booking...</Text>
          </View>
        </View>
      )}
      
      {/* Error Modal */}
      {isErrorModalVisible && (
        <View style={styles.errorModalBackdrop}>
          <View style={styles.errorModalContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="warning-outline" size={48} color="#FF6F00" />
            </View>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={() => setIsErrorModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingIndicatorContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lottieAnimation: {
    width: 50,
    height: 50,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  // Guest list styles
  guestListContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
  },
  guestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  guestItemContent: {
    flex: 1,
  },
  guestItemTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    marginBottom: 4,
  },
  guestItemSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#888',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Safe area bottom padding
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  modalContent: {
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#555',
    marginBottom: 20,
  },
  
  // Title selection
  titleSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  titleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  titleOptionSelected: {
    backgroundColor: '#F8F8F8',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#FF5A5F',
  },
  modalRadioButtonSelected: {
    borderColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5A5F',
  },
  titleText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  
  // Input styles
  inputLabel: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#FF5A5F',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666666',
    marginTop: -4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 24,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 24,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#DDDDDD',
  },
  flagIcon: {
    width: 20,
    height: 14,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000',
  },
  
  // Save button
  saveButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorModalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
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
  closeButton: {
    padding: 4,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    flex: 1,
    textAlign: 'center',
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
  paymentRadioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  paymentRadioButtonEmpty: {
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
  paymentIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
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
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
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
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
});

export default ConfirmPayScreen;
