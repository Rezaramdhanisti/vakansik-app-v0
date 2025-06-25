import { BackHandler, ToastAndroid, Platform } from 'react-native';

interface DoubleBackExitOptions {
  /** Message to show when back is pressed once */
  message?: string;
  /** Duration for the toast message */
  toastDuration?: number;
  /** Timeout in ms after which the first back press is reset */
  resetTimeout?: number;
  /** Optional callback to execute when app is about to exit */
  onExit?: () => void;
}

/**
 * Utility to handle double back press to exit app on Android
 * @param options Configuration options for the back handler
 * @returns Function to remove the back handler when component unmounts
 */
export const setupDoubleBackExit = (options?: DoubleBackExitOptions): (() => void) | null => {
  // Early return if not on Android platform
  if (Platform.OS !== 'android') {
    return null;
  }
  
  // Default options
  const {
    message = 'Press back again to exit',
    toastDuration = ToastAndroid.SHORT,
    resetTimeout = 2000,
    onExit
  } = options || {};
  
  let backPressedOnce = false;
  let backPressTimeout: NodeJS.Timeout | null = null;

  const handleBackPress = () => {
    if (backPressedOnce) {
      // Second press within the timeout period - exit the app
      if (onExit) {
        onExit();
      }
      BackHandler.exitApp();
      return true;
    }

    // First press - show toast and set flag
    backPressedOnce = true;
    ToastAndroid.show(message, toastDuration);
    
    // Reset the flag after specified timeout
    backPressTimeout = setTimeout(() => {
      backPressedOnce = false;
    }, resetTimeout);
    
    return true;
  };

  // Add event listener for hardware back button press
  const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

  // Return cleanup function
  return () => {
    subscription.remove();
    
    if (backPressTimeout) {
      clearTimeout(backPressTimeout);
    }
  };
};
