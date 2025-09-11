import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';

// Mock data from your example
const mockPaymentData = {
  "payment_request_id": "pr-55bf092d-e01a-4367-a381-37ecfb1800d0",
  "country": "ID",
  "currency": "IDR",
  "business_id": "68759d3f0f4941a8fd17bec0",
  "reference_id": "ORDER-12345",
  "created": "2025-09-09T04:58:33.041Z",
  "updated": "2025-09-09T04:58:33.041Z",
  "status": "REQUIRES_ACTION",
  "capture_method": "AUTOMATIC",
  "channel_code": "QRIS",
  "request_amount": 150000,
  "channel_properties": {
    "expires_at": "2025-11-12T04:58:33.121193Z"
  },
  "type": "PAY",
  "actions": [
    {
      "type": "PRESENT_TO_CUSTOMER",
      "descriptor": "QR_STRING",
      "value": "00020101021226650013CO.XENDIT.WWW01189360084800000056450215HC6MpttQKhvV34D0303UME51370014ID.CO.QRIS.WWW0215ID202543326949052045099530336054061500005802ID5908Vakansik6015JAKARTA SELATAN61051242062290525XHkXHLmaL6RFacBkSxbzS4GQ4630484D6"
    }
  ]
};

const QRISPaymentTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | 'expired'>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [isQRReady, setIsQRReady] = useState(false);
  const qrCodeRef = useRef<any>(null);
  const viewShotRef = useRef<ViewShot>(null);
  
  // Get QR string from actions
  const qrAction = mockPaymentData.actions.find(action => 
    action.type === 'PRESENT_TO_CUSTOMER' && action.descriptor === 'QR_STRING'
  );
  const qrString = qrAction?.value || '';
  
  // Calculate expiration time - 10 minutes from now
  const initialTimeRemaining = 10 * 60; // 10 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialTimeRemaining);
  
  useEffect(() => {
    // Set QR as ready after a short delay to ensure it's rendered
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
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handlePaymentSuccess = () => {
    setPaymentStatus('completed');
  };
  
  const handlePaymentFailed = () => {
    setPaymentStatus('failed');
  };
  
  const handleRetryPayment = () => {
    setPaymentStatus('pending');
    setTimeLeft(initialTimeRemaining);
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
            <TouchableOpacity style={styles.continueButton} onPress={() => navigation.goBack()}>
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
                Rp{mockPaymentData.request_amount.toLocaleString('id-ID')}
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
                <Text style={styles.paymentInfoValue}>{mockPaymentData.reference_id}</Text>
              </View>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Payment Method:</Text>
                <Text style={styles.paymentInfoValue}>QRIS</Text>
              </View>
            </View>
            
            {/* Test buttons for demonstration */}
            <View style={styles.testButtonsContainer}>
              <Text style={styles.testButtonsTitle}>Test Buttons (Demo Only)</Text>
              <View style={styles.testButtonsRow}>
                <TouchableOpacity style={styles.testButtonSuccess} onPress={handlePaymentSuccess}>
                  <Text style={styles.testButtonText}>Simulate Success</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.testButtonFailed} onPress={handlePaymentFailed}>
                  <Text style={styles.testButtonText}>Simulate Failed</Text>
                </TouchableOpacity>
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
        <Text style={styles.headerTitle}>QRIS Payment Test</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        style={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Trip Details */}
        <View style={styles.tripDetailsContainer}>
          <Text style={styles.tripTitle}>Explore Bali Highlights - Customized Full day Tour</Text>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Date:</Text>
            <Text style={styles.tripInfoValue}>Saturday, Jun 28, 2025</Text>
          </View>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Time:</Text>
            <Text style={styles.tripInfoValue}>3:30 AM – 11:45 AM</Text>
          </View>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Guests:</Text>
            <Text style={styles.tripInfoValue}>2 adults</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Payment Content */}
        {renderPaymentContent()}
      </ScrollView>
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
  placeholder: {
    width: 32,
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
    marginBottom: 24,
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
  },
  testButtonsContainer: {
    width: '100%',
    marginTop: 16,
  },
  testButtonsTitle: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  testButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testButtonSuccess: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonFailed: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FFFFFF',
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
});

export default QRISPaymentTestScreen;
