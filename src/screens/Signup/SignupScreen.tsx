import React, { useState, useContext, useEffect } from 'react';
import { GOOGLE_WEB_CLIENT_ID_DEV, IOS_CLIENT_ID_DEV } from '@env';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../../navigation/AppNavigator';
import { AuthStackParamList, MainStackParamList, TabStackParamList } from '../../navigation/types';
import { SearchStackParamList } from '../../navigation/SearchNavigator';
import { supabase } from '../../../lib/supabase';

const SignupScreen = () => {
  // Configure Google Sign-In on component mount
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: GOOGLE_WEB_CLIENT_ID_DEV,
      iosClientId: IOS_CLIENT_ID_DEV, 
    });
  }, []);
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      const userInfo = await GoogleSignin.signIn();
      
      // Get the ID token
      const { idToken } = await GoogleSignin.getTokens();
      
      // Check if we have an ID token
      if (idToken) {
        
        // Sign in to Supabase with the Google ID token
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        
        login(); // Update auth context
        navigation.goBack(); // Return
        navigation.goBack();
      } else {
        throw new Error('No ID token present!');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage('Google Play Services not available or outdated');
      } else {
        setErrorMessage('Google Sign-In failed: ' + (error.message || 'Unknown error'));
      }
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
          <Text style={styles.headerTitle}>Sign up</Text>
          <View style={styles.placeholderView} />
        </View>
       
        
        <View style={styles.content}>
          {/* Centered Login Text */}
         
          {/* Vakansik Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/chicken-piggy.webp')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Vakansik</Text>
          </View>
          
      
          {/* Email Sign In Button */}
          <TouchableOpacity 
            style={styles.emailButton}
            onPress={() => navigation.navigate('SignupEmail', {})}
            disabled={loading}
          >
            <Ionicons name="mail-outline" size={22} color="#000" />
            <Text style={styles.emailButtonText}>Continue with email</Text>
          </TouchableOpacity>
          
          {/* Google Sign In Button */}
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Image 
              source={require('../../../assets/images/google-logo.webp')} 
              style={styles.googleLogo} 
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Udah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.signupLink}>Login, yuk!</Text>
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
  keyboardAvoidView: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center', // Center content horizontally
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  emailButton: {
    backgroundColor: '#E9E9E9',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
    flexDirection: 'row',
    width: '100%',
  },
  emailButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    width: '100%',
  },
  googleLogo: {
    width: 20,
    height: 20,
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
    marginTop: 10,
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

export default SignupScreen;
