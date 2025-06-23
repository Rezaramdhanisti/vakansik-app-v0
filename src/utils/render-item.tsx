import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';

interface RenderItemOptions {
  rounded?: boolean;
}

export const renderItem = (options: RenderItemOptions = {}) => {
  return ({ item, index }: { item: string; index: number }) => {
    return (
      <View
        style={[
          styles.itemContainer,
          options.rounded && styles.roundedContainer,
        ]}
      >
        <Image
          source={{ uri: item }}
          style={[
            styles.image,
            options.rounded && styles.roundedImage,
          ]}
          resizeMode="cover"
        />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  roundedContainer: {
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  roundedImage: {
    borderRadius: 10,
  },
});
