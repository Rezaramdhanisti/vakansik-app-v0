import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { AuthContext } from '../../navigation/AppNavigator';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import supabase from '../../services/supabaseClient';

interface QRISPaymentScreenProps {
  route: {
    params: {
      paymentData: {
        payment_request_id: string;
        country: string;
        currency: string;
        business_id: string;
        reference_id: string;
        created: string;
        updated: string;
        status: string;
        capture_method: string;
        channel_code: string;
        request_amount: number;
        channel_properties: {
          expires_at: string;
        };
        type: string;
        actions: Array<{
          type: string;
          descriptor: string;
          value: string;
        }>;
      };
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
      orderId: string;
    };
  };
}

const QRISPaymentScreen: React.FC<QRISPaymentScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | 'expired'>('pending');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isQRReady, setIsQRReady] = useState(false);
  const qrCodeRef = useRef<any>(null);
  const viewShotRef = useRef<ViewShot>(null);
  
  const { paymentData, tripDetails, orderId } = route.params;
  
  // Debug logging
  console.log('QRIS Payment Screen - Received data:', {
    paymentData,
    tripDetails,
    orderId
  });
  
  // Safety check for paymentData
  if (!paymentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Payment Data Not Found</Text>
          <Text style={styles.errorMessage}>
            Unable to load payment information. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get QR string from actions
  const qrAction = paymentData?.actions?.find(action => 
    action.type === 'PRESENT_TO_CUSTOMER' && action.descriptor === 'QR_STRING'
  );
  const qrString = qrAction?.value || '';
  
  // Calculate expiration time - 10 minutes from now
  const initialTimeRemaining = 10 * 60; // 10 minutes in seconds
  
  const [timeLeft, setTimeLeft] = useState(initialTimeRemaining);
  
  // Set QR as ready after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsQRReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setPaymentStatus('expired');
    }
  }, [timeLeft, paymentStatus]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Check payment status periodically
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (paymentStatus !== 'pending') return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();
        
        if (error) {
          console.error('Error checking payment status:', error);
          return;
        }
        
        if (data) {
          switch (data.status) {
            case 'COMPLETED':
              setPaymentStatus('completed');
              break;
            case 'FAILED':
              setPaymentStatus('failed');
              break;
            case 'EXPIRED':
              setPaymentStatus('expired');
              break;
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };
    
    // Check every 5 seconds
    const interval = setInterval(checkPaymentStatus, 5000);
    
    return () => clearInterval(interval);
  }, [orderId, paymentStatus]);
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handlePaymentSuccess = () => {
    // Navigate to Bookings tab and then to DetailBookingScreen
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
          params: { orderId: orderId },
        }),
      });
    }, 100);
  };
  
  const handleRetryPayment = () => {
    navigation.goBack();
  };
  
  const handleCancelPayment = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), we don't need storage permissions for CameraRoll
        // CameraRoll handles permissions internally
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleSaveToGallery = async () => {
    if (!viewShotRef.current) {
      Alert.alert('Error', 'QR code is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      setIsSaving(true);
      
      // Request permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to save the QR code');
        return;
      }
      
      // Add a small delay to ensure QR code is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the QR code view as an image
      if (!viewShotRef.current) {
        Alert.alert('Error', 'ViewShot ref is not available');
        return;
      }
      const uri = await (viewShotRef.current as any).capture();
      
      if (!uri) {
        Alert.alert('Error', 'Failed to capture QR code image. Please try again.');
        return;
      }
      
      // Save directly to gallery
      await CameraRoll.save(uri, { type: 'photo' });
      
      Alert.alert('Success', 'QR code saved to gallery successfully!');
      
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code to gallery');
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderPaymentContent = () => {
    switch (paymentStatus) {
      case 'completed':
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </Text>
            <TouchableOpacity style={styles.continueButton} onPress={handlePaymentSuccess}>
              <Text style={styles.continueButtonText}>Continue to Bookings</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'failed':
        return (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="close-circle" size={80} color="#F44336" />
            </View>
            <Text style={styles.errorTitle}>Payment Failed</Text>
            <Text style={styles.errorMessage}>
              Your payment could not be processed. Please try again or use a different payment method.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetryPayment}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'expired':
        return (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="time-outline" size={80} color="#FF9800" />
            </View>
            <Text style={styles.errorTitle}>Payment Expired</Text>
            <Text style={styles.errorMessage}>
              This payment request has expired. Please create a new payment request.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetryPayment}>
              <Text style={styles.retryButtonText}>Create New Payment</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return (
          <View style={styles.qrContainer}>
            <Text style={styles.instructionTitle}>Scan QR Code to Pay</Text>
            <Text style={styles.instructionText}>
              Open your mobile banking app or e-wallet and scan the QR code below to complete your payment.
            </Text>
            
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 0.9 }}
              style={styles.qrCodeContainer}
            >
              <QRCode
                ref={qrCodeRef}
                value={qrString}
                size={250}
                color="#000000"
                backgroundColor="#FFFFFF"
                logoSize={30}
                logoMargin={2}
                logoBorderRadius={15}
                quietZone={10}
              />
            </ViewShot>
            
            <TouchableOpacity 
              style={[styles.saveButton, !isQRReady && styles.saveButtonDisabled]} 
              onPress={handleSaveToGallery}
              disabled={isSaving || !isQRReady}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : !isQRReady ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Loading QR...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save to Gallery</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>
                Rp{paymentData.request_amount ? paymentData.request_amount.toLocaleString('id-ID') : '0'}
              </Text>
            </View>
            
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={20} color="#FF6F00" />
              <Text style={styles.timerText}>
                Expires in {formatTime(timeLeft)}
              </Text>
            </View>
            
            <View style={styles.paymentInfoContainer}>
              <Text style={styles.paymentInfoTitle}>Payment Information</Text>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Order ID:</Text>
                <Text style={styles.paymentInfoValue}>{paymentData?.reference_id || 'N/A'}</Text>
              </View>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Payment Method:</Text>
                <Text style={styles.paymentInfoValue}>QRIS</Text>
              </View>
            </View>
          </View>
        );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QRIS Payment</Text>
        {/* <TouchableOpacity onPress={handleCancelPayment} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity> */}
      </View>
      
      <ScrollView
        style={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Trip Details */}
        <View style={styles.tripDetailsContainer}>
          <Text style={styles.tripTitle}>{tripDetails.title}</Text>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Date:</Text>
            <Text style={styles.tripInfoValue}>{tripDetails.date}</Text>
          </View>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Time:</Text>
            <Text style={styles.tripInfoValue}>{tripDetails.timeSlot}</Text>
          </View>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Guests:</Text>
            <Text style={styles.tripInfoValue}>{tripDetails.guestCount} adults</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Payment Content */}
        {renderPaymentContent()}
      </ScrollView>
      
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
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
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FF6F00',
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  tripDetailsContainer: {
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 12,
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tripInfoLabel: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  tripInfoValue: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  qrContainer: {
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#FF6F00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  timerText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FF6F00',
    marginLeft: 8,
  },
  paymentInfoContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 12,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentInfoLabel: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  paymentInfoValue: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    maxWidth: '70%',
    textAlign: 'right',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
});

export default QRISPaymentScreen;
