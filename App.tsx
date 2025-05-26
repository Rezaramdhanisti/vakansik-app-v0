/**
 * MyTravel App
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  FlatList,
  useColorScheme,
} from 'react-native';
// Import vector icons
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
// Import custom Text component with Satoshi font
import Text from './src/components/Text';
// Import font configuration
import { FONTS } from './src/config/fonts';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // Categories data for the continent sections
  const continents = [
    { id: '1', name: 'Asia' },
    { id: '2', name: 'Oceania' },
    { id: '3', name: 'Europe' },
    { id: '4', name: 'North America' },
  ];

  // Categories data for the trip types
  const tripTypes = [
    { id: '1', name: 'Budget Trip' },
    { id: '2', name: 'Luxury Trip' },
    { id: '3', name: 'Holyland' },
    { id: '4', name: 'All Product' },
  ];
  
  // Featured travel packages data
  const travelPackages = [
    {
      id: '1',
      title: 'Zen Retreat in Bhutan: Thimphu',
      location: 'Bhutan, Central Asia',
      price: 'RP 30,990,000',
      rating: 4.6,
      agency: 'Soiree Expeditions'
    },
    {
      id: '2',
      title: 'Shanghai City Exploration',
      location: 'China, East Asia',
      price: 'RP 25,500,000',
      rating: 4.8,
      agency: 'Sky Tours'
    },
    {
      id: '3',
      title: 'Bali Paradise Getaway',
      location: 'Indonesia, Southeast Asia',
      price: 'RP 15,750,000',
      rating: 4.7,
      agency: 'Island Ventures'
    }
  ];
  
  // Inspiration packages data
  const inspirationPackages = [
    {
      id: '1',
      title: 'Swiss Alpine Heritage: Zurich and...',
      location: 'Switzerland',
      price: 'Rp 30,990,000',
      rating: 4.6,
      agency: 'Suita Tour'
    },
    {
      id: '2',
      title: '5 Days Mono Singapore',
      location: 'Singapore',
      price: 'Rp 19,990,000',
      rating: 4.6,
      agency: 'Suita Tour'
    },
    {
      id: '3',
      title: 'Korean Dream Escape: 7 Days of C...',
      location: 'South Korea',
      price: 'Rp 24,990,000',
      rating: 4.6,
      agency: 'Suita Tour'
    },
    {
      id: '4',
      title: 'Parisian Charm: Exploring the Best o...',
      location: 'Spain',
      price: 'Rp 25,990,000',
      rating: 4.6,
      agency: 'Catalan Esca...'
    }
  ];

  // Render a category item (continent or trip type)
  const renderCategoryItem = (item: { id: string; name: string }, isContinent: boolean) => {
    // Get the appropriate icon based on category
    const getIcon = () => {
      if (isContinent) {
        switch(item.name) {
          case 'Asia': return <FontAwesome name="globe" size={24} color="#00AA44" />;
          case 'Oceania': return <FontAwesome name="ship" size={24} color="#00AA44" />;
          case 'Europe': return <FontAwesome name="building" size={24} color="#00AA44" />;
          case 'North America': return <FontAwesome name="tree" size={24} color="#00AA44" />;
          default: return <FontAwesome name="map-marker" size={24} color="#00AA44" />;
        }
      } else {
        switch(item.name) {
          case 'Budget Trip': return <FontAwesome name="money" size={24} color="#0096B4" />;
          case 'Luxury Trip': return <FontAwesome name="diamond" size={24} color="#0096B4" />;
          case 'Holyland': return <FontAwesome name="star" size={24} color="#9C27B0" />;
          case 'All Product': return <FontAwesome name="th-large" size={24} color="#0096B4" />;
          default: return <FontAwesome name="suitcase" size={24} color="#0096B4" />;
        }
      }
    };
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[
          styles.categoryItem, 
          isContinent ? styles.continentItem : styles.tripTypeItem
        ]}
      >
        <View style={[
          styles.iconContainer,
          isContinent ? styles.continentIcon : styles.tripTypeIcon,
          item.name === 'Budget Trip' ? styles.budgetIcon : null,
          item.name === 'Luxury Trip' ? styles.luxuryIcon : null,
          item.name === 'Holyland' ? styles.holylandIcon : null,
        ]}>
          {getIcon()}
        </View>
        <Text style={styles.categoryText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00AA44" />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Profile and Notification Row */}
          <View style={styles.profileRow}>
            <View style={styles.profileContainer}>
              <View style={styles.profileImage} />
              <View>
                <Text style={styles.greeting}>Good Morning, Traveler!</Text>
                <Text style={styles.welcomeBack}>Welcome back!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationIcon}>
              <Icon name="notifications" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Main Heading */}
          <Text style={styles.mainHeading}>Adventures Begin Here!</Text>
          <Text style={styles.subHeading}>Where to next?</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} style={styles.searchIcon} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by country or city"
              placeholderTextColor="#999"
            />
          </View>
        </View>
        
        {/* Continents Section */}
        <View style={styles.categoriesContainer}>
          {continents.map(item => renderCategoryItem(item, true))}
        </View>
        
        {/* Trip Types Section */}
        <View style={styles.categoriesContainer}>
          {tripTypes.map(item => renderCategoryItem(item, false))}
        </View>
        
        {/* Featured Packages Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Discover Your Perfect Escape</Text>
          <Text style={styles.sectionSubtitle}>Ad | Explore and learn your next holiday!</Text>
          
          <FlatList
            data={travelPackages}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={CARD_WIDTH + 20}
            decelerationRate="fast"
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.packageCard}>
                <View style={styles.cardImageContainer}>
                  <View style={styles.cardImage} />
                  <View style={styles.ratingContainer}>
                    <Text style={styles.agencyName}>{item.agency} | </Text>
                    <Icon name="star" size={14} style={styles.starIcon} />
                    <Text style={styles.ratingText}> {item.rating}</Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.packageTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.locationContainer}>
                    <Entypo name="location-pin" size={16} color="#666" style={styles.locationIcon} />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Start from</Text>
                    <Text style={styles.priceValue}>{item.price}<Text style={styles.paxText}>/pax</Text></Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        
        {/* Inspiration Grid Section */}
        <View style={styles.inspirationSection}>
          <Text style={styles.sectionTitle}>Inspiration For You</Text>
          <Text style={styles.sectionSubtitle}>Explore and learn your next holiday!</Text>
          
          <View style={styles.gridContainer}>
            {inspirationPackages.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridCard}>
                <View style={styles.gridImageContainer}>
                  <View style={styles.gridImage} />
                  <View style={styles.locationBadge}>
                    <Text style={styles.locationBadgeText}>{item.location}</Text>
                  </View>
                </View>
                
                <View style={styles.gridCardContent}>
                  <Text style={styles.gridPackageTitle} numberOfLines={2}>{item.title}</Text>
                  
                  <View style={styles.gridAgencyRow}>
                    <View style={styles.agencyBadge}>
                      <Text style={styles.agencyBadgeText}>{item.agency}</Text>
                    </View>
                    <View style={styles.gridRatingContainer}>
                      <Icon name="star" size={12} style={styles.gridStarIcon} />
                      <Text style={styles.gridRatingText}>{item.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.gridPriceContainer}>
                    <Text style={styles.gridPriceLabel}>Start from</Text>
                    <Text style={styles.gridPriceValue}>{item.price}<Text style={styles.gridPaxText}>/pax</Text></Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Menu */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Ionicons name="home" size={24} color="#00AA44" />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Ionicons name="search" size={24} color="#999999" />
          </View>
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Ionicons name="calendar" size={24} color="#999999" />
          </View>
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Ionicons name="person" size={24} color="#999999" />
          </View>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    marginBottom: 60, // Height of bottom nav
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#00AA44',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  welcomeBack: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  mainHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: FONTS.SATOSHI_BOLD,
    marginBottom: 5,
  },
  subHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_REGULAR,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  continentItem: {
    // Specific styles for continent items
  },
  tripTypeItem: {
    // Specific styles for trip type items
  },
  continentIcon: {
    backgroundColor: '#E8F5E9',
  },
  tripTypeIcon: {
    backgroundColor: '#E3F2FD',
  },
  budgetIcon: {
    backgroundColor: '#E3F2FD',
  },
  luxuryIcon: {
    backgroundColor: '#E3F2FD',
  },
  holylandIcon: {
    backgroundColor: '#F3E5F5',
  },
  categoryText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  featuredSection: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    marginBottom: 15,
  },
  carouselContainer: {
    paddingRight: 15,
    paddingBottom: 10,
  },
  packageCard: {
    width: CARD_WIDTH,
    marginLeft: 15,
    borderRadius: 15,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 150, 180, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agencyName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  starIcon: {
    color: '#FFD700',
  },
  ratingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  cardContent: {
    padding: 15,
  },
  packageTitle: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    marginRight: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  priceContainer: {
    marginTop: 5,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  priceValue: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
  },
  paxText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  inspirationSection: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8F8',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  locationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  locationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  gridCardContent: {
    padding: 10,
  },
  gridPackageTitle: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  gridAgencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agencyBadgeText: {
    color: '#333',
    fontSize: 10,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  gridRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridStarIcon: {
    color: '#FFD700',
    marginRight: 2,
  },
  gridRatingText: {
    fontSize: 10,
    color: '#333',
    fontFamily: FONTS.SATOSHI_BOLD,
    marginLeft: 2,
  },
  gridPriceContainer: {
    marginTop: 5,
  },
  gridPriceLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  gridPriceValue: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#00AA44',
  },
  gridPaxText: {
    fontSize: 10,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  activeNavText: {
    color: '#00AA44',
    fontWeight: '500',
    fontFamily: FONTS.SATOSHI_BOLD,
  },
});

export default App;
