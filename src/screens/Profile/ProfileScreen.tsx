import React, { useContext, useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../navigation/AppNavigator';
import { supabase } from '../../../lib/supabase';
import userService from '../../services/userService';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import LogoutBottomSheet, { LogoutBottomSheetRef } from '../../components/LogoutBottomSheet';

function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Function to extract and format name from email
  const getUserDisplayName = (): string => {
    const email = userService.getUserEmail();
    if (!email) return 'Tamu';
    
    // Extract the part before @ symbol
    const username = email.split('@')[0];
    
    // Capitalize first letter and return
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  };
  
  // Reference to the logout bottom sheet
  const logoutBottomSheetRef = useRef<LogoutBottomSheetRef>(null);
  
  const handleLoginPress = () => {
    navigation.navigate('Auth' as never);
  };
  
  const handleLogoutPress = () => {
    // Show bottom sheet for logout confirmation
    logoutBottomSheetRef.current?.present();
  };

  const handleGetHelp = async () => {
    const phoneNumber = '087811047085';
    const text = 'Hello, I need help with Vakansik app.';
    
    // Create WhatsApp URL
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`;
    
    // Check if WhatsApp is installed
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // WhatsApp is not installed, show fallback message
      Alert.alert(
        'WhatsApp Not Found', 
        'Please install WhatsApp to contact our support team.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        Alert.alert('Logout Failed', error.message);
        return;
      }
      
      // Successfully logged out, update the auth context
      logout();
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      Alert.alert('Logout Failed', 'An unexpected error occurred during logout');
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {/* <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity> */}
      </View>
      
      <View style={styles.profileCardContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getUserDisplayName().charAt(0)}</Text>
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
              </View>
            </View>
            
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <Text style={styles.userType}>Guest</Text>
          </View>
          
          {/* <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Trips</Text>
              <View style={styles.statDivider} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Reviews</Text>
              <View style={styles.statDivider} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Years on Liburun</Text>
            </View>
          </View> */}
        </View>
      </View>
      
      {/* Menu Options */}
      <View style={styles.menuContainer}>
        {/* First Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleGetHelp}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Kontak bantuan</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        
          {/* <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>View profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity> */}
          
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Second Section */}
        <View style={styles.menuSection}>
          {/* <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Refer a friend</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity> */}
          
          {/* Login/Logout Button */}
          {isLoggedIn ? (
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleLogoutPress}
              disabled={isLoggingOut}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="log-out-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </Text>
              </View>
              {isLoggingOut && (
                <ActivityIndicator size="small" color="#FF6F00" />
              )}
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleLoginPress}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="log-in-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Log in</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Logout Bottom Sheet */}
      <LogoutBottomSheet
        ref={logoutBottomSheetRef}
        onLogout={handleLogoutConfirm}
      />
    </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginTop: 12,
    lineHeight: 40
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
    lineHeight: 40
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6F00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: 10,
    height: 30,
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  // Menu styles
  menuContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
});

export default ProfileScreen;
