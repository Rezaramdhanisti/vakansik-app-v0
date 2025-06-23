import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Carousel, { Pagination, ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { renderItem } from '../utils/render-item';
import { FONTS } from '../config/fonts';

const { width } = Dimensions.get('window');

interface PropertyCarouselProps {
  images: string[];
  itemId: string;
  onSnapToItem?: (index: number) => void;
  carouselRefs?: React.MutableRefObject<{[key: string]: ICarouselInstance}>;
  showCounter?: boolean;
  fullWidth?: boolean;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ 
  images, 
  itemId, 
  onSnapToItem,
  carouselRefs,
  fullWidth = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Create a shared value for this carousel's progress - this is safe here as we're in a component
  const progressValue = useSharedValue(0);

  return (
    <View style={[styles.container, fullWidth && styles.fullWidthContainer]}>
      <Carousel
        loop={true}
        width={fullWidth ? width : width - 32} // Full width for detail screen, adjusted for card padding otherwise
        height={300}
        autoPlayInterval={0} // Disable autoplay
        data={images}
        ref={(ref) => {
          if (ref && carouselRefs) {
            carouselRefs.current[itemId] = ref;
          }
        }}
        onProgressChange={(_, absoluteProgress) => {
          // Update the shared value for this carousel
          progressValue.value = absoluteProgress;
        }}
        onSnapToItem={(index) => {
          setCurrentIndex(index);
          if (onSnapToItem) onSnapToItem(index);
        }}
        renderItem={({ item, index }) => {
          const renderer = renderItem({ rounded: !fullWidth });
          return renderer({ item: item as string, index });
        }}
        style={styles.carousel}
      />
      
      {/* Image pagination dots */}
      <View style={styles.paginationContainer}>
        <Pagination.Basic
          progress={progressValue}
          data={images}
          size={8}
          dotStyle={{
            borderRadius: 100,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
          activeDotStyle={{
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
          containerStyle={{
            gap: 5,
            marginBottom: 10,
          }}
          horizontal
          onPress={(index: number) => {
            const currentProgress = progressValue.value;
            if (carouselRefs?.current[itemId]) {
              carouselRefs.current[itemId]?.scrollTo({
                count: index - currentProgress,
                animated: true,
              });
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullWidthContainer: {
    borderRadius: 0,
  },
  carousel: {
    width: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
});

export default PropertyCarousel;
