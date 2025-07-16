import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getOrderDetail, OrderDetail } from '../../services/orderService';
import dayjs from 'dayjs';

type DetailBookingScreenProps = {
  navigation: any;
  route: {
    params: {
      orderId: string;
    };
  };
};

function DetailBookingScreen({ navigation, route }: DetailBookingScreenProps): React.JSX.Element {
  const { orderId } = route.params;
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const detail = await getOrderDetail(orderId);
        if (detail) {
          setOrderDetail(detail);
        } else {
          setError('Could not find order details');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetail();
  }, [orderId]);
  
  
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
          {loading ? (
            <View style={[styles.mainImage, styles.loadingImageContainer]}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          ) : (
            <Image 
              source={orderDetail?.image_url ? { uri: orderDetail.image_url } : require('../../../assets/images/lovina-1.jpg')} 
              style={styles.mainImage} 
              resizeMode="cover" 
              borderRadius={16}
            />
          )}
         
        </View>
        
        {/* Tour Title */}
        <View style={styles.contentContainer}>
          <Text style={styles.tourTitle}>
            {loading ? 'Loading...' : orderDetail?.name || 'Loading destination...'}
          </Text>
          <Text style={styles.tourInfo}>
            {dayjs(orderDetail?.trip_date, 'YYYY-MM-DD').format('dddd, MMMM D YYYY')} 
          </Text>
          {/* Time Section - Card with Start and End */}
          {/* <View style={styles.timeCardContainer}>
            <View style={styles.timeCard}>
              <View style={styles.timeSection}>
                <Text style={styles.timeSectionTitle}>Starts</Text>
                <Text style={styles.dateText}>
                  {loading ? 'Loading...' : orderDetail?.trip_date ? `Wed, ${orderDetail.trip_date}` : 'Loading date...'}
                </Text>
                <Text style={styles.timeText}>{startTime}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.timeSection}>
                <Text style={[styles.timeSectionTitle, {textAlign: 'right'}]}>Ends</Text>
                <Text style={[styles.dateText, {textAlign: 'right'}]}>
                  {loading ? 'Loading...' : orderDetail?.trip_date ? `Wed, ${orderDetail.trip_date}` : 'Loading date...'}
                </Text>
                <Text style={[styles.timeText, {textAlign: 'right'}]}>{endTime}</Text>
              </View>
            </View>
          </View> */}
          
          {/* Meeting Point */}
          <View style={[styles.sectionContainer]}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="location-outline" size={28} color="#333" style={styles.sectionIcon} />
              <View>
                <Text style={styles.sectionTitle}>Where to meet</Text>
                {loading ? (
                  <Text style={styles.loadingText}>Loading meeting point...</Text>
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  <Text 
                    style={styles.locationText} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {orderDetail?.meeting_point}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          {/* What You'll Do */}
          <View style={[styles.sectionContainer]}>
            <View style={styles.iconTextContainer}>
              <MaterialIcons name="event-note" size={28} color="#333" style={styles.sectionIcon} />
              <View>
                <Text style={styles.sectionTitle}>What you'll do</Text>
                <Text style={styles.descriptionText}>How you'll spend your time</Text>
              </View>
            </View>
          </View>
          
          {/* Your Experience */}
          {/* <View style={[styles.sectionContainer]}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="boat-outline" size={28} color="#333" style={styles.sectionIcon} />
              <View>
                <Text style={styles.sectionTitle}>Your experience</Text>
                {loading ? (
                  <Text style={styles.loadingText}>Loading experience details...</Text>
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  <Text style={styles.descriptionText}>{orderDetail?.name || 'Loading experience details...'}</Text>
                )}
              </View>
            </View>
          </View> */}
          
          {/* Section Divider */}
          <View style={styles.sectionDivider} />
          
          {/* Where to Meet Section */}
          <View style={styles.meetingContainer}>
            <Text style={styles.meetingTitle}>Where to meet</Text>
            
            <View style={styles.arrivalContainer}>
              <View style={styles.arrivalTipsList}>
                <Text style={styles.arrivalTipItem}>{orderDetail?.meeting_point}</Text>
              </View>
            </View>
            
            {/* <View style={styles.locationActions}>
              <TouchableOpacity style={styles.locationActionButtonAlt}>
                <Ionicons name="copy-outline" size={22} color="#333" style={styles.locationActionIcon} />
                <Text style={styles.locationActionText}>Copy address</Text>
                <Ionicons name="chevron-forward" size={20} color="#333" style={{marginLeft: 'auto'}} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.locationActionButton}>
                <Ionicons name="navigate-outline" size={22} color="#333" style={styles.locationActionIcon} />
                <Text style={styles.locationActionText}>Get directions</Text>
                <Ionicons name="chevron-forward" size={20} color="#333" style={{marginLeft: 'auto'}} />
              </TouchableOpacity>
            </View> */}
          </View>
          
          {/* Section Divider */}
          <View style={styles.sectionDivider} />
          
          {/* Reservation Details Section */}
          <View style={styles.reservationContainer}>
            <Text style={styles.reservationTitle}>Reservation details</Text>
            
            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationLabel}>Confirmation code</Text>
              <Text style={styles.confirmationCode}>
                {loading ? 'Loading...' : orderDetail?.id.substring(0, 8).toUpperCase() || 'TAZHPCAS'}
              </Text>
            </View>
            <View style={styles.costContainer}>
              <Text style={styles.costLabel}>Total cost</Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : error ? (
                <Text style={styles.errorText}>Error loading cost</Text>
              ) : (
                <Text style={styles.costAmount}>
                  Rp{orderDetail?.amount_idr?.toLocaleString() || '0.00'} IDR
                </Text>
              )}
            </View>
            
            {/* <TouchableOpacity style={styles.receiptButton}>
              <Ionicons name="receipt-outline" size={22} color="#333" style={styles.receiptIcon} />
              <Text style={styles.receiptText}>Get receipts</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" style={{marginLeft: 'auto'}} />
            </TouchableOpacity> */}
          </View>
                    {/* Section Divider */}
          <View style={styles.sectionDivider} />
          
          {/* Support Section */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportTitle}>Get support anytime</Text>
            <Text style={styles.supportDescription}>If you need help, we're available 24/7 from anywhere in the world.</Text>
            
            <TouchableOpacity style={styles.supportButton}>
              <Ionicons name="help-circle-outline" size={22} color="#333" style={styles.supportIcon} />
              <Text style={styles.supportButtonText}>Contact Vakansik Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
            
            {/* <TouchableOpacity style={styles.supportButtonAlt}>
              <Ionicons name="help-circle-outline" size={22} color="#333" style={styles.supportIcon} />
              <Text style={styles.supportButtonText}>Visit the Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" style={{marginLeft: 'auto'}} />
            </TouchableOpacity> */}
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
    width: '100%',
  },
  imageContainer: {
    height: 220,
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 12
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16
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
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  confirmedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FFC107',
  },
  defaultBadge: {
    backgroundColor: '#2196F3',
  },
  cancelledText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: 'white',
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
  },
  tourTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    height: 32
  },
  tourInfo: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
    marginBottom: 20,
  },
  timeCardContainer: {
    marginBottom: 16,
  },
  timeCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeSection: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  timeSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 6,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20
  },
  sectionContainer: {
    paddingVertical: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  timeText: {
    fontSize: 14,
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
    flexShrink: 1,
    width: 300
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  reservationContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    width: '100%',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#E9E9E9',
    width: '100%',
    alignSelf: 'stretch'
  },
  reservationTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 24,
  },
  confirmationContainer: {
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginBottom: 8,
  },
  confirmationCode: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
  },
  receiptIcon: {
    marginRight: 12,
  },
  receiptText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#E53935',
  },
  loadingImageContainer: {
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    width: '100%',
  },
  meetingTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 24,
  },
  arrivalContainer: {
    marginBottom: 24,
  },
  arrivalTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 12,
  },
  arrivalTipsList: {
    marginBottom: 16,
  },
  arrivalTipItem: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
    lineHeight: 24,
  },
  arrivalTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  showDetailsLink: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    textDecorationLine: 'underline',
  },
  locationActions: {
    marginTop: 8,
  },
  locationActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  locationActionButtonAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderColor: '#EEEEEE',
    marginBottom: -1, // Overlap borders
    borderBottomWidth: 1,
  },
  locationActionIcon: {
    marginRight: 12,
  },
  locationActionText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  paymentContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  paymentTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 18,
    height: 26
  },
  costContainer: {
    marginBottom: 24,
  },
  costLabel: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
  },
  receiptButtonAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  supportContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    width: '100%',
  },
  supportTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
    height: 28
  },
  supportDescription: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderColor: '#EEEEEE',
    marginBottom: -1, // Overlap borders
  },
  supportButtonAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: -1, // Overlap borders
  },
  supportIcon: {
    marginRight: 12,
  },
  supportButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
});

export default DetailBookingScreen;