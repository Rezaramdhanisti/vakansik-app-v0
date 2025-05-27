import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Pressable, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import Text from './Text';
import { FONTS } from '../config/fonts';
import { ScrollView } from 'react-native-gesture-handler';

export interface ConfirmAndPayBottomSheetProps {
  onDismiss?: () => void;
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
}

export interface ConfirmAndPayBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const ConfirmAndPayBottomSheet = forwardRef<ConfirmAndPayBottomSheetRef, ConfirmAndPayBottomSheetProps>(
  ({ onDismiss, tripDetails = {
    title: 'Explore Bali Highlights -Customized Full day Tour',
    image: require('../assets/images/bali-temple.jpg'),
    rating: 4.9,
    reviewCount: 5098,
    date: 'Saturday, Jun 28, 2025',
    timeSlot: '3:30 AM – 11:45 AM',
    price: 'Rp780,000',
    guestCount: 2
  } }, ref) => {
    // ref for bottom sheet modal
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    
    // variables for bottom sheet modal
    const snapPoints = useMemo(() => ['90%'], []);
    
    // State for private booking
    const [isPrivate, setIsPrivate] = useState(false);
    
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      }
    }));
    
    // callbacks for bottom sheet modal
    const handleSheetChanges = useCallback((index: number) => {
      // If sheet is closed (index -1), call onDismiss
      if (index === -1 && onDismiss) {
        onDismiss();
      }
    }, [onDismiss]);
    
    const handleCloseModal = useCallback(() => {
      bottomSheetModalRef.current?.dismiss();
      if (onDismiss) {
        onDismiss();
      }
    }, [onDismiss]);
    
    // Backdrop component for the bottom sheet
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          style={[props.style]}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );
    
    const togglePrivateBooking = () => {
      setIsPrivate(!isPrivate);
    };
    
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.bottomSheetContent} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.bottomSheetTitle}>Confirm and pay</Text>
            <TouchableOpacity onPress={handleCloseModal}>
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
                <TouchableOpacity style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionContent}>{tripDetails.guestCount} adults</Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Price */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Total price</Text>
                <TouchableOpacity style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Details</Text>
                </TouchableOpacity>
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
            <View style={styles.sectionContainer}>
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
            </View>
            
            <View style={styles.divider} />
            
            {/* Payment Method */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Payment method</Text>
              <TouchableOpacity style={styles.paymentMethodButton}>
                <View style={styles.paymentMethodContent}>
                  <Ionicons name="card-outline" size={24} color="#000" />
                  <Text style={styles.paymentMethodText}>Add payment method</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Book Now Button */}
          <View style={styles.bookButtonContainer}>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book now</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
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
  paymentMethodButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    marginLeft: 12,
  },
  bookButtonContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bookButton: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
});

export default ConfirmAndPayBottomSheet;
