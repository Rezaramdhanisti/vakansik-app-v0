import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import Text from './Text';
import { FONTS } from '../config/fonts';

export interface PaymentNumberBottomSheetProps {
  onDismiss?: () => void;
  onSave: (paymentNumber: string) => void;
  initialPaymentNumber?: string;
  paymentMethod?: string;
}

export interface PaymentNumberBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const PaymentNumberBottomSheet = forwardRef<PaymentNumberBottomSheetRef, PaymentNumberBottomSheetProps>(({ 
  onDismiss, 
  onSave,
  initialPaymentNumber = '',
  paymentMethod = 'Shopee'
}, ref) => {
  // ref for bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  
  // variables for bottom sheet modal
  const snapPoints = useMemo(() => ['45%'], []);
  
  // State for payment number
  const [paymentNumber, setPaymentNumber] = useState(initialPaymentNumber);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
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
  
  // Validate payment number
  const validatePaymentNumber = (number: string) => {
    // Basic validation - can be enhanced based on specific requirements
    if (!number || number.trim() === '') {
      setIsValid(false);
      setErrorMessage('Nomor pembayaran wajib diisi');
      return false;
    }
    
    // For Shopee, ensure it's a valid phone number format
    if (paymentMethod === 'Shopee' || paymentMethod === 'GoPay') {
      // Simple validation for Indonesian phone numbers
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
      if (!phoneRegex.test(number.replace(/\s/g, ''))) {
        setIsValid(false);
        setErrorMessage('Masukkan nomor telepon yang valid');
        return false;
      }
    }
    
    setIsValid(true);
    setErrorMessage('');
    return true;
  };
  
  // Handle save
  const handleSave = () => {
    if (validatePaymentNumber(paymentNumber)) {
      onSave(paymentNumber);
      handleCloseModal();
    }
  };
  
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
  
  // Get the appropriate label based on payment method
  const getPaymentLabel = () => {
    switch (paymentMethod) {
      case 'Shopee':
        return 'Nomor Shopee Pay';
      case 'GoPay':
        return 'Nomor GoPay';
      default:
        return 'Nomor Pembayaran';
    }
  };
  
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      keyboardBehavior="interactive"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <BottomSheetView style={styles.bottomSheetContent} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.bottomSheetTitle}>Masukkan {getPaymentLabel()}</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.label}>{getPaymentLabel()}</Text>
            <TextInput
              style={[styles.input, !isValid && styles.inputError]}
              value={paymentNumber}
              onChangeText={(text) => {
                setPaymentNumber(text);
                if (!isValid) validatePaymentNumber(text);
              }}
              placeholder={`Masukkan nomor ${paymentMethod} Anda`}
              keyboardType="phone-pad"
              autoFocus
            />
            {!isValid && <Text style={styles.errorText}>{errorMessage}</Text>}
            
            <Text style={styles.infoText}>
              Kami memerlukan nomor {paymentMethod} Anda untuk memproses pembayaran. 
              Pastikan nomor tersebut terdaftar dengan akun {paymentMethod} Anda.
            </Text>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Lanjutkan ke Pembayaran</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000000',
  },
  contentContainer: {
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
});

export default PaymentNumberBottomSheet;
