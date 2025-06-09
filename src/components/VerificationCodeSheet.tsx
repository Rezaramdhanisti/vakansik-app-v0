import React, { useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
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
    const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
    
    // ref for bottom sheet modal
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    
    // variables for bottom sheet modal
    const snapPoints = useMemo(() => ['60%'], []);
    
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
        // Focus on the first input after a short delay
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      }
    }));

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1 && onDismiss) {
        onDismiss();
      } else if (index === 0) {
        // Focus on the first input when the sheet is opened
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300); // Small delay to ensure the sheet is fully opened
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
      
      // Auto-advance to next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (text && index === 5) {
        // Last digit entered
        Keyboard.dismiss();
      }
    };
    
    // Define handleCodeComplete before using it in useEffect
    const handleCodeComplete = useCallback(() => {
      const code = verificationCode.join('');
      if (code.length === 6) {
        // Validate the code - correct code is 111111
        if (code === '111111') {
          setIsCodeIncorrect(false);
          onVerificationComplete(code);
        } else {
          setIsCodeIncorrect(true);
          // Reset the code fields
          setVerificationCode(Array(6).fill(''));
          // Focus on the first input field
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 100);
        }
      }
    }, [verificationCode, onVerificationComplete]);
    
    // Watch for complete code
    useEffect(() => {
      if (verificationCode.every(digit => digit !== '') && verificationCode.join('').length === 6) {
        handleCodeComplete();
      }
    }, [verificationCode, handleCodeComplete]);

    const handleKeyPress = (e: any, index: number) => {
      // Handle backspace
      if (e.nativeEvent.key === 'Backspace' && index > 0 && verificationCode[index] === '') {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handleResendCode = () => {
      // Implement resend code logic here
      // Reset error state when resending code
      setIsCodeIncorrect(false);
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
          
          {isCodeIncorrect ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#C43E00" />
              <Text style={styles.errorText}>The code you provided is incorrect. Please try again.</Text>
            </View>
          ) : null}
          
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
    color: '#666',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFEA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#C43E00',
    marginLeft: 8,
    fontSize: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
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
