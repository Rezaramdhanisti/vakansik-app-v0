import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetView,
  BottomSheetBackdrop, 
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Text from './Text';
import { FONTS } from '../config/fonts';

export interface PaymentSuccessBottomSheetProps {
  onDismiss?: () => void;
  onContinue?: () => void;
}

export interface PaymentSuccessBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const PaymentSuccessBottomSheet = forwardRef<PaymentSuccessBottomSheetRef, PaymentSuccessBottomSheetProps>(
  ({ onDismiss, onContinue }, ref) => {
    // ref for bottom sheet modal
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    
    // variables for bottom sheet modal
    const snapPoints = useMemo(() => ['55%'], []);
    
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      }
    }));

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1 && onDismiss) {
        onDismiss();
      }
    }, [onDismiss]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleCloseModal = useCallback(() => {
      if (onDismiss) {
        onDismiss();
      }
      bottomSheetModalRef.current?.dismiss();
    }, [onDismiss]);
    
    const handleContinue = useCallback(() => {
      if (onContinue) {
        onContinue();
      }
      bottomSheetModalRef.current?.dismiss();
    }, [onContinue]);

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.container} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Pembayaran Berhasil</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#00A699" style={styles.successIcon} />
            
            <Text style={styles.successTitle}>Pembayaran Selesai!</Text>
            
            <Text style={styles.subtitle}>
              Pembayaran Anda telah berhasil diproses.
            </Text>
            
            <Text style={styles.instructionText}>
              Anda dapat melihat detail pemesanan di tab Bookings.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Lanjutkan</Text>
          </TouchableOpacity>
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
  indicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  container: {
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
  title: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000000',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
});

export default PaymentSuccessBottomSheet;
