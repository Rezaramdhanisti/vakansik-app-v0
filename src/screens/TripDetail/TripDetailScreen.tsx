import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Animated,
  Pressable,
  StatusBar,
  Platform
} from 'react-native';
import PropertyCarousel from '../../components/PropertyCarousel';
import { FlashList } from '@shopify/flash-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import { StackScreenProps } from '@react-navigation/stack';
import { SearchStackParamList } from '../../navigation/SearchNavigator';
import DateBottomSheet, { DateBottomSheetRef } from '../../components/DateBottomSheet';

const { width } = Dimensions.get('window');

// Use StackScreenProps to properly type the component props
type TripDetailScreenProps = StackScreenProps<SearchStackParamList, 'TripDetail'>;



function TripDetailScreen({ navigation, route }: TripDetailScreenProps): React.JSX.Element {
  const { property, guestCount = 2 } = route.params; // Default to 2 guests if not provided
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  // Initialize with the first itinerary item expanded and others collapsed
  const [collapsedDays, setCollapsedDays] = useState<{[key: number]: boolean}>({0: false});
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // ref for bottom sheet modal
  const dateBottomSheetRef = useRef<DateBottomSheetRef>(null);

  // Use image_urls from the property data if available, otherwise use fallback images
  const images = property.image_urls && property.image_urls.length > 0 
  ? property.image_urls 
  :  [
    require('../../../assets/images/lovina-1.jpg'),
    require('../../../assets/images/lovina-2.jpg'),
    require('../../../assets/images/lovina-3.jpg'),
  ];
  // Reviews data
  const reviews = [
    {
      id: '1',
      rating: 5,
      text: 'Such a fun and beautiful experience, being fully immersed in the lush green jungle atmosphere. The rafting was incredible, lunch was delicious, ATV was adventurous, our group was fun...',
      reviewer: 'Maria',
    },
    {
      id: '2',
      rating: 5,
      text: 'Amazing experience with professional guides. The views were breathtaking and the entire day was well organized. Highly recommend!',
      reviewer: 'John',
    },
    {
      id: '3',
      rating: 5,
      text: 'Great experience! The guides were knowledgeable and friendly. Would definitely recommend to anyone visiting Bali.',
      reviewer: 'Sarah',
    },
    {
      id: '4',
      rating: 5,
      text: 'One of the highlights of our trip to Bali. The rafting was exciting but safe, and the scenery was absolutely stunning.',
      reviewer: 'David',
    },
  ];

  // Function to open the date bottom sheet
  const handleShowDates = () => {
    setIsBottomSheetVisible(true);
    dateBottomSheetRef.current?.present();
  };
  
  // Function to handle bottom sheet dismiss
  const handleSheetDismiss = () => {
    setIsBottomSheetVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with back and share buttons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trip Images */}
        <View style={styles.imageGalleryWrapper}>
          <PropertyCarousel
            images={images}
            itemId={property.id || 'trip-detail'}
            onSnapToItem={(index) => setCurrentImageIndex(index)}
            showCounter={true}
            fullWidth={true}
          />
        </View>
        
        {/* Trip Title and Location */}
        <View style={styles.detailsContainer}>
          <Text style={styles.tripTitle}>{property.name}</Text>
          
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#000" />

            <Text style={styles.propertyRating}> • {property.rating} • </Text>
            <Text style={styles.propertyReviews}>{property.reviews}</Text>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Description */}
          <View>
            <Text style={styles.sectionTitle}>Intip perjalanan ini!</Text>
            <Text 
              style={styles.sectionContent} 
              numberOfLines={showFullDescription ? undefined : 2}
              ellipsizeMode="tail"
            >
              {property.description}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowFullDescription(!showFullDescription)}
              style={styles.viewMoreButton}
            >
              <Text style={styles.viewMoreText}>
                {showFullDescription ? 'Lihat sedikit' : 'Lihat selengkapnya'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
          
          {/* What you'll do */}
          <View>
            <Text style={styles.sectionTitle}>Yang akan kamu lakukan</Text>
            
            {property?.itinerary && property?.itinerary.length > 0 ? (
              <View style={styles.timelineContainer}>
                {property?.itinerary.map((dayData, dayIndex) => {
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
                          <FlashList
                            data={dayData.activities}
                            estimatedItemSize={80}
                            renderItem={({ item, index }: { item: any, index: number }) => {
                              const isLastItem = index === dayData.activities.length - 1;
                              return (
                                <View style={styles.timelineItem}>
                                  <View style={styles.timelineIconContainer}>
                                    <View style={styles.timelineIcon}>
                                      <Ionicons name={item.icon} size={24} color="#000" />
                                    </View>
                                    {!isLastItem && <View style={styles.timelineConnector} />}
                                  </View>
                                  <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>{item.title}</Text>
                                    <Text style={styles.timelineDescription}>{item.description}</Text>
                                  </View>
                                </View>
                              );
                            }}
                            keyExtractor={(item: any, index: number) => `${dayIndex}-${index}`}
                            showsVerticalScrollIndicator={false}
                          />
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noItineraryContainer}>
                <Text style={styles.noItineraryText}>Itinerary details will be provided upon booking.</Text>
              </View>
            )}
          </View>
          
          <View style={styles.divider} />

          {/* Location section */}
          <View>
            <Text style={styles.sectionTitle}>Meeting Point</Text>
            {/* <FlashList
              data={PICKUP_AREAS.filter(item => item.isDefault || showMoreOptions)}
              renderItem={({ item }) => ( */}
                <View>
                  <Text style={styles.sectionSubtitle}>Area penjemputan</Text>
                  <Text style={styles.sectionContent}>{property.meeting_point}</Text>
                  {/* <Text style={styles.locationAddress}>{property.meeting_point}</Text> */}
                </View>
              {/* )} */}
              {/* estimatedItemSize={80}
              keyExtractor={item => item.id}
            /> */}
            
            {/* <Text 
              style={[styles.locationAddress, styles.toggleOption]} 
              onPress={() => setShowMoreOptions(!showMoreOptions)}
            >
              {showMoreOptions ? 'Hide Options' : 'More Options'}
            </Text> */}
          </View>
          
          <View style={styles.divider} />
          
          {/* Reviews section */}
          <View>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewSummary}>
              <Ionicons name="star" size={18} color="#000" />
              <Text style={styles.reviewRating}> 4.91 · 775 reviews</Text>
            </View>
            
            {/* Horizontal scrollable reviews using FlatList */}
            <FlatList
              data={reviews}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalReviewsContainer}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {[...Array(item.rating)].map((_, index) => (
                        <Ionicons key={index} name="star" size={14} color="#000" />
                      ))}
                    </View>
                  </View>
                  
                  <Text style={styles.reviewText}>
                    {item.text}
                  </Text>
                  
                  {/* <TouchableOpacity>
                    <Text style={styles.showMoreText}>Show more</Text>
                  </TouchableOpacity> */}
                  
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                      <Ionicons name="person-circle" size={40} color="#666" />
                    </View>
                    <Text style={styles.reviewerName}>{item.reviewer}</Text>
                  </View>
                </View>
              )}
            />
          </View>
          
          <View style={styles.divider} />
          
          {/* Things to know section */}
          <View>
            <Text style={styles.sectionTitle}>Things to know</Text>
             {/* Price includes/excludes */}
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="cash-outline" size={24} color="#333" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Price details</Text>
                <Text style={styles.infoText}>{property.price_information}</Text>
              </View>
            </View>
          </View>
            
            {/* Cancellation policy */}
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="close-circle-outline" size={24} color="#333" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Cancellation policy</Text>
                <Text style={styles.infoText}>Cancel at least 7 day before the start time for a full refund.</Text>
              </View>
            </View>
            
           
        </View>
      </ScrollView>
      
      {/* Floating booking button - hidden when bottom sheet is visible */}
      {!isBottomSheetVisible && (
        <View style={styles.floatingButtonContainer}>
          <View style={styles.floatingBookingBar}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{property.price}</Text>
              <Text style={styles.priceSubtext}>/ guest</Text>
            </View>
            
            <TouchableOpacity style={styles.bookButton} onPress={handleShowDates}>
              <Text style={styles.bookButtonText}>Show dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        </SafeAreaView>
        
        {/* Date Bottom Sheet Component */}
        <DateBottomSheet 
          ref={dateBottomSheetRef} 
          onDismiss={handleSheetDismiss}
          initialGuestCount={guestCount} // Pass the guest count from the previous screen
          property={property} // Pass the entire property object
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
    paddingVertical: 12,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 64 : 10,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  imageGalleryWrapper: {
    width: width,
    height: 300,
    overflow: 'hidden',
    marginBottom: -20, // To create overlap with the details container
  },
  imageContainer: {
    width,
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  detailsContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
    paddingBottom: 100,
  },
  tripTitle: {
    fontSize: 26,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 8,
    textAlign:'center',
    lineHeight: 40
  },
  tripDescription: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#777777',
    marginBottom: 12,
    textAlign:'center'
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
  },
  propertyRating: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  propertyReviews: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  divider: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginVertical: 20,
    width: '100%',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  viewMoreButton: {
    marginBottom: 16,
  },
  viewMoreText: {
    color: '#0066CC',
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  meetingPointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  meetingPointText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  noItineraryContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  noItineraryText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginTop: 6,
    marginBottom: 12,
  },
  locationAddress: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#777777',
    marginBottom: 16,
  },
  toggleOption: {
    color: '#222',
    fontWeight: '500',
    marginVertical: 5,
  },
  pickupAreaItem: {
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
    marginLeft: 8,
  },
  timelineContainer: {
    marginTop: 10
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  timelineConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    top: 50,
    left: 24,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 5,
  },
  timelineTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#777777',
    lineHeight: 20,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostSince: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  hostRating: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginTop: 4,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  floatingBookingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  bookingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  priceSubtext: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
  },
  // Review section styles
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewRating: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  horizontalReviewsContainer: {
    paddingVertical: 10,
    paddingRight: 20,
  },
  reviewItem: {
    width: width * 0.75,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    marginRight: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#EEEEEE',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  reviewSeparator: {
    width: 16,
  },
  // Things to know section styles
  infoItem: {
    flexDirection: 'row',
    marginTop: 18
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    lineHeight: 20,
  },
});

export default TripDetailScreen;
