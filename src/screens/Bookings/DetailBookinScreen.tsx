import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type DetailBookingScreenProps = {
  navigation: any;
  route: {
    params: {
      booking: {
        id: string;
        destination: string;
        title: string;
        date: string;
        time: string;
        host: string;
        status: string;
        image: any;
      };
    };
  };
};

function DetailBookingScreen({ navigation, route }: DetailBookingScreenProps): React.JSX.Element {
  const { booking } = route.params;
  
  // Mock data for the booking details
  const startTime = '6:00 AM';
  const endTime = '4:00 PM';
  const meetingPoint = 'Jalan Raya Toya Pakeh - Ped';
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/lovina-1.jpg')} 
            style={styles.mainImage} 
            resizeMode="cover" 
          />
          {booking.status === 'canceled' && (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledText}>Cancelled</Text>
            </View>
          )}
        </View>
        
        {/* Tour Title */}
        <View style={styles.contentContainer}>
          <Text style={styles.tourTitle}>{booking.title}</Text>
          <Text style={styles.tourInfo}>
            {startTime} · {booking.date} hours · Hosted by {booking.host}
          </Text>
          
          {/* Time Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Starts</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.dateText}>Wed, {booking.date}</Text>
              <Text style={styles.timeText}>{startTime}</Text>
            </View>
          </View>
          
          <View style={[styles.sectionContainer, styles.borderTop]}>
            <Text style={styles.sectionTitle}>Ends</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.dateText}>Wed, {booking.date}</Text>
              <Text style={styles.timeText}>{endTime}</Text>
            </View>
          </View>
          
          {/* Meeting Point */}
          <View style={[styles.sectionContainer, styles.borderTop]}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="location-outline" size={22} color="#333" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Where to meet</Text>
            </View>
            <Text style={styles.locationText}>{meetingPoint}</Text>
          </View>
          
          {/* What You'll Do */}
          <View style={[styles.sectionContainer, styles.borderTop]}>
            <View style={styles.iconTextContainer}>
              <MaterialIcons name="event-note" size={22} color="#333" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>What you'll do</Text>
            </View>
            <Text style={styles.descriptionText}>How you'll spend your time</Text>
          </View>
          
          {/* Your Experience */}
          <View style={[styles.sectionContainer, styles.borderTop]}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="boat-outline" size={22} color="#333" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Your experience</Text>
            </View>
            <Text style={styles.descriptionText}>Nusa Penida Day Tour With Snorkeling</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  cancelledBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  cancelledText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  contentContainer: {
    padding: 16,
  },
  tourTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
  },
  tourInfo: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 24,
  },
  sectionContainer: {
    paddingVertical: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
});

export default DetailBookingScreen;