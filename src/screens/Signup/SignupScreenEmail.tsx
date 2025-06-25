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
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import VerificationCodeSheet, { VerificationCodeSheetRef } from '../../components/VerificationCodeSheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { supabase } from '../../../lib/supabase';

interface SignupScreenProps {
  route: RouteProp<AuthStackParamList, 'SignupEmail'>;
};

const SignupScreenEmail = ({ route }: SignupScreenProps) => {
  const { email = '' } = route.params || {};
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [userEmail, setUserEmail] = useState(email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Function to handle continue button press in the verification sheet
  const handleContinue = useCallback(() => {
    console.log('User continued from verification screen');
    verificationSheetRef.current?.dismiss();
    // Navigate back to login after dismissing the verification popup
    navigation.pop(2)
  }, [navigation]);


  const handleSignup = async () => {
    // Validate form fields
    if (!firstName || !userEmail || !password || !phone) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          emailRedirectTo: 'com.vakansik.capy://auth/callback', // your deep link with correct package name
          data: {
            fullname: firstName,
            phone,
          },
        },
      });
      
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      
      // Show verification code bottom sheet
      handlePresentModalPress();
      
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during signup');
    } finally {
      setLoading(false);
    }
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
              placeholderTextColor="#9E9E9E"
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
                value={phone}
              placeholderTextColor="#9E9E9E"
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
           
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
              placeholderTextColor="#9E9E9E"
                value={userEmail}
                onChangeText={setUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Kata sandi</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Kata sandi"
                  value={password}
                  onChangeText={setPassword}
              placeholderTextColor="#9E9E9E"
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
              style={[styles.continueButton, loading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.continueButtonText}>Agree and continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Verification Success Bottom Sheet */}
        <VerificationCodeSheet
          ref={verificationSheetRef}
          email={userEmail}
          onContinue={handleContinue}
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
    backgroundColor: '#FF6F00',
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
  disabledButton: {
    backgroundColor: '#f5a5b5',
  },
});

export default SignupScreenEmail;
