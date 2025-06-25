import React, { useState, useContext, useEffect } from 'react';
import { GOOGLE_WEB_CLIENT_ID_DEV } from '@env';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../../navigation/AppNavigator';
import { AuthStackParamList, MainStackParamList, TabStackParamList } from '../../navigation/types';
import { SearchStackParamList } from '../../navigation/SearchNavigator';
import { supabase } from '../../../lib/supabase';

const LoginScreenEmail = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get navigation and route params with proper typing
  type NavigationProp = CompositeNavigationProp<
    StackNavigationProp<AuthStackParamList>,
    CompositeNavigationProp<
      StackNavigationProp<MainStackParamList>,
      CompositeNavigationProp<
        BottomTabNavigationProp<TabStackParamList>,
        StackNavigationProp<SearchStackParamList>
      >
    >
  >;
  const navigation = useNavigation<NavigationProp>();
  
  const { login } = useContext(AuthContext);

  const handleContinue = async () => {
    // Reset error message
    setErrorMessage(null);
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    // Basic password validation
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      
      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      login(); // Update auth context
        // Otherwise just go back to the previous screen
      navigation.goBack();
      navigation.goBack();
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log in</Text>
          <View style={styles.placeholderView} />
        </View>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/coming-soon.webp')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9E9E9E"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#717171" />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          
       
         
          <TouchableOpacity 
            style={[styles.continueButton, loading && styles.disabledButton]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Log in</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Lupa password? </Text>
            <TouchableOpacity onPress={() => {/* TODO: Add ForgotPassword route */}}>
              <Text style={styles.signupLink}>klik disini</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholderView: {
    width: 40,
  },
  closeButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    flex: 1,
    color: '#000000',
  },
  eyeIcon: {
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 240,
  },
  logoText: {
    fontSize: 24,
    color: '#333',
    marginTop: -20
  },
  continueButton: {
    backgroundColor: '#FF6F00',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#FFBE80',
  },
  errorContainer: {
    backgroundColor: '#FFF8F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C43E00',
    fontSize: 14,
  },
  divider: {
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#717171',
  },
  socialButton: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12
  },
  signupText: {
    fontSize: 16,
    color: '#717171',
  },
  signupLink: {
    fontSize: 16,
    color: '#FF6F00',
    fontWeight: '600',
  },
});

export default LoginScreenEmail;
