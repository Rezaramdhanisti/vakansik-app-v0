import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  FlatList
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import { StackScreenProps } from '@react-navigation/stack';
import { SearchStackParamList } from '../../navigation/SearchNavigator';

const { width } = Dimensions.get('window');

// Use StackScreenProps to properly type the component props
type TripDetailScreenProps = StackScreenProps<SearchStackParamList, 'TripDetail'>;

function TripDetailScreen({ navigation, route }: TripDetailScreenProps): React.JSX.Element {
  const { property } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Images for the gallery
  const images = [
    require('../../../assets/images/lovina-1.jpg'),
    require('../../../assets/images/lovina-2.jpg'),
    require('../../../assets/images/lovina-3.jpg'),
  ];

  // Features data
  const features = property.features || {
    bedrooms: 8,
    beds: 8,
    bathrooms: 'Dedicated bathroom'
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const renderImageItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={item} style={styles.image} resizeMode="cover" />
      <Text style={styles.imageCounter}>{index + 1} / {images.length}</Text>
    </View>
  );

  return (
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
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
          />
        </View>
        
        {/* Trip Title and Location */}
        <View style={styles.detailsContainer}>
          <Text style={styles.tripTitle}>{property.title}</Text>
          <Text style={styles.tripDescription}>{property.description}</Text>
          
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#000" />

            <Text style={styles.propertyRating}> • {property.rating} • </Text>
            <Text style={styles.propertyReviews}>{property.reviews}</Text>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Description */}
          <View >
            <Text style={styles.sectionTitle}>About this trip</Text>
            <Text style={styles.sectionContent}>{property.description}</Text>
          </View>

          <View style={styles.divider} />
          {/* What you'll do */}
          <View>
            <Text style={styles.sectionTitle}>What you'll do</Text>
            <View style={styles.timelineContainer}>
              {[
                {
                  title: 'Pick up from stay',
                  description: 'Meet between 8-8:30am for pick up from your stay',
                  icon: 'car-outline'
                },
                {
                  title: 'Meet the instructors',
                  description: 'Get a full safety briefing and preparation for rafting adventure',
                  icon: 'people-outline'
                },
                {
                  title: 'Get rafting',
                  description: 'Enjoy two-hour white-water rafting trip at Ayung river',
                  icon: 'boat-outline'
                },
                {
                  title: 'Enjoy lunch',
                  description: 'Take a break and enjoy a buffet-style delicious lunch',
                  icon: 'restaurant-outline'
                },
                {
                  title: 'Visit coffee farm',
                  description: 'Explore a local coffee plantation before returning to your accommodation',
                  icon: 'cafe-outline'
                },
                {
                  title: 'Drop off from stay',
                  description: 'Meet between 8-8:30am for drop off from your stay',
                  icon: 'car-outline'
                },
              ].map((item, index, array) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIconContainer}>
                    <View style={styles.timelineIcon}>
                      <Ionicons name={item.icon} size={24} color="#000" />
                    </View>
                    {index < array.length - 1 && <View style={styles.timelineConnector} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{item.title}</Text>
                    <Text style={styles.timelineDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.divider} />

          {/* Location section */}
          <View>
            <Text style={styles.sectionTitle}>Meeting Point</Text>
            <Text style={styles.sectionSubtitle}>Pick up area available:</Text>
            <Text style={styles.sectionContent}>Kuta, Seminyak, Ubud, Nusa Dua, Uluwatu, Sanur, Denpasar, Canggu</Text>
            <Text style={styles.locationAddress}>Ubud, Bali, 80572</Text>
          </View>
          
          <View style={styles.divider} />
          {/* Host section */}
          <View>
            <Text style={styles.sectionTitle}>Hosted by Raja</Text>
            <View style={styles.hostContainer}>
              <View style={styles.hostAvatar} />
              <View style={styles.hostInfo}>
                <Text style={styles.hostSince}>Host since 2018</Text>
                <Text style={styles.hostRating}>⭐ 4.98 • 124 reviews</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating booking button */}
      <View style={styles.floatingButtonContainer}>
        <View style={styles.floatingBookingBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{property.price}</Text>
            <Text style={styles.priceSubtext}>/ guest</Text>
          </View>
          
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Show dates</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
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
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
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
    textAlign:'center'
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
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#777777',
    marginBottom: 16,
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
    marginTop: 10,
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
    backgroundColor: '#FF5E57',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
  },
});

export default TripDetailScreen;
