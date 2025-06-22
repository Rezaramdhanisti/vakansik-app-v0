import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
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

export interface GuestBottomSheetProps {
  onDismiss?: () => void;
  onSave?: (guest: GuestData) => void;
  initialGuestData?: GuestData;
}

export interface GuestBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export interface GuestData {
  title: string;
  name: string;
  phoneNumber: string;
  idCardNumber: string;
}

const GuestBottomSheet = forwardRef<GuestBottomSheetRef, GuestBottomSheetProps>(
  ({ onDismiss, onSave, initialGuestData }, ref) => {
    // ref for bottom sheet modal
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    
    // variables for bottom sheet modal
    const snapPoints = useMemo(() => ['75%'], []);
    
    // State for guest data
    const [editedGuest, setEditedGuest] = useState<GuestData>(initialGuestData || {
      title: 'Tuan',
      name: '',
      phoneNumber: '+62',
      idCardNumber: ''
    });
    
    // State for validation
    const [showValidation, setShowValidation] = useState(false);
    
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
    
    // Handle title change
    const handleTitleChange = (title: string) => {
      setEditedGuest({ ...editedGuest, title });
    };
    
    // Handle save guest
    const handleSaveGuest = () => {
      // Validate inputs
      if (!editedGuest.name || editedGuest.name.trim() === '' || 
          !editedGuest.phoneNumber || editedGuest.phoneNumber.length <= 3 ||
          !editedGuest.idCardNumber || editedGuest.idCardNumber.trim() === '') {
        setShowValidation(true);
        return;
      }
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(editedGuest);
      }
      
      // Close the bottom sheet
      handleCloseModal();
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
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.bottomSheetContent} collapsable={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Pengunjung</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <Text style={styles.modalSubtitle}>
              Pastikan mengisi detail pengunjung dengan benar untuk kelancaran acara.
            </Text>
            
            {/* Title Selection */}
            <View style={styles.titleSelectionContainer}>
              <TouchableOpacity 
                style={[styles.titleOption]}
                onPress={() => handleTitleChange('Tuan')}
              >
                <View style={[
                  styles.radioButton, 
                  editedGuest.title === 'Tuan' ? styles.radioButtonSelected : styles.radioButtonEmpty
                ]}>
                  {editedGuest.title === 'Tuan' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.titleText}>Tuan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.titleOption, {marginLeft: 16}]}
                onPress={() => handleTitleChange('Nona')}
              >
                <View style={[
                  styles.radioButton, 
                  editedGuest.title === 'Nona' ? styles.radioButtonSelected : styles.radioButtonEmpty
                ]}>
                  {editedGuest.title === 'Nona' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.titleText}>Nona</Text>
              </TouchableOpacity>
            </View>
            
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nama lengkap"
                placeholderTextColor="#CCC"
                value={editedGuest.name}
                onChangeText={(text) => setEditedGuest({...editedGuest, name: text})}
              />
            </View>
            {showValidation && (!editedGuest.name || editedGuest.name.trim() === '') && 
              <Text style={styles.inputLabel}>Isi nama pengunjung dulu, ya.</Text>
            }
            
            {/* Phone Input */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Image 
                  source={require('../../assets/images/lovina-1.jpg')} 
                  style={styles.flagIcon} 
                  resizeMode="contain"
                />
                <Text style={styles.countryCode}>+62</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Nomor Ponsel"
                placeholderTextColor="#CCC"
                value={editedGuest.phoneNumber.replace('+62', '')}
                onChangeText={(text) => setEditedGuest({...editedGuest, phoneNumber: '+62' + text})}
                keyboardType="phone-pad"
              />
            </View>
            {showValidation && (!editedGuest.phoneNumber || editedGuest.phoneNumber.length <= 3) && 
              <Text style={styles.inputLabel}>Isi nomor ponsel dulu, ya.</Text>
            }
            
            {/* ID Card Number Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nomor KTP"
                placeholderTextColor="#CCC"
                value={editedGuest.idCardNumber}
                onChangeText={(text) => setEditedGuest({...editedGuest, idCardNumber: text})}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.infoText}>
              Nomor KTP diperlukan untuk berlabuh menggunakan kapal sesuai dengan peraturan pelayaran.
            </Text>
            {showValidation && (!editedGuest.idCardNumber || editedGuest.idCardNumber.trim() === '') && 
              <Text style={styles.inputLabel}>Isi nomor KTP dulu, ya.</Text>
            }
          </ScrollView>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveGuest}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

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
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666666',
    marginBottom: 20,
  },
  titleSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  titleOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonEmpty: {
    borderColor: '#CCCCCC',
  },
  radioButtonSelected: {
    borderColor: '#000000',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  titleText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000000',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000000',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000000',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#000000',
  },
  infoText: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#666666',
    marginTop: -8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_REGULAR,
    color: '#FF3B30',
    marginTop: -8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SATOSHI_MEDIUM,
    color: '#FFFFFF',
  },
});

export default GuestBottomSheet;
