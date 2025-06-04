import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Switch, SafeAreaView, ScrollView, Dimensions, Modal, TextInput } from 'react-native';
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

// Define guest interface
interface Guest {
  id: string;
  name: string;
  title: 'Tuan' | 'Nona' | '';
  phoneNumber: string;
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
  
  // Guest state management
  const [guests, setGuests] = useState<Guest[]>([
    { id: '1', name: '', title: 'Tuan', phoneNumber: '+62' },
    { id: '2', name: '', title: 'Tuan', phoneNumber: '+62' },
  ]);
  const [isGuestModalVisible, setIsGuestModalVisible] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [editedGuest, setEditedGuest] = useState<Guest | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
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
    // Validate guest information
    const incompleteGuests = guests.filter(guest => 
      !guest.name || guest.name.trim() === '' || 
      !guest.title || 
      guest.phoneNumber.length <= 3
    );
    
    if (incompleteGuests.length > 0) {
      setErrorMessage('Mohon lengkapi informasi semua tamu terlebih dahulu.');
      setIsErrorModalVisible(true);
      return;
    }
    
    // Handle booking logic here
    console.log('Booking confirmed');
  };
  
  // Guest modal functions
  const openGuestModal = (guest: Guest) => {
    setCurrentGuest(guest);
    setEditedGuest({...guest});
    setIsGuestModalVisible(true);
    setShowValidation(false);
  };
  
  const closeGuestModal = () => {
    setIsGuestModalVisible(false);
    setCurrentGuest(null);
    setEditedGuest(null);
    setShowValidation(false);
  };
  
  const handleSaveGuest = () => {
    setShowValidation(true);
    
    if (editedGuest && currentGuest && editedGuest.name && editedGuest.phoneNumber.length > 3) {
      setGuests(guests.map(guest => 
        guest.id === currentGuest.id ? editedGuest : guest
      ));
      closeGuestModal();
    }
  };
  
  const handleTitleChange = (title: 'Tuan' | 'Nona') => {
    if (editedGuest) {
      setEditedGuest({...editedGuest, title});
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Guest Details Modal */}
      <Modal
        visible={isGuestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeGuestModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              
              <Text style={styles.modalTitle}>Detail Pengunjung</Text>
              <TouchableOpacity onPress={closeGuestModal} style={styles.modalCloseButton}>
                <Ionicons name="close-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Pastikan mengisi detail pengunjung dengan benar untuk kelancaran acara.</Text>
              
              {/* Title Selection */}
              <View style={styles.titleSelectionContainer}>
                <TouchableOpacity 
                  style={[styles.titleOption]}
                  onPress={() => handleTitleChange('Tuan')}
                >
                  <View style={[styles.radioButton, editedGuest?.title === 'Tuan' ? styles.modalRadioButtonSelected : styles.radioButtonEmpty]}>
                    {editedGuest?.title === 'Tuan' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.titleText}>Tuan</Text>
                </TouchableOpacity>
                
                
                <TouchableOpacity 
                  style={[styles.titleOption, {marginLeft: 16}]}
                  onPress={() => handleTitleChange('Nona')}
                >
                  <View style={[styles.radioButton, editedGuest?.title === 'Nona' ? styles.modalRadioButtonSelected : styles.radioButtonEmpty]}>
                    {editedGuest?.title === 'Nona' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.titleText}>Nona</Text>
                </TouchableOpacity>
              </View>
              
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nama lengkap"
                  placeholderTextColor="#CCC"
                  value={editedGuest?.name}
                  onChangeText={(text) => editedGuest && setEditedGuest({...editedGuest, name: text})}
                />
              </View>
              {showValidation && (!editedGuest?.name || editedGuest.name.trim() === '') && <Text style={styles.inputLabel}>Isi nama pengunjung dulu, ya.</Text>}
              
              {/* Phone Input */}
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Image 
                    source={require('../../../assets/images/lovina-1.jpg')} 
                    style={styles.flagIcon} 
                    resizeMode="contain"
                  />
                  <Text style={styles.countryCode}>+62</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Nomor Ponsel"
                  placeholderTextColor="#CCC"
                  value={editedGuest?.phoneNumber.replace('+62', '')}
                  onChangeText={(text) => editedGuest && setEditedGuest({...editedGuest, phoneNumber: '+62' + text})}
                  keyboardType="phone-pad"
                />
              </View>
              {showValidation && (!editedGuest?.phoneNumber || editedGuest.phoneNumber.length <= 3) && <Text style={styles.inputLabel}>Isi nomor ponsel dulu, ya.</Text>}
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGuest}>
              <Text style={styles.saveButtonText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
      
      {/* Error Modal */}
      <Modal
        visible={isErrorModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsErrorModalVisible(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={[styles.errorModalContainer]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Perhatian</Text>
              <TouchableOpacity onPress={() => setIsErrorModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle" size={48} color="#FF5A5F" />
              </View>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={() => setIsErrorModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
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
    marginBottom: 8,
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
    backgroundColor: '#FF385C',
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
  errorModalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingBottom: 16,
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
