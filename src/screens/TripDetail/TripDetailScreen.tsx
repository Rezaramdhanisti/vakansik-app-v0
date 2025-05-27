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
        <View style={{ width: width, height: 300 }}>
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
          <Text style={styles.tripLocation}>Room in {property.location}</Text>
          
          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featureText}>
              {features.bedrooms} bedrooms • {features.beds} beds • {features.bathrooms}
            </Text>
          </View>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#000" />
            <Text style={styles.ratingText}>{property.rating} review</Text>
          </View>
          
          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About this trip</Text>
            <Text style={styles.sectionContent}>{property.description}</Text>
          </View>
          
          {/* What this trip offers */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>What this trip offers</Text>
            <View style={styles.amenitiesContainer}>
              {['Mountain view', 'Kitchen', 'Wifi', 'Free parking', 'Air conditioning', 'Washing machine'].map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Location section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>Map view of {property.location}</Text>
            </View>
          </View>
          
          {/* Host section */}
          <View style={styles.sectionContainer}>
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
      
      {/* Bottom booking bar */}
      <View style={styles.bookingBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{property.price}</Text>
          <Text style={styles.priceSubtext}>night</Text>
        </View>
        
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Reserve</Text>
        </TouchableOpacity>
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
  imageContainer: {
    width,
    height: 300,
    position: 'relative',
    overflow: 'hidden',
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
  },
  tripTitle: {
    fontSize: 26,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 8,
  },
  tripLocation: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#333',
    marginBottom: 12,
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
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 24,
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
    fontSize: 18,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#FFFFFF',
  },
});

export default TripDetailScreen;
