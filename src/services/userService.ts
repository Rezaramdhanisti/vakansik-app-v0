import { MMKV } from 'react-native-mmkv';
import supabase from './supabaseClient';

// Initialize MMKV storage for user data
const userStorage = new MMKV({
  id: 'user-storage',
});

// Keys for storage
const USER_ID_KEY = 'user_id';
const USER_EMAIL_KEY = 'user_email';

/**
 * Service to handle user-related operations and storage
 */
const userService = {
  /**
   * Store user data in MMKV storage
   */
  storeUserData: (userId: string, email?: string) => {
    userStorage.set(USER_ID_KEY, userId);
    if (email) {
      userStorage.set(USER_EMAIL_KEY, email);
    }
  },

  /**
   * Get the current user ID from storage
   */
  getUserId: (): string | null => {
    return userStorage.getString(USER_ID_KEY) || null;
  },

  /**
   * Get the current user email from storage
   */
  getUserEmail: (): string | null => {
    return userStorage.getString(USER_EMAIL_KEY) || null;
  },

  /**
   * Clear user data from storage (for logout)
   */
  clearUserData: () => {
    userStorage.delete(USER_ID_KEY);
    userStorage.delete(USER_EMAIL_KEY);
  },

  /**
   * Check if user is logged in by checking if user ID exists in storage
   */
  isLoggedIn: (): boolean => {
    return !!userStorage.getString(USER_ID_KEY);
  },

  /**
   * Initialize user data from Supabase session
   * Returns true if user is logged in, false otherwise
   */
  initializeFromSession: async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userStorage.set(USER_ID_KEY, user.id);
        if (user.email) {
          userStorage.set(USER_EMAIL_KEY, user.email);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing user data:', error);
      return false;
    }
  }
};

export default userService;
