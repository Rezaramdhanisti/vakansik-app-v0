import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import Text from './Text';
import { FONTS } from '../config/fonts';

export interface DateBottomSheetProps {
  // Add any props you need to pass to the component
}

export interface DateBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const DateBottomSheet = forwardRef<DateBottomSheetRef, DateBottomSheetProps>((props, ref) => {
  // ref for bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  
  // variables for bottom sheet modal
  const snapPoints = useMemo(() => ['80%'], []);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    }
  }));
  
  // callbacks for bottom sheet modal
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
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
      <BottomSheetView style={styles.bottomSheetContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.bottomSheetTitle}>Available Dates</Text>
          <TouchableOpacity onPress={handleCloseModal}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomSheetText}>Calendar content will be added here</Text>
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontFamily: FONTS.SATOSHI_BOLD,
    color: '#000',
  },
  bottomSheetText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DateBottomSheet;
