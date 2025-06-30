import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle, useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import dayjs from 'dayjs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainStackParamList, AuthStackParamList, TabStackParamList } from '../navigation/types';
import { SearchStackParamList } from '../navigation/SearchNavigator';
import { AuthContext } from '../navigation/AppNavigator';
import Text from './Text';
import { FONTS } from '../config/fonts';
import { ScrollView } from 'react-native-gesture-handler';

export interface DateBottomSheetProps {
  price?: string;
  onDismiss?: () => void;
  initialGuestCount?: number;
  available_dates?: Record<string, Record<string, number[]>>; // Changed to accept available_dates directly
}

export interface DateBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const DateBottomSheet = forwardRef<DateBottomSheetRef, DateBottomSheetProps>(({ price = 'Rp1,100,000', onDismiss, initialGuestCount = 2, available_dates = {} }, ref) => {
  // Get navigation with proper typing
  type NavigationProp = CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    CompositeNavigationProp<
      StackNavigationProp<MainStackParamList>,
      CompositeNavigationProp<
        BottomTabNavigationProp<TabStackParamList>,
        StackNavigationProp<SearchStackParamList>
      >
    >
  >;
  const navigation = useNavigation<NavigationProp>();
  // Get authentication context
  const { isLoggedIn } = useContext(AuthContext);
  
  // Store trip details for returning after login
  const [pendingTripDetails, setPendingTripDetails] = useState<any>(null);
  // ref for bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const calendarBottomSheetRef = useRef<BottomSheetModal>(null);
  // Add ref for the FlashList with proper type definition
  const flashListRef = useRef<FlashList<{
    id: string;
    type: string;
    day?: string;
    date: string;
    slotId?: string;
    time?: string;
    price?: string;
    spotsLeft?: number;
  }>>(null);
  
  // variables for bottom sheet modal
  const snapPoints = useMemo(() => ['90%'], []);
  const calendarSnapPoints = useMemo(() => ['90%'], []);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    }
  }));
  
  // State for guest count, initialized with the value from props or default to 2
  const [adultCount, setAdultCount] = useState(initialGuestCount);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Increase adult count
  const increaseAdultCount = () => {
    if (adultCount < 10) {
      setAdultCount(adultCount + 1);
    }
  };
  
  // Decrease adult count
  const decreaseAdultCount = () => {
    if (adultCount > 1) {
      setAdultCount(adultCount - 1);
    }
  };

  // Track if we have availability data
  const hasAvailabilityData = available_dates && Object.keys(available_dates).length > 0;
  
  // Use available_dates from props directly
  const availableDates = available_dates || {};
  
  // Generate date time data based on available_dates
  const dateTimeData = useMemo(() => {
    const data: Array<{
      id: string;
      type: string;
      day?: string;
      date: string;
      slotId?: string;
      time?: string;
      price?: string;
      spotsLeft?: number;
    }> = [];
    
    // Default time slot - we'll use this for all available dates
    const defaultTimeSlot = { id: '1', time: '8:00 AM – 3:15 PM', price: price, spotsLeft: 10 };
    
    // Track processed dates to avoid duplicates
    const processedDates = new Set<string>();
    
    // If we have availability data, use it to generate our date list
    if (hasAvailabilityData) {
      // Collect all available dates first
      const availableDateObjects: Array<{dateObj: dayjs.Dayjs, formattedDate: {day: string, date: string}}> = [];
      
      // Iterate through years in available_dates
      Object.keys(availableDates).forEach(year => {
        // Iterate through months in this year
        Object.keys(availableDates[year]).forEach(month => {
          // Iterate through days in this month
          availableDates[year][month].forEach(day => {
            // Create a dayjs object for this date
            const dateObj = dayjs(`${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
            
            // Skip dates in the past
            if (dateObj.isBefore(dayjs().startOf('day'))) {
              return;
            }
            
            // Format the date for display
            const formattedDate = {
              day: dateObj.format('dddd'),
              date: dateObj.format('MMMM D')
            };
            
            // Add to our collection of available dates
            availableDateObjects.push({ dateObj, formattedDate });
          });
        });
      });
      
      // Sort dates chronologically
      availableDateObjects.sort((a, b) => {
        return a.dateObj.isAfter(b.dateObj) ? 1 : -1;
      });
      
      // Now process the sorted dates
      availableDateObjects.forEach(({ formattedDate }) => {
        const dateKey = formattedDate.date;
        
        // Skip if we've already processed this date
        if (processedDates.has(dateKey)) {
          return;
        }
        
        // Mark this date as processed
        processedDates.add(dateKey);
        
        // Add date header item
        data.push({
          id: `header-${dateKey}`,
          type: 'header',
          day: formattedDate.day,
          date: dateKey
        });
        
        // Add time slot for this date (only one per date)
        data.push({
          id: `${dateKey}-${defaultTimeSlot.id}`,
          type: 'timeSlot',
          date: dateKey,
          slotId: defaultTimeSlot.id,
          time: defaultTimeSlot.time,
          price: defaultTimeSlot.price,
          spotsLeft: defaultTimeSlot.spotsLeft
        });
      });
    } else {
      // Fallback to generating dates for the next 30 days if no availability data
      const dates = [];
      const today = dayjs();
      
      // Generate next 30 days
      for (let i = 0; i < 30; i++) {
        const currentDate = today.add(i, 'day');
        dates.push({
          day: currentDate.format('dddd'),
          date: currentDate.format('MMMM D')
        });
      }
      
      // Process each date
      dates.forEach(dateItem => {
        const dateKey = dateItem.date;
        
        // Skip if we've already processed this date
        if (processedDates.has(dateKey)) {
          return;
        }
        
        // Mark this date as processed
        processedDates.add(dateKey);
        
        // Add date header item
        data.push({
          id: `header-${dateKey}`,
          type: 'header',
          day: dateItem.day,
          date: dateKey
        });
        
        // Add time slot for this date (only one per date)
        data.push({
          id: `${dateKey}-${defaultTimeSlot.id}`,
          type: 'timeSlot',
          date: dateKey,
          slotId: defaultTimeSlot.id,
          time: defaultTimeSlot.time,
          price: defaultTimeSlot.price,
          spotsLeft: defaultTimeSlot.spotsLeft
        });
      });
    }
    
    return data;
  }, [price, availableDates, hasAvailabilityData]);
  
  // callbacks for bottom sheet modal
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    // If sheet is closed (index -1), call onDismiss
    if (index === -1 && onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);
  
  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);
  
  // Function to find the index of a date in the dateTimeData array
  const findDateIndex = useCallback((dateToFind: string) => {
    // First find the header index
    const headerIndex = dateTimeData.findIndex(item => 
      item.type === 'header' && item.date.trim() === dateToFind.trim()
    );
    
    if (headerIndex !== -1) {
      return headerIndex;
    }
    return -1;
  }, [dateTimeData]);
  
  // Select a date
  const handleSelectDate = useCallback((date: string) => {
    // Normalize the date string to avoid comparison issues
    const normalizedDate = date.trim();
    setSelectedDate(normalizedDate);
    
    // Scroll to the selected date in the list
    const indexToScroll = findDateIndex(normalizedDate);
    if (indexToScroll !== -1 && flashListRef.current) {
      // Add a small delay to ensure the list is ready
      setTimeout(() => {
        try {
          flashListRef.current?.scrollToIndex({
            index: indexToScroll,
            animated: true,
            viewOffset: 20
          });
        } catch (error) {
          console.warn('Error scrolling to index:', error);
          // Fallback - try to scroll approximately to the position
          const approximateOffset = indexToScroll * 70; // estimatedItemSize
          flashListRef.current?.scrollToOffset({
            offset: approximateOffset,
            animated: true
          });
        }
      }, 50);
    }
    
    // Don't reset time slot when date changes to allow selecting both date and time slot
  }, [findDateIndex]);

  
  
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
  console.log('Selected datexxx', selectedDate);
  // Handle opening the calendar bottom sheet
  const handleOpenCalendar = useCallback(() => {
    // Present the calendar bottom sheet without dismissing the first one
    calendarBottomSheetRef.current?.present();
  }, []);
  
  // Handle closing the calendar bottom sheet
  const handleCloseCalendar = useCallback(() => {
    calendarBottomSheetRef.current?.dismiss();
  }, []);
  
  // State for selected date and month
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MMMM YYYY'));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  
  // Generate available months for multiple years
  const months = useMemo(() => {
    const result = [];
    const today = dayjs();
    // Extend to end of 2026 or the latest year in availableDates
    const years = Object.keys(availableDates).map(Number);
    const maxYear = years.length > 0 ? Math.max(...years) : today.year() + 1;
    const endDate = dayjs(`${maxYear}-12-31`);
    
    // Start from current month
    let currentMonth = today;
    
    // Generate months until we reach end date
    while (currentMonth.isBefore(endDate) || currentMonth.isSame(endDate, 'month')) {
      const monthName = currentMonth.format('MMMM YYYY');
      const daysInMonth = currentMonth.daysInMonth();
      // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
      const startDay = currentMonth.startOf('month').day();
      
      result.push({
        name: monthName,
        days: daysInMonth,
        startDay: startDay,
        monthObj: currentMonth
      });
      
      // Move to next month
      currentMonth = currentMonth.add(1, 'month');
    }
    
    return result;
  }, [availableDates]);
    // Function to check if a date is in the past
    const isPastDate = useCallback((monthObj: dayjs.Dayjs, day: number) => {
      const today = dayjs().startOf('day');
      const dateToCheck = monthObj.date(day).startOf('day');
      return dateToCheck.isBefore(today);
    }, []);

    
  // Function to check if a day is available based on the available_dates data
  const isAvailableDay = useCallback((monthObj: dayjs.Dayjs, dayNumber: number) => {
    // Skip validation for empty days (padding in calendar)
    if (!dayNumber) return false;
    
    // Check if the date is in the past
    if (isPastDate(monthObj, dayNumber)) return false;
    
    // If no availability data is provided, all future dates are available
    if (!hasAvailabilityData) return true;
    
    // Otherwise, check if this date exists in our available dates
    const year = monthObj.year().toString();
    const month = (monthObj.month() + 1).toString(); // dayjs months are 0-indexed
    
    return availableDates[year]?.[month]?.includes(dayNumber) || false;
  }, [availableDates, isPastDate, hasAvailabilityData]);
  

  // Generate calendar data
  const generateCalendarData = useCallback(() => {
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return months.map(month => {
      // Generate days array with empty slots for proper alignment
      const days = [];
      
      // Add empty slots for alignment
      for (let i = 0; i < month.startDay; i++) {
        days.push({ day: '', empty: true });
      }
      
      // Add actual days
      for (let i = 1; i <= month.days; i++) {
        // Check if the day is available based on our Supabase data
        const isAvailable = isAvailableDay(month.monthObj, i);
        // Check if the date is in the past
        const isPast = isPastDate(month.monthObj, i);
        
        days.push({ 
          day: i.toString(), 
          empty: false,
          isAvailable: isAvailable, // Using our new availability check
          isPast: isPast // Add flag to indicate if the date is in the past
        });
      }
      
      return {
        name: month.name,
        weekDays,
        days,
        monthObj: month.monthObj
      };
    });
  }, [months, isAvailableDay, isPastDate]);
  
  const calendarData = useMemo(() => generateCalendarData(), [generateCalendarData]);
  
  // Empty content to remove duplicate function declaration
  

  // Handle selecting a date
  const handleSelectCalendarDate = useCallback((month: string, day: string, monthObj: dayjs.Dayjs) => {
    // Only allow selection if the day is available
    const dayNumber = parseInt(day, 10);
    if (!isAvailableDay(monthObj, dayNumber)) {
      // Day is not available, don't select it
      return;
    }
    
    // Format the date properly
    const selectedDate = monthObj.date(dayNumber);
    const formattedDate = `${month} ${day}`;
    setSelectedCalendarDate(formattedDate);
    setSelectedMonth(month);
    
    // Find a matching date in dateTimeData to select in the main sheet
    const formattedDayForComparison = selectedDate.format('MMMM D');
    const matchingDateItem = dateTimeData.find(item => 
      item.type === 'header' && item.date === formattedDayForComparison
    );
    
    if (matchingDateItem) {
      // Select this date in the main view
      handleSelectDate(matchingDateItem.date);
      
      // Find the index and scroll to it
      const indexToScroll = findDateIndex(matchingDateItem.date);
      if (indexToScroll !== -1 && flashListRef.current) {
        // Add a small delay to ensure the list is ready after the calendar closes
        setTimeout(() => {
          try {
            flashListRef.current?.scrollToIndex({
              index: indexToScroll,
              animated: true,
              // Add viewport offset to position the item better in view
              viewOffset: 20
            });
          } catch (error) {
            console.warn('Error scrolling to index:', error);
            // Fallback - try to scroll approximately to the position
            const approximateOffset = indexToScroll * 70; // estimatedItemSize
            flashListRef.current?.scrollToOffset({
              offset: approximateOffset,
              animated: true
            });
          }
        }, 200); // Slightly longer delay for more reliability
      }
    }
    
    // Close the calendar sheet
    handleCloseCalendar();
  }, [handleCloseCalendar, dateTimeData, handleSelectDate, isAvailableDay, findDateIndex]);
  
  
  // Calculate total price based on price per guest and guest count
  const calculateTotalPrice = useCallback(() => {
    // Extract numeric value from price string (e.g., 'Rp1,100,000' -> 1100000)
    const priceString = price.replace(/[^0-9]/g, '');
    const priceValue = parseInt(priceString, 10);
    
    if (isNaN(priceValue)) {
      return price; // Return original price if parsing fails
    }
    
    // Calculate total price based on guest count
    const totalPrice = priceValue * adultCount;
    
    // Format the total price with 'Rp' prefix and thousand separators
    return `Rp${totalPrice.toLocaleString('id-ID')}`;
  }, [price, adultCount]);
  

  
  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backdropComponent={renderBackdrop}
        enableContentPanningGesture={false} 
      >
        <BottomSheetView style={styles.bottomSheetContent} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.bottomSheetTitle}>Select a time</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Guest Count Selector */}
          <View style={styles.sectionContainer}>
            <View style={styles.guestCountRow}>
              <View>
                <Text style={styles.guestCountText}>{adultCount} adults</Text>
              </View>
              
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[styles.counterButton, adultCount <= 1 && styles.counterButtonDisabled]} 
                  onPress={decreaseAdultCount}
                  disabled={adultCount <= 1}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                
                <Text style={styles.counterValue}>{adultCount}</Text>
                
                <TouchableOpacity 
                  style={[styles.counterButton, adultCount >= 10 && styles.counterButtonDisabled]} 
                  onPress={increaseAdultCount}
                  disabled={adultCount >= 10}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Date Selector Header */}
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{selectedMonth}</Text>
            <TouchableOpacity style={styles.calendarButton} onPress={handleOpenCalendar}>
              <Ionicons name="calendar-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Dates and Time Slots using FlashList */}
          <View style={styles.scrollViewContainer}>
            <FlashList
              ref={flashListRef}
              data={dateTimeData}
              extraData={selectedDate} /* Add extraData prop to force re-render when selectedDate changes */
              estimatedItemSize={70}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
              onBlankArea={() => {/* Required for TypeScript */}}
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  // Render date header
                  return (
                    <Text style={styles.dayText}>{item.day}, {item.date}</Text>
                  );
                } else {
                  // Render time slot
                  return (
                    <Pressable
                      style={[
                        styles.timeSlotContainer,
                        selectedDate === item.date.trim() && styles.selectedTimeSlot 
                      ]}
                      onPress={() => {
                        // Add more detailed logging for debugging
                        handleSelectDate(item.date);
                      }}
                      android_ripple={{ color: '#DDDDDD' }}
                    >
                      <View>
                        {/* <Text style={styles.timeSlotText}>{item.time}</Text> */}
                        <Text style={styles.priceText}>{item.price} / guest</Text>
                      </View>
                      <Text style={styles.spotsLeftText}>10 spots left</Text>
                    </Pressable>
                  );
                }
              }}
              keyExtractor={(item) => item.id}
            />
          </View>
          
          {/* Only show Book Now button when a date and time slot are selected */}
          {selectedDate && (
            <View style={styles.bookButtonContainer}>
              <View style={styles.bookingBar}>
                <View style={styles.priceContainer}>
                  <Text style={styles.totalPriceText}>{calculateTotalPrice()}</Text>
                  <Text style={styles.guestInfoText}>for {adultCount} guests</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.nextButton}
                  onPress={() => {
                    // Create trip details object
                    const tripDetails = {
                      title: 'Explore Bali Highlights -Customized Full day Tour',
                      image: require('../../assets/images/lovina-1.jpg'),
                      rating: 4.9,
                      reviewCount: 5098,
                      date: `${selectedDate}`,
                      timeSlot: dateTimeData.find(item => 
                        item.type === 'timeSlot' && 
                        item.date === selectedDate
                      )?.time || '3:30 AM – 11:45 AM',
                      price: 'Rp780,000',
                      guestCount: adultCount
                    };
                    
                    // Check if user is logged in
                    if (isLoggedIn) {
                      // User is logged in, proceed to confirmation page
                      // Navigate to ConfirmPay through the Explore tab
                      navigation.navigate('Explore', {
                        screen: 'ConfirmPay',
                        params: { tripDetails }
                      });
                    } else {
                      // Store trip details for later use
                      setPendingTripDetails(tripDetails);
                      
                      // Navigate to Auth screen with return parameters
                      navigation.navigate('Auth', {
                        screen: 'Login',
                      });
                    }
                  }}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
      
      {/* Calendar Bottom Sheet */}
      <BottomSheetModal
        ref={calendarBottomSheetRef}
        index={0}
        snapPoints={calendarSnapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backdropComponent={renderBackdrop}
        stackBehavior="push" // This makes it stack on top of the first bottom sheet
      >
        <BottomSheetView style={styles.bottomSheetContent} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.bottomSheetTitle}>Select a date</Text>
            <TouchableOpacity onPress={handleCloseCalendar}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {calendarData.map((monthData) => (
              <View key={monthData.name} style={styles.calendarMonthContainer}>
                <Text style={styles.calendarMonthTitle}>{monthData.name}</Text>
                
                {/* Week days header */}
                <View style={styles.weekDaysContainer}>
                  {monthData.weekDays.map((day, index) => (
                    <Text key={`${monthData.name}-weekday-${index}`} style={styles.weekDayText}>
                      {day}
                    </Text>
                  ))}
                </View>
                
                {/* Calendar days grid */}
                <View style={styles.calendarDaysContainer}>
                  {monthData.days.map((dayObj, index) => {
                    const isSelected = selectedCalendarDate === `${monthData.name} ${dayObj.day}`;
                    const isToday = dayjs().format('MMMM YYYY') === monthData.name && 
                                    dayjs().date().toString() === dayObj.day;
                    
                    return (
                      <View 
                        key={`${monthData.name}-day-${index}`} 
                        style={[styles.calendarDayCell, dayObj.empty && styles.emptyDayCell]}
                      >
                        {!dayObj.empty && (
                          <TouchableOpacity
                            style={[
                              styles.calendarDayButton, 
                              isSelected && styles.selectedDayButton, 
                              isToday && styles.todayButton,
                              dayObj.isPast && styles.disabledDay,
                              !dayObj.isAvailable && !dayObj.isPast && styles.disabledDay
                            ]}
                            onPress={() => handleSelectCalendarDate(monthData.name, dayObj.day, monthData.monthObj)}
                            disabled={dayObj.isPast || !dayObj.isAvailable}
                          >
                            <Text style={[
                              styles.calendarDayText, 
                              isSelected && styles.selectedDayText, 
                              isToday && styles.todayText,
                              (dayObj.isPast || !dayObj.isAvailable) && styles.disabledDayText
                            ]}>
                              {dayObj.day}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
});

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  scrollViewContainer: {
    flex: 1,
    height: 300,
    marginBottom: 10,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  guestCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestCountText: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginTop: 16
  },
  childrenLink: {
    marginTop: 4,
  },
  childrenLinkText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
    textDecorationLine: 'underline',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    borderColor: '#CCC',
  },
  counterButtonText: {
    fontSize: 20,
    color: '#000',
  },
  counterValue: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    marginHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 20,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  dateHeaderText: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  calendarButton: {
    padding: 8,
  },
  dayText: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedTimeSlot: {
    borderColor: '#000',
    borderWidth: 2,
    opacity: 0.8
  },
  timeSlotText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  spotsLeftText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  bookButtonContainer: {
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  bookingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  totalPriceText: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  guestInfoText: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#222',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  calendarMonthContainer: {
    marginBottom: 32,
  },
  calendarMonthTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#666',
  },
  calendarDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDayCell: {
    width: '14.28%',
    height: 50,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayCell: {
    opacity: 0,
  },
  calendarDayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#000',
  },
  todayButton: {
    borderWidth: 2,
    borderColor: '#000',
  },
  calendarDayText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000',
  },
  selectedDayText: {
    color: '#FFF',
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  todayText: {
    fontFamily: FONTS.SATOSHI_BOLD,
  },
  disabledDayButton: {
    backgroundColor: '#F5F5F5',
  },
  disabledDayText: {
    color: '#AAAAAA',
  },
  disabledDay: {
    backgroundColor: '#F5F5F5',
  },
});

export default DateBottomSheet;
