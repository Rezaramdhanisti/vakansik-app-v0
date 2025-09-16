import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
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
  // Add state for collapsed itinerary days
  const [collapsedDays, setCollapsedDays] = useState<{[key: number]: boolean}>({0: false});
  
  const handleGetHelp = async () => {
    const phoneNumber = '6287811047085'; // Add country code (62 for Indonesia)
    const text = 'Halo, saya butuh bantuan dengan aplikasi Vakansik.';
    
    // Create WhatsApp URL
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`;
    
    try {
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert(
        'Error', 
        'Unable to open WhatsApp. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Parse itinerary from string to object if needed
  const parsedItinerary = useMemo(() => {
    if (!orderDetail?.itinerary) return null;
    
    try {
      // If itinerary is stored as a JSON string, parse it
      if (typeof orderDetail.itinerary === 'string') {
        return JSON.parse(orderDetail.itinerary);
      }
      // If it's already an object (array), return as is
      return orderDetail.itinerary;
    } catch (e) {
      console.error('Error parsing itinerary:', e);
      return null;
    }
  }, [orderDetail?.itinerary]);
  
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
               {/* Attention Banner */}
               <View style={styles.attentionBanner}>
            <View style={styles.attentionBannerContent}>
              <Ionicons name="information-circle" size={24} color="#856404" style={styles.attentionIcon} />
              <Text style={styles.attentionText}>
              Setelah pembayaranmu sudah selesai, kamu akan diundang ke grup WA Open Trip ini. Tunggu sebentar ya!
              </Text>
            </View>
          </View>
          {/* Meeting Point */}
          <View style={[styles.sectionContainer]}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="location-outline" size={28} color="#333" style={styles.sectionIcon} />
              <View>
                <Text style={styles.sectionTitle}>Meeting Point</Text>
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
                <Text style={styles.sectionTitle}>Yang akan kamu lakukan</Text>
                <Text style={styles.descriptionText}>Bagaimana kamu akan menghabiskan waktu</Text>
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
            <Text style={styles.meetingTitle}>Meeting Point</Text>
            
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
          <View style={styles.sectionDivider} />
          
          {/* Where to Meet Section */}
          <View style={styles.meetingContainer}>
            <Text style={styles.meetingTitle}>Yang akan kamu lakukan</Text>
            
            {!loading && parsedItinerary && parsedItinerary.length > 0 ? (
              <View>
                {parsedItinerary.map((dayData: any, dayIndex: number) => {
                  // Check if the day is collapsed based on collapsedDays state
                  const isCollapsed = collapsedDays[dayIndex] !== undefined ? collapsedDays[dayIndex] : true;
                  
                  return (
                    <View key={dayIndex} style={styles.dayContainer}>
                      <TouchableOpacity 
                        style={styles.dayTitleContainer}
                        onPress={() => setCollapsedDays({...collapsedDays, [dayIndex]: !isCollapsed})}
                      >
                        <Text style={styles.dayTitle}>{dayData.day}</Text>
                        <Ionicons 
                          name={isCollapsed ? 'chevron-down-outline' : 'chevron-up-outline'} 
                          size={20} 
                          color="#000" 
                        />
                      </TouchableOpacity>
                      
                      {!isCollapsed && (
                        <View>
                          {dayData.activities.map((item: any, index: number) => {
                            const isLastItem = index === dayData.activities.length - 1;
                            return (
                              <View key={index} style={styles.timelineItem}>
                                <View style={styles.timelineIconContainer}>
                                  <View style={styles.timelineIcon}>
                                    <Ionicons name={item.icon || 'time-outline'} size={24} color="#000" />
                                  </View>
                                  {!isLastItem && <View style={styles.timelineConnector} />}
                                </View>
                                <View style={styles.timelineContent}>
                                  <Text style={styles.timelineTitle}>{item.title}</Text>
                                  <Text style={styles.timelineDescription}>{item.description}</Text>
                                  {item.duration && (
                                    <View style={styles.durationContainer}>
                                      <Ionicons name="time-outline" size={16} color="#666" />
                                      <Text style={styles.durationText}>{item.duration}</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noItineraryContainer}>
                <Text style={styles.noItineraryText}>
                  {loading ? 'Loading itinerary...' : 'Itinerary details will be shared soon.'}
                </Text>
              </View>
            )}
          </View>
          {/* Section Divider */}
          <View style={styles.sectionDivider} />
          
          {/* Reservation Details Section */}
          <View style={styles.reservationContainer}>
            <Text style={styles.reservationTitle}>Detail reservasi</Text>
            
            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationLabel}>Kode konfirmasi</Text>
              <Text style={styles.confirmationCode}>
                {loading ? 'Loading...' : orderDetail?.id.substring(0, 8).toUpperCase() || 'TAZHPCAS'}
              </Text>
            </View>
            <View style={styles.costContainer}>
              <Text style={styles.costLabel}>Total biaya</Text>
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
            <Text style={styles.supportTitle}>Dapatkan bantuan kapan saja</Text>
            <Text style={styles.supportDescription}>Jika kamu membutuhkan bantuan, kami tersedia 24/7 dari mana saja di dunia.</Text>
            
            <TouchableOpacity style={styles.supportButton} onPress={handleGetHelp}>
              <Ionicons name="help-circle-outline" size={22} color="#333" style={styles.supportIcon} />
              <Text style={styles.supportButtonText}>Kontak Vakansik Support</Text>
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
    lineHeight: 20,
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
    lineHeight: 28,
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
    lineHeight: 28,
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
    lineHeight: 28,
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
    color: '#666',
  },
  timelineContainer: {
    marginTop: 16,
  },
  dayContainer: {
    marginBottom: 12,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dayTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineConnector: {
    width: 1,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
    alignSelf: 'center',
  },
  timelineContent: {
    flex: 1,
    paddingVertical: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 6,
  },
  timelineDescription: {
    fontSize: 15,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#777',
    marginBottom: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginLeft: 4,
  },
  noItineraryContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginTop: 10,
  },
  noItineraryText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textAlign: 'center',
  },
  attentionBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
    marginBottom: 16,
  },
  attentionBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attentionIcon: {
    marginRight: 12,
    color: '#856404',
  },
  attentionText: {
    fontSize: 15,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#856404',
    flex: 1,
    lineHeight: 20,
  },
});

export default DetailBookingScreen;