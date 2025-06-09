import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetView,
  BottomSheetBackdrop, 
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Text from './Text';

export interface VerificationCodeSheetProps {
  email: string;
  onDismiss?: () => void;
  onContinue?: () => void;
}

export interface VerificationCodeSheetRef {
  present: () => void;
  dismiss: () => void;
}

const VerificationCodeSheet = forwardRef<VerificationCodeSheetRef, VerificationCodeSheetProps>(
  ({ email, onDismiss, onContinue }, ref) => {
    // ref for bottom sheet modal
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    
    // variables for bottom sheet modal
    const snapPoints = useMemo(() => ['60%'], []);
    
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
      >
        <BottomSheetView style={styles.container} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Check your email</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#00A699" style={styles.successIcon} />
            
            <Text style={styles.successTitle}>Verification email sent!</Text>
            
            <Text style={styles.subtitle}>
              We've sent a verification email to{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <Text style={styles.instructionText}>
              Please check your inbox and click the verification link to complete your registration.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#DDDDDD',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#484848',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerificationCodeSheet;
