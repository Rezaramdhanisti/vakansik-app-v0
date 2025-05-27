import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  StatusBar,
  Image,
  Switch
} from 'react-native';
import Modal from 'react-native-modal';
import Text from '../../components/Text';
import { FONTS,FONT_WEIGHT } from '../../config/fonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function SearchScreen(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState('Castles');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [sortByHighestPrice, setSortByHighestPrice] = useState(false);
  const [sortByLowestPrice, setSortByLowestPrice] = useState(false);
  // Define property listing type
  type PropertyListing = {
    id: string;
    location: string;
    builtYear: string;
    dateRange: string;
    price: string;
    nights: string;
    isFavorite: boolean;
  };
  
  const [filteredListings, setFilteredListings] = useState<PropertyListing[]>([]);
  
  // Search suggestions data - divided into cities and activities
  const citySuggestions = [
    { id: 'city-1', name: 'Bali, Indonesia', type: 'city' },
    { id: 'city-2', name: 'Tokyo, Japan', type: 'city' },
    { id: 'city-3', name: 'Paris, France', type: 'city' },
    { id: 'activity-2', name: 'Surfing in Bali', type: 'activity' },
    { id: 'activity-3', name: 'Snorkeling in Raja Ampat', type: 'activity' },
    { id: 'activity-4', name: 'Trekking Mount Bromo', type: 'activity' },
    { id: 'activity-6', name: 'Exploring Borobudur Temple', type: 'activity' },
  ];
  
  // Group suggestions by type
  const cityOnlySuggestions = citySuggestions.filter(item => item.type === 'city');
  const activitySuggestions = citySuggestions.filter(item => item.type === 'activity');

  // Categories data
  const categories = [
    { id: '1', name: 'Budget', icon: 'star' },
    { id: '2', name: 'Extreme', icon: 'tree' },
    { id: '3', name: 'Bandung', icon: 'castle' },
    { id: '4', name: 'Jakarta', icon: 'home-modern' },
    { id: '5', name: 'Yogyakarta', icon: 'tree' },
  ];

  // Convert price string to number for sorting
  const getPriceValue = (priceString: string) => {
    // Extract the numeric part from strings like 'Rp53,601,871'
    const numericString = priceString.replace(/[^0-9]/g, '');
    return parseInt(numericString, 10);
  };

  // Apply filters and sorting to property listings
  useEffect(() => {
    let sorted = [...propertyListings];
    
    if (sortByHighestPrice) {
      sorted.sort((a, b) => getPriceValue(b.price) - getPriceValue(a.price));
    } else if (sortByLowestPrice) {
      sorted.sort((a, b) => getPriceValue(a.price) - getPriceValue(b.price));
    }
    
    setFilteredListings(sorted);
  }, [sortByHighestPrice, sortByLowestPrice]);

  // Property listings data
  const propertyListings = [
    {
      id: '1',
      location: 'Bujra, India',
      builtYear: '2020',
      dateRange: 'Jun 1 - 6',
      price: 'Rp53,601,871',
      nights: '5 nights',
      isFavorite: false
    },
    {
      id: '2',
      location: 'Ubud, Bali',
      builtYear: '2018',
      dateRange: 'Jul 10 - 15',
      price: 'Rp12,500,000',
      nights: '5 nights',
      isFavorite: true
    },
    {
      id: '3',
      location: 'Kyoto, Japan',
      builtYear: '2019',
      dateRange: 'Aug 5 - 10',
      price: 'Rp18,750,000',
      nights: '5 nights',
      isFavorite: false
    },{
      id: '4',
      location: 'Bujra, India',
      builtYear: '2020',
      dateRange: 'Jun 1 - 6',
      price: 'Rp53,601,871',
      nights: '5 nights',
      isFavorite: false
    },
    {
      id: '5',
      location: 'Ubud, Bali',
      builtYear: '2018',
      dateRange: 'Jul 10 - 15',
      price: 'Rp12,500,000',
      nights: '5 nights',
      isFavorite: true
    },
    {
      id: '6',
      location: 'Kyoto, Japan',
      builtYear: '2019',
      dateRange: 'Aug 5 - 10',
      price: 'Rp18,750,000',
      nights: '5 nights',
      isFavorite: false
    },
  ];

  // Render a category item
  const renderCategoryItem = (item: { id: string; name: string; icon: string }) => {
    const isActive = activeCategory === item.name;
    
    const getIcon = () => {
      if (item.icon === 'campground') {
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
  const renderPropertyItem = ({ item }: { item: any }) => (
    <View style={styles.propertyCard}>
      <View style={styles.propertyImageContainer}>
        <View style={styles.propertyImage} />
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons 
            name={item.isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={item.isFavorite ? '#FF5E57' : '#FFF'} 
          />
        </TouchableOpacity>
        
        {/* Image pagination dots */}
        <View style={styles.paginationContainer}>
          {[1, 2, 3, 4, 5].map((dot, index) => (
            <View 
              key={index} 
              style={[styles.paginationDot, index === 0 && styles.activePaginationDot]} 
            />
          ))}
        </View>
      </View>
      
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyLocation}>{item.location}</Text>
        <Text style={styles.propertyInfo}>Built in {item.builtYear}</Text>
        <Text style={styles.propertyInfo}>{item.dateRange}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.propertyPrice}>{item.price}</Text>
          <Text style={styles.propertyNights}> for {item.nights}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} style={styles.searchIcon} color="#333" />
          <TextInput
            style={styles.searchInput}
            placeholder="Start your search"
            placeholderTextColor="#666"
            textAlign="center"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              // Small delay to allow item selection before hiding suggestions
              setTimeout(() => setIsSearchFocused(false), 200);
            }}
          />
        </View>
      </View>

      {/* Search Suggestions */}
      {isSearchFocused && (
        <View style={styles.suggestionsContainer}>
          <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
            {/* Cities Section */}
            <View style={styles.suggestionSection}>
              <Text style={styles.sectionHeader}>Cities</Text>
              {cityOnlySuggestions.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchText(item.name);
                    setIsSearchFocused(false);
                  }}
                >
                  <Icon name="location-on" size={16} color="#666" style={styles.locationIcon} />
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Activities Section */}
            <View style={styles.suggestionSection}>
              <Text style={styles.sectionHeader}>Activities</Text>
              {activitySuggestions.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchText(item.name);
                    setIsSearchFocused(false);
                  }}
                >
                  <MaterialCommunityIcons name="hiking" size={16} color="#666" style={styles.locationIcon} />
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      
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
      <FlatList
        data={filteredListings.length > 0 ? filteredListings : propertyListings}
        renderItem={renderPropertyItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listingsContainer}
      />
      
      {/* Filter Button */}
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.mapButtonText}>Filter</Text>
          <MaterialCommunityIcons name="filter-outline" size={18} color="#FFF" style={styles.mapIcon} />
        </TouchableOpacity>
      </View>
      
      {/* Price Filter Modal */}
      <Modal
        isVisible={isFilterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price</Text>
            
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
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Show results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 30,
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
  listingsContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for the map button
  },
  propertyCard: {
    marginBottom: 24,
  },
  propertyImageContainer: {
    position: 'relative',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
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
  propertyNights: {
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
  // Modal styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
