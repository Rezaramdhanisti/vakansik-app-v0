import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Text from './Text';
import { FONTS } from '../config/fonts';
import { ScrollView } from 'react-native-gesture-handler';

export interface DateBottomSheetProps {
  price?: string;
  onDismiss?: () => void;
}

export interface DateBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const DateBottomSheet = forwardRef<DateBottomSheetRef, DateBottomSheetProps>(({ price = 'Rp1,100,000', onDismiss }, ref) => {
  // Get navigation with proper typing
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // ref for bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const calendarBottomSheetRef = useRef<BottomSheetModal>(null);
  
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
  
  // State for guest count
  const [adultCount, setAdultCount] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
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
  
  // Sample dates and time slots combined for the flat list
  const dateTimeData = useMemo(() => {
    const dates = [
      { day: 'Saturday', date: 'June 28' },
      { day: 'Sunday', date: 'June 29' },
      { day: 'Saturday', date: 'June 30' },
      { day: 'Sunday', date: 'June 31' },
      { day: 'Saturday', date: 'June 32' },
      { day: 'Sunday', date: 'June 33' },
      { day: 'Saturday', date: 'June 34' },
    ];
    
    const timeSlots = [
      { id: '1', time: '8:00 AM – 3:15 PM', price: price, spotsLeft: 10 },
      { id: '2', time: '8:30 AM – 4:30 PM', price: price, spotsLeft: 5 },
    ];
    
    // Create a flat array with section headers and time slots
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
    
    dates.forEach(dateItem => {
      // Add date header item
      data.push({
        id: `header-${dateItem.date}`,
        type: 'header',
        day: dateItem.day,
        date: dateItem.date
      });
      
      // Add time slots for this date
      timeSlots.forEach(slot => {
        data.push({
          id: `${dateItem.date}-${slot.id}`,
          type: 'timeSlot',
          date: dateItem.date,
          slotId: slot.id,
          time: slot.time,
          price: slot.price,
          spotsLeft: slot.spotsLeft
        });
      });
    });
    
    return data;
  }, [price]);
  
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
  
  // Select a date
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };
  
  // Select a time slot
  const handleSelectTimeSlot = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };
  
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
  const [selectedMonth, setSelectedMonth] = useState('June 2025');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  
  // Available months
  const months = useMemo(() => [
    { name: 'May 2025', days: 31, startDay: 3 }, // 0 = Sunday, so 3 = Wednesday
    { name: 'June 2025', days: 30, startDay: 6 }, // 6 = Saturday
    { name: 'July 2025', days: 31, startDay: 1 },
    { name: 'August 2025', days: 31, startDay: 4 },
    { name: 'September 2025', days: 30, startDay: 0 },
    { name: 'October 2025', days: 31, startDay: 2 },
    { name: 'November 2025', days: 30, startDay: 5 },
    { name: 'December 2025', days: 31, startDay: 0 }
  ], []);
  
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
        days.push({ day: i.toString(), empty: false });
      }
      
      return {
        name: month.name,
        weekDays,
        days
      };
    });
  }, [months]);
  
  const calendarData = useMemo(() => generateCalendarData(), [generateCalendarData]);
  
  // Handle selecting a date
  const handleSelectCalendarDate = useCallback((month: string, day: string) => {
    const formattedDate = `${month} ${day}`;
    setSelectedCalendarDate(formattedDate);
    setSelectedMonth(month);
    
    // Just close the calendar sheet without affecting the main sheet
    handleCloseCalendar();
  }, [handleCloseCalendar]);
  

  
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
          
          {/* Dates and Time Slots using ScrollView */}
          <ScrollView 
            style={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {dateTimeData.map(item => {
              if (item.type === 'header') {
                // Render date header
                return (
                  <Text key={item.id} style={styles.dayText}>{item.day}, {item.date}</Text>
                );
              } else {
                // Render time slot
                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.timeSlotContainer,
                      selectedDate === item.date && selectedTimeSlot === item.slotId && styles.selectedTimeSlot
                    ]}
                    onPress={() => {
                      handleSelectDate(item.date);
                      handleSelectTimeSlot(item.slotId || '');
                    }}
                  >
                    <View>
                      <Text style={styles.timeSlotText}>{item.time}</Text>
                      <Text style={styles.priceText}>{item.price} / guest</Text>
                    </View>
                    <Text style={styles.spotsLeftText}>{item.spotsLeft} spots left</Text>
                  </Pressable>
                );
              }
            })}
          </ScrollView>
          
          {/* Only show Book Now button when a date and time slot are selected */}
          {selectedDate && selectedTimeSlot && (
            <View style={styles.bookButtonContainer}>
              <View style={styles.bookingBar}>
                <View style={styles.priceContainer}>
                  <Text style={styles.totalPriceText}>Rp780,000</Text>
                  <Text style={styles.guestInfoText}>for {adultCount} guests</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.nextButton}
                  onPress={() => {
                    // Navigate to the Confirm and Pay screen with trip details
                    navigation.navigate('ConfirmPay', {
                      tripDetails: {
                        title: 'Explore Bali Highlights -Customized Full day Tour',
                        image: require('../../assets/images/lovina-1.jpg'),
                        rating: 4.9,
                        reviewCount: 5098,
                        date: `${selectedDate}`,
                        timeSlot: dateTimeData.find(item => 
                          item.type === 'timeSlot' && 
                          item.date === selectedDate && 
                          item.slotId === selectedTimeSlot
                        )?.time || '3:30 AM – 11:45 AM',
                        price: 'Rp780,000',
                        guestCount: adultCount
                      }
                    });
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
                    const isToday = monthData.name === 'May 2025' && dayObj.day === '27';
                    
                    return (
                      <View 
                        key={`${monthData.name}-day-${index}`} 
                        style={[styles.calendarDayCell, dayObj.empty && styles.emptyDayCell]}
                      >
                        {!dayObj.empty && (
                          <Pressable
                            style={[styles.calendarDayButton, isSelected && styles.selectedDayButton, isToday && styles.todayButton]}
                            onPress={() => handleSelectCalendarDate(monthData.name, dayObj.day)}
                          >
                            <Text style={[styles.calendarDayText, isSelected && styles.selectedDayText, isToday && styles.todayText]}>
                              {dayObj.day}
                            </Text>
                          </Pressable>
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
  },
  timeSlotText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
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
});

export default DateBottomSheet;
