import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthContext } from '../../navigation/AppNavigator';
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
type PaymentMethodType = 'card' | 'ovo' | 'shopee' | 'qris' | 'other';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('qris-1');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentNumber, setPaymentNumber] = useState('');
  
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
  
  // Utility function to parse price string and calculate per-person price
  const parsePrice = (priceString: string): number => {
    // Remove 'Rp' prefix and commas, then convert to number
    const cleanPrice = priceString.replace(/[Rp,]/g, '');
    return parseInt(cleanPrice, 10);
  };
  
  // Utility function to format price back to string
  const formatPrice = (price: number): string => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };
  
  // Utility function to format trip date for display
  const formatTripDateForDisplay = (tripDateString: string): string => {
    try {
      // Parse the trip date string (e.g., "Saturday, Jun 28, 2025")
      const tripDate = new Date(tripDateString);
      
      // Check if the date is valid
      if (isNaN(tripDate.getTime())) {
        // If parsing fails, try alternative parsing methods
        const parts = tripDateString.split(', ');
        if (parts.length >= 2) {
          const datePart = parts[1]; // "Jun 28, 2025"
          const parsedDate = new Date(datePart);
          if (!isNaN(parsedDate.getTime())) {
            tripDate.setTime(parsedDate.getTime());
          }
        }
      }
      
      // If still invalid, return the original string
      if (isNaN(tripDate.getTime())) {
        return tripDateString;
      }
      
      // Format the date as "day, date, Month name and year" (e.g., "Saturday, 28, June 2025")
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      
      return tripDate.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting trip date:', error);
      return tripDateString;
    }
  };

  // Utility function to calculate cancellation deadline (7 days before trip date)
  const calculateCancellationDeadline = (tripDateString: string): string => {
    try {
      // Parse the trip date string (e.g., "Saturday, Jun 28, 2025")
      const tripDate = new Date(tripDateString);
      
      // Check if the date is valid
      if (isNaN(tripDate.getTime())) {
        // If parsing fails, try alternative parsing methods
        const parts = tripDateString.split(', ');
        if (parts.length >= 2) {
          const datePart = parts[1]; // "Jun 28, 2025"
          const parsedDate = new Date(datePart);
          if (!isNaN(parsedDate.getTime())) {
            tripDate.setTime(parsedDate.getTime());
          }
        }
      }
      
      // If still invalid, return a fallback
      if (isNaN(tripDate.getTime())) {
        return "Batalkan sebelum tanggal perjalanan untuk pengembalian penuh.";
      }
      
      // Subtract 7 days
      const cancellationDate = new Date(tripDate);
      cancellationDate.setDate(cancellationDate.getDate() - 7);
      
      // Format the date in the same style as the original
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Jakarta' // WIB timezone
      };
      
      const formattedDate = cancellationDate.toLocaleDateString('en-US', options);
      const timeZone = 'WIB';
      
      return `Batalkan sebelum ${formattedDate} (${timeZone}) untuk pengembalian penuh.`;
    } catch (error) {
      console.error('Error calculating cancellation deadline:', error);
      return "Batalkan sebelum tanggal perjalanan untuk pengembalian penuh.";
    }
  };
  
  // Calculate price per person
  const pricePerPerson = useMemo(() => {
    const totalPrice = parsePrice(tripDetails.price);
    return Math.floor(totalPrice / tripDetails.guestCount);
  }, [tripDetails.price, tripDetails.guestCount]);
  
  // Calculate total price
  const totalPrice = useMemo(() => {
    return parsePrice(tripDetails.price);
  }, [tripDetails.price]);
  
  // Log user ID when component mounts
  useEffect(() => {
    if (userId) {
      console.log('Current user ID from context:', userId);
    }
  }, [userId]);
  
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
    // {
    //   id: 'shopee-1',
    //   type: 'shopee',
    //   title: 'Shopee Pay',
    //   isSelected: selectedPaymentMethod === 'shopee-1'
    // },
    {
      id: 'qris-1',
      type: 'qris',
      title: 'QRIS',
      isSelected: selectedPaymentMethod === 'qris-1'
    },
    {
      id: 'ovo-1',
      type: 'ovo',
      title: 'OVO',
      isSelected: selectedPaymentMethod === 'ovo-1'
    }
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
      setErrorMessage('Silakan lengkapi semua informasi tamu sebelum memesan.');
      setIsErrorModalVisible(true);
      return;
    }
    
    // If Shopee or OVO payment method is selected, show payment number input
    if (selectedPaymentMethod === 'shopee-1' || selectedPaymentMethod === 'ovo-1') {
      // Show payment number bottom sheet
      const paymentMethodName = selectedPaymentMethod === 'shopee-1' ? 'Shopee' : 'OVO';
      paymentNumberBottomSheetRef.current?.present();
      return;
    }
    
    // If QRIS payment method is selected, navigate to QRIS payment screen
    if (selectedPaymentMethod === 'qris-1') {
      proceedWithQRISPayment();
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
  
  // Handle QRIS payment
  const proceedWithQRISPayment = async () => {
    // Set loading state to true
    setIsLoading(true);
    
    try {
      // Format guests data for the API call
      const joinedUsers = guests.map(guest => ({
        name: guest.name,
        phone_number: guest.phoneNumber,
        id_card_number: guest.idCardNumber || ''
      }));
      
      // Check if we have the current user ID
      if (!userId) {
        throw new Error('ID pengguna tidak tersedia. Silakan masuk kembali.');
      }
      
      // Call the edge function for QRIS payment
      console.log('Calling Supabase edge function for QRIS payment with user ID:', userId);
      const { data, error } = await supabase.functions.invoke('create_payment_request', {
        body: {
          trip_id: route.params?.tripDetails?.tripId,
          trip_date: tripDetails.date,
          payment_method: 'qris',
          joined_users: joinedUsers,
          user_id: userId
        }
      });
      
      if (error) {
        throw new Error(`Permintaan pembayaran gagal: ${error.message}`);
      }
      
      console.log('QRIS Payment request successful:', data);
      
      // Reset loading state
      setIsLoading(false);
      
      // Navigate to QRIS payment screen with the payment data
      (navigation as any).navigate('QRISPayment', {
        paymentData: data,
        tripDetails: tripDetails,
        orderId: data.order_id
      });
      
    } catch (error: any) {
      console.error('Error processing QRIS payment:', error);
      setIsLoading(false);
      Alert.alert('Error Pembayaran', `Terjadi kesalahan saat memproses pembayaran Anda: ${error.message || 'Kesalahan tidak diketahui'}`);
    }
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
      // If Shopee or OVO payment method is selected, call the edge function
      if (selectedPaymentMethod === 'shopee-1' || selectedPaymentMethod === 'ovo-1') {
        // Format guests data for the API call
        const joinedUsers = guests.map(guest => ({
          name: guest.name,
          phone_number: guest.phoneNumber,
          id_card_number: guest.idCardNumber || '' // Include KTP number if it exists
        }));
        
        // Check if we have the current user ID
        if (!userId) {
          throw new Error('ID pengguna tidak tersedia. Silakan masuk kembali.');
        }
        
        // Normalize phone number for OVO (ensure it starts with +)
        let normalizedPaymentNumber = number;
        if (selectedPaymentMethod === 'ovo-1') {
          // Remove any spaces and ensure it starts with +
          normalizedPaymentNumber = number.replace(/\s/g, '');
          if (!normalizedPaymentNumber.startsWith('+')) {
            // If it starts with 62, replace with +62
            if (normalizedPaymentNumber.startsWith('62')) {
              normalizedPaymentNumber = '+' + normalizedPaymentNumber;
            }
            // If it starts with 0, replace with +62
            else if (normalizedPaymentNumber.startsWith('0')) {
              normalizedPaymentNumber = '+62' + normalizedPaymentNumber.substring(1);
            }
            // If it doesn't start with +, add +62
            else if (!normalizedPaymentNumber.startsWith('+')) {
              normalizedPaymentNumber = '+62' + normalizedPaymentNumber;
            }
          }
        }
        
        // Call the edge function
        console.log('Calling Supabase edge function for payment with user ID:', userId);
        const { data, error } = await supabase.functions.invoke('create_payment_request', {
          body: {
            trip_id: route.params?.tripDetails?.tripId, // Using the real trip ID
            trip_date: tripDetails.date,
            payment_number: normalizedPaymentNumber, // Use normalized payment number
            payment_method: selectedPaymentMethod === 'shopee-1' ? 'shopee' : 'ovo',
            joined_users: joinedUsers,
            user_id: userId // Include the user ID from context
          }
        });
        
        if (error) {
          throw new Error(`Permintaan pembayaran gagal: ${error.message}`);
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
      Alert.alert('Error Pembayaran', `Terjadi kesalahan saat memproses pembayaran Anda: ${error.message || 'Kesalahan tidak diketahui'}`);
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
        paymentMethod={selectedPaymentMethod === 'shopee-1' ? 'Shopee' : 'OVO'}
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
          <Text style={styles.loadingText}>Memproses pembayaran...</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Konfirmasi dan bayar</Text>
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
          <Text style={styles.sectionTitle}>Tanggal</Text>
          <Text style={styles.sectionContent}>{formatTripDateForDisplay(tripDetails.date)}</Text>
          <Text style={styles.sectionContent}>{tripDetails.timeSlot}</Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Guests */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Tamu</Text>
          </View>
          <Text style={styles.sectionContent}>{tripDetails.guestCount} dewasa</Text>
          
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
                    Tamu {index + 1}{guest.name ? `: ${guest.name}` : ''}
                  </Text>
                  {guest.name ? (
                    <Text style={styles.guestItemSubtitle}>
                      {guest.title} • {guest.phoneNumber}
                    </Text>
                  ) : (
                    <Text style={styles.guestItemSubtitle}>
                      Ketuk untuk menambah detail
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
            <Text style={styles.sectionTitle}>Total harga</Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(totalPrice)} IDR</Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Cancellation Policy */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pembatalan gratis</Text>
          <Text style={styles.cancellationText}>
            {calculateCancellationDeadline(tripDetails.date)}
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
          <Text style={styles.sectionTitle}>Metode pembayaran</Text>
          <View style={styles.paymentMethodsContainer}>
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
                        {item.type === 'qris' ? (
                          <Image 
                            source={require('../../../assets/images/qris-logo.webp')} 
                            style={styles.paymentIcon} 
                            resizeMode="contain"
                          />
                        ) : (
                          <Image 
                            source={item.type === 'ovo' 
                              ? require('../../../assets/images/ovo-logo.webp')
                              : require('../../../assets/images/s-pay.webp')} 
                            style={styles.paymentIcon} 
                            resizeMode="contain"
                          />
                        )}
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
          <Text style={styles.sectionTitle}>Kupon</Text>
          <TouchableOpacity style={styles.couponButton}>
            <Text style={styles.couponButtonText}>Masukkan kupon</Text>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        {/* Price Details */}
        <View style={[styles.sectionContainer, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Detail harga</Text>
          <View style={styles.priceDetailsRow}>
            <Text style={styles.priceDetailsText}>{formatPrice(pricePerPerson)} x {tripDetails.guestCount} dewasa</Text>
            <Text style={styles.priceDetailsValue}>{formatPrice(totalPrice)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceDetailsRow}>
            <Text style={styles.totalText}>Total <Text style={styles.totalCurrency}>IDR</Text></Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>
        
        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Dengan memilih tombol, saya menyetujui <Text style={styles.termsLink}>syarat pemesanan</Text>, <Text style={styles.termsLink}>pelepasan dan penolakan</Text> dan <Text style={styles.termsLink}>Ketentuan Layanan yang diperbarui</Text>. Lihat <Text style={styles.termsLink}>Kebijakan Privasi</Text>.
          </Text>
        </View>
        </ScrollView>
        
        {/* Book Now Button */}
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookNowButtonText}>Pesan sekarang</Text>
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
            <Text style={styles.loadingOverlayText}>Memproses pemesanan Anda...</Text>
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
  qrisIconContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
