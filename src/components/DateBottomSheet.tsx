import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
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
  // ref for bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  
  // variables for bottom sheet modal
  const snapPoints = useMemo(() => ['90%'], []);
  
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
  

  
  return (
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
          <Text style={styles.dateHeaderText}>June 2025</Text>
          <TouchableOpacity style={styles.calendarButton}>
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
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book now</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
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
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bookButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_BOLD,
  },
});

export default DateBottomSheet;
