import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';

function ProfileScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen;
