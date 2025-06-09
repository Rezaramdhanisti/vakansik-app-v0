import React, { useState, useContext, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import VerificationCodeSheet, { VerificationCodeSheetRef } from '../../components/VerificationCodeSheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

type SignupScreenProps = {
  route: RouteProp<AuthStackParamList, 'Signup'>;
};

const SignupScreen = ({ route }: SignupScreenProps) => {
  const { email = '' } = route.params || {};
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [firstName, setFirstName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [userEmail, setUserEmail] = useState(email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Reference to the bottom sheet
  const verificationSheetRef = useRef<VerificationCodeSheetRef>(null);

  // Function to handle opening the bottom sheet
  const handlePresentModalPress = useCallback(() => {
    verificationSheetRef.current?.present();
  }, []);

  // Function to handle dismissing the bottom sheet
  const handleDismissModalPress = useCallback(() => {
    verificationSheetRef.current?.dismiss();
  }, []);

  // Function to handle verification completion
  const handleVerificationComplete = useCallback((code: string) => {
    console.log('Verification completed with code:', code);
    verificationSheetRef.current?.dismiss();
    // TODO: Handle verification logic
    // Navigate back to login after successful verification
    navigation.navigate('Login');
  }, [navigation]);

  // Function to complete the signup process
  const completeSignup = () => {
    console.log('Signup completed with:', { firstName, userEmail, password });
    // Update auth context or navigate to the main app
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    
    // Validate form fields
    if (!firstName || !userEmail || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    // if (!agreeToTerms) {
    //   Alert.alert('Terms Agreement', 'You must agree to the terms to continue');
    //   return;
    // }

    // Show verification code bottom sheet
    handlePresentModalPress();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Text style={styles.title}>Finish signing up</Text>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Nama lengkap</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Nama lengkap"
                value={firstName}
                onChangeText={setFirstName}
              />
             
              <Text style={styles.helperText}>
                Seperti di KTP/SIM/Paspor
              </Text>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Nomor HP</Text>
              <TextInput
                style={styles.input}
                placeholder="Nomor HP"
                value={birthday}
                onChangeText={setBirthday}
              />
           
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={userEmail}
                onChangeText={setUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                We'll email you a reservation confirmation.
              </Text>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Kata sandi</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Kata sandi"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.showPasswordButton} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By selecting <Text style={styles.boldText}>Agree and continue</Text>, I agree to Airbnb's{' '}
                <Text style={styles.linkText}>Terms of Service</Text>,{' '}
                <Text style={styles.linkText}>Payments Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Nondiscrimination Policy</Text>, and acknowledge the{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleSignup}
            >
              <Text style={styles.continueButtonText}>Agree and continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Verification Code Bottom Sheet */}
        <VerificationCodeSheet
          ref={verificationSheetRef}
          email={userEmail}
          onVerificationComplete={handleVerificationComplete}
          onDismiss={handleDismissModalPress}
        />
      </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },
  inputTop: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  inputBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  helperText: {
    fontSize: 14,
    color: '#717171',
    marginTop: 8,
  },
  linkText: {
    color: '#000',
    textDecorationLine: 'underline',
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  showPasswordButton: {
    paddingHorizontal: 16,
  },
  showPasswordText: {
    color: '#000',
    fontWeight: '500',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#484848',
  },
  boldText: {
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#E61E4D',
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

export default SignupScreen;
