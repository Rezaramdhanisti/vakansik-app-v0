/**
 * MyTravel App
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, Linking } from 'react-native';
import { supabase } from './lib/supabase';

// Import the AppNavigator
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  useEffect(() => {
    // Handle deep links for Supabase authentication
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      // Check if the URL is a Supabase auth callback
      if (url.includes('auth/callback')) {
        try {
          // Extract the auth parameters from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: url.split('access_token=')[1].split('&')[0],
            refresh_token: url.split('refresh_token=')[1].split('&')[0],
          });
          
          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Auth session set successfully:', data);
          }
        } catch (error) {
          console.error('Failed to process auth callback:', error);
        }
      }
    };

    // Add event listener for deep links when the app is already open
    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle deep links that opened the app from a closed state
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      // Clean up the event listener
      linkingListener.remove();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF7E5F" />
      <AppNavigator />
    </>
  );
}

export default App;
