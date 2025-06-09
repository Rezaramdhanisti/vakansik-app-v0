import React, { useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
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
  onVerificationComplete: (code: string) => void;
  onDismiss?: () => void;
}

export interface VerificationCodeSheetRef {
  present: () => void;
  dismiss: () => void;
}

const VerificationCodeSheet = forwardRef<VerificationCodeSheetRef, VerificationCodeSheetProps>(
  ({ email, onVerificationComplete, onDismiss }, ref) => {
    const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
    
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
    
    const handleCodeChange = (text: string, index: number) => {
      // Only allow numbers
      if (!/^\d*$/.test(text)) return;

      const newCode = [...verificationCode];
      newCode[index] = text;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if code is complete
      if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
        Keyboard.dismiss();
        onVerificationComplete(newCode.join(''));
      }
    };

    const handleKeyPress = (e: any, index: number) => {
      // Handle backspace
      if (e.nativeEvent.key === 'Backspace' && index > 0 && verificationCode[index] === '') {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handleResendCode = () => {
      // Implement resend code logic here
      console.log('Resending verification code to', email);
    };

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
            <Text style={styles.title}>Enter your verification code</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Enter the code we emailed to {email}.
          </Text>
          
          <View style={styles.codeContainer}>
            {Array(6).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref: TextInput | null) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  verificationCode[index] ? styles.codeInputFilled : {},
                  index === 0 ? styles.codeInputActive : {}
                ]}
                value={verificationCode[index]}
                onChangeText={text => handleCodeChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't get an email?{' '}
              <Text style={styles.resendLink} onPress={handleResendCode}>
                Try again
              </Text>
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#484848',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
  codeInputFilled: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  codeInputActive: {
    borderWidth: 2,
    borderColor: '#000',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#484848',
  },
  resendLink: {
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default VerificationCodeSheet;
