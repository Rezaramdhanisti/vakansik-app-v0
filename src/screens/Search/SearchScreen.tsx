import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  Switch,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
// Removed carousel imports as we're using a single image
import { fetchDestinations } from '../../services/destinationsService';
import Text from '../../components/Text';
import { FONTS } from '../../config/fonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { setupDoubleBackExit } from '../../utils/BackHandler';

const { width } = Dimensions.get('window');

type SearchScreenProps = {
  navigation: any;
};

function SearchScreen({ navigation }: SearchScreenProps): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState('Castles');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortByHighestPrice, setSortByHighestPrice] = useState(false);
  const [sortByLowestPrice, setSortByLowestPrice] = useState(false);
  
  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Snap points
  const snapPoints = useMemo(() => ['35%'], []);
  
  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  
  // Open and close bottom sheet
  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);
  
  // Backdrop component for the bottom sheet
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style]}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );
  // Define property listing type
  type PropertyListing = {
    id: string;
    name: string;
    description: string;
    price: string;
    rating: string;
    reviews: string;
    image_urls?: string[];
    isFavorite: boolean;
    budget_band?: string;
    category?: string;
    location?: string;
  };
  
  const [filteredListings, setFilteredListings] = useState<PropertyListing[]>([]);
  const [destinations, setDestinations] = useState<PropertyListing[]>([]);
  // Removed currentImageIndices state as we're using a single image
  // Create a ref to store carousel instances
  // Removed carouselRefs as we're using a single image
  const [isLoading, setIsLoading] = useState(false);
  
  // Categories data
  const categories = [
    { id: '1', name: 'Budget', icon: 'chicken-piggy.webp', isImage: true },
    { id: '2', name: 'Pantai', icon: 'extreme.webp', isImage: true },
    { id: '3', name: 'Gunung', icon: 'bandung.webp', isImage: true },
    { id: '4', name: 'Alam', icon: 'jakarta.webp', isImage: true },
    { id: '5', name: 'Heritage', icon: 'yogyakarta.webp', isImage: true },
    { id: '6', name: 'Jakarta', icon: 'yogyakarta.webp', isImage: true },
    { id: '7', name: 'Bandung', icon: 'yogyakarta.webp', isImage: true },
    { id: '8', name: 'Yogyakarta', icon: 'yogyakarta.webp', isImage: true },
  ];

  // Convert price string to number for sorting
  const getPriceValue = (priceString: string) => {
    // Extract the numeric part from strings like 'Rp53,601,871'
    const numericString = priceString.replace(/[^0-9]/g, '');
    return parseInt(numericString, 10);
  };

  // Apply filters and sorting to property listings
  useEffect(() => {
    let filtered = [...destinations];
    
    // Filter by search text
    if (searchText.trim()) {
      const searchTerm = searchText.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        (item.location && item.location.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by active category
    if (activeCategory === 'Budget') {
      filtered = filtered.filter(item => item.budget_band === 'budget');
    } else if (activeCategory === 'Pantai') {
      filtered = filtered.filter(item => item.category === 'Pantai');
    } else if (activeCategory === 'Gunung') {
      filtered = filtered.filter(item => item.category === 'Pegunungan');
    } else if (activeCategory === 'Alam') {
      filtered = filtered.filter(item => item.category === 'Alam');
    } else if (activeCategory === 'Heritage') {
      filtered = filtered.filter(item => item.category === 'Heritage');
    } else if (activeCategory === 'Jakarta') {
      // filtered = filtered.filter(item => item.location === 'jakarta');
      filtered = filtered.filter(item => item.category === 'jakarta');
    } else if (activeCategory === 'Bandung') {
      // filtered = filtered.filter(item => item.location === 'bandung');
      filtered = filtered.filter(item => item.category === 'Bandung');
    } else if (activeCategory === 'Yogyakarta') {
      // filtered = filtered.filter(item => item.location === 'yogyakarta');
      filtered = filtered.filter(item => item.category === 'Yogyakarta');
    }
    
    // Apply sorting
    if (sortByHighestPrice) {
      filtered.sort((a, b) => getPriceValue(b.price) - getPriceValue(a.price));
    } else if (sortByLowestPrice) {
      filtered.sort((a, b) => getPriceValue(a.price) - getPriceValue(b.price));
    }
    
    setFilteredListings(filtered);
  }, [sortByHighestPrice, sortByLowestPrice, destinations, activeCategory, searchText]);
  
  // Setup double back press to exit for Android - only when this screen is focused
  const [isFocused, setIsFocused] = useState(true);
  
  useEffect(() => {
    // Add listeners for screen focus and blur
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsFocused(true);
    });
    
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsFocused(false);
    });
    
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);
  
  useEffect(() => {
    // Only setup the back handler when this screen is focused
    let backHandlerCleanup: (() => void) | null = null;
    
    if (isFocused) {
      backHandlerCleanup = setupDoubleBackExit({
        message: 'Press back again to exit app',
        resetTimeout: 2000
      });
    }
    
    return () => {
      // Clean up back handler when screen loses focus or component unmounts
      if (backHandlerCleanup) {
        backHandlerCleanup();
      }
    };
  }, [isFocused]);
  // Load destinations from Supabase
  useEffect(() => {
    const loadDestinations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDestinations();
        
        // Transform the data to match our PropertyListing type
        const formattedData = data.map(item => ({
          id: String(item.id), 
          name: item.name,
          description: item.description,
          price: `Rp ${item.price.toLocaleString()}`,
          rating: item.rating.toString(),
          reviews: `${item.reviews.toLocaleString()} reviews`,
          image_urls: item.image_urls,
          // Include the additional fields from the API
          itinerary: item.itinerary,
          meeting_point: item.meeting_point,
          price_information: item.price_information,
          budget_band: item.budget_band,
          category: item.category,
          location: item.location,
          available_dates: item.available_dates,
          is_need_ktp: item.is_need_ktp,
          isFavorite: false
        }));
        setDestinations(formattedData);
        setFilteredListings(formattedData);
      } catch (error) {
        // Fallback to empty array if fetch fails
        setDestinations([]);
        setFilteredListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Render a category item
  const renderCategoryItem = (item: { id: string; name: string; icon: string; isImage?: boolean }) => {
    const isActive = activeCategory === item.name;
    
    const getIcon = () => {
      if (item.isImage) {
        if (item.name === 'Budget') {
          return <Image source={require('../../../assets/images/chicken-piggy.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Pantai') {
          return <Image source={require('../../../assets/images/beach.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Gunung') {
          return <Image source={require('../../../assets/images/mountain.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Alam') {
          return <Image source={require('../../../assets/images/nature.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Heritage') {
          return <Image source={require('../../../assets/images/heritage.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Jakarta') {
          return <Image source={require('../../../assets/images/jakarta.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Bandung') {
          return <Image source={require('../../../assets/images/bandung.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        } else if (item.name === 'Yogyakarta') {
          return <Image source={require('../../../assets/images/yogyakarta.webp')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />;
        }
      } else if (item.icon === 'campground') {
        return <FontAwesome name={item.icon} size={34} color={isActive ? '#000' : '#999'} />;
      } else {
        return <MaterialCommunityIcons name={item.icon} size={34} color={isActive ? '#000' : '#999'} />;
      }
    };
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[styles.categoryItem, isActive && styles.activeCategoryItem]}
        onPress={() => setActiveCategory(item.name)}
      >
        <View style={styles.categoryIconContainer}>
          {getIcon()}
        </View>
        <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>{item.name}</Text>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  // Render a property listing item
  const renderPropertyItem = ({ item }: { item: any }) => {
    return (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => {
        const propertyData = JSON.parse(JSON.stringify(item));
        navigation.navigate('TripDetail', { property: propertyData });
      }}
      activeOpacity={0.9}
    >
      <View style={styles.propertyImageContainer}>
        {item.image_urls && item.image_urls.length > 0 ? (
          <Image 
            source={{ 
              uri: item.image_urls[0]
            }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <Image 
            source={require('../../../assets/images/lovina-3.jpg')}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e: any) => {
            e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
            // Toggle favorite logic would go here
          }}
        >
          <Ionicons 
            name={item.isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={item.isFavorite ? '#FF6F00' : '#FFF'} 
          />
        </TouchableOpacity>
        
        {/* Pagination dots are now handled inside the PropertyCarousel component */}
      </View>
      
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyLocation}>{item.name}</Text>
        <Text style={styles.propertyInfo} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.propertyPrice}>{item.price}</Text>
          <Text style={styles.propertyRating}> • {item.rating} • </Text>
          <Text style={styles.propertyReviews}>{item.reviews}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} style={styles.searchIcon} color="#333" />
          <TextInput
            style={styles.searchInput}
            placeholder="Yuk, mulai petualanganmu!"
            placeholderTextColor="#666"
            textAlign="center"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              // Small delay to allow item selection before hiding suggestions
             setIsSearchFocused(false)
            }}
          />
        </View>
      </View>
      
      {/* Categories Section */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map(item => renderCategoryItem(item))}
        </ScrollView>
      </View>
      
      {/* Property Listings */}
      <View style={styles.flashListContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6F00" />
          </View>
        ) : filteredListings.length > 0 ? (
          <FlashList
            data={filteredListings}
            renderItem={renderPropertyItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listingsContainer}
            estimatedItemSize={350}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Image source={require('../../../assets/images/coming-soon.webp')} style={{ width: 360, height: 360, resizeMode: 'contain' }} />
            <Text style={styles.emptyStateText}>Coming soon</Text>
          </View>
        )}
      </View>
      
      {/* Filter Button */}
      {filteredListings.length > 0 && 
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={openBottomSheet}
        >
          <Text style={styles.mapButtonText}>Filter</Text>
          <MaterialCommunityIcons name="filter-outline" size={18} color="#FFF" style={styles.mapIcon} />
        </TouchableOpacity>
      </View>
      }
      
      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <View style={styles.filterOption}>
              <View style={styles.filterOptionTextContainer}>
                <Text style={styles.filterOptionText}>Highest price first</Text>
              </View>
              <Switch
                value={sortByHighestPrice}
                onValueChange={(value) => {
                  setSortByHighestPrice(value);
                  if (value) setSortByLowestPrice(false);
                }}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.filterOption}>
              <View style={styles.filterOptionTextContainer}>
                <Text style={styles.filterOptionText}>Lowest price first</Text>
              </View>
              <Switch
                value={sortByLowestPrice}
                onValueChange={(value) => {
                  setSortByLowestPrice(value);
                  if (value) setSortByHighestPrice(false);
                }}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSortByHighestPrice(false);
                setSortByLowestPrice(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear all</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <Text style={styles.applyButtonText}>Show results</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
    marginTop: -40
  },
  header: {
    padding: 16,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    height: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: '95%',
    maxWidth: 500,
  },
  searchIcon: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.SATOSHI_BOLD,
    flex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
    maxHeight: 350,
  },
  suggestionsList: {
    borderRadius: 12,
    maxHeight: 350,
  },
  suggestionSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  locationIcon: {
    marginRight: 8,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
    paddingBottom: 8,
    position: 'relative',
  },
  activeCategoryItem: {
    // Active category styling
  },
  categoryIconContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#999',
    marginTop: 4
  },
  activeCategoryText: {
    color: '#000',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '70%',
    backgroundColor: '#000',
    borderRadius: 1,
  },
  flashListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listingsContainer: {
    paddingTop: 16,
    paddingBottom: 80, 
  },
  propertyCard: {
    marginBottom: 24,
    marginTop:16
  },
  propertyImageContainer: {
    position: 'relative',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  propertyImage: {
    width: width, // Full width
    height: '100%',
    borderRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  activePaginationDot: {
    opacity: 1,
  },
  propertyDetails: {
    paddingHorizontal: 4,
  },
  propertyLocation: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 4,
  },
  propertyInfo: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
  },
  propertyRating: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  propertyReviews: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  mapButtonContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.SATOSHI_MEDIUM,
    fontSize: 16,
    marginRight: 8,
  },
  mapIcon: {
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom Sheet styles
  bottomSheetContent: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterOptionTextContainer: {
    flex: 1,
  },
  filterOptionText: {
    fontSize: 16,
  },
  filterOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  }
});

export default SearchScreen;
