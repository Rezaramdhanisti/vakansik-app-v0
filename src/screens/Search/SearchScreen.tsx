import React, { useState } from 'react';
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
  Image
} from 'react-native';
import Text from '../../components/Text';
import { FONTS,FONT_WEIGHT } from '../../config/fonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function SearchScreen(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState('Castles');
  
  // Categories data
  const categories = [
    { id: '1', name: 'Budget', icon: 'star' },
    { id: '2', name: 'Extreme', icon: 'tree' },
    { id: '3', name: 'Bandung', icon: 'castle' },
    { id: '4', name: 'Jakarta', icon: 'home-modern' },
    { id: '5', name: 'Yogyakarta', icon: 'tree' },
  ];

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
      <FlatList
        data={propertyListings}
        renderItem={renderPropertyItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listingsContainer}
      />
      
      {/* Map Button */}
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity style={styles.mapButton}>
          <Text style={styles.mapButtonText}>Filter</Text>
          <MaterialCommunityIcons name="filter-outline" size={18} color="#FFF" style={styles.mapIcon} />
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
    marginLeft: 4,
  },
});

export default SearchScreen;
