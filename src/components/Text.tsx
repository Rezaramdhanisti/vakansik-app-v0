import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { FONTS, FONT_SIZE, getFontFamily } from '../config/fonts';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'button';
  weight?: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'black';
  italic?: boolean;
  color?: string;
}

const Text: React.FC<CustomTextProps> = ({
  children,
  variant = 'body',
  weight = 'regular',
  italic = false,
  color = '#000000',
  style,
  ...props
}) => {
  const fontFamily = getFontFamily(weight, italic);
  
  return (
    <RNText
      style={[
        styles.text,
        styles[variant],
        { fontFamily, color },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.SATOSHI_REGULAR,
  },
  h1: {
    fontSize: FONT_SIZE.xxxl,
    lineHeight: FONT_SIZE.xxxl * 1.3,
  },
  h2: {
    fontSize: FONT_SIZE.xxl,
    lineHeight: FONT_SIZE.xxl * 1.3,
  },
  h3: {
    fontSize: FONT_SIZE.xl,
    lineHeight: FONT_SIZE.xl * 1.3,
  },
  h4: {
    fontSize: FONT_SIZE.lg,
    lineHeight: FONT_SIZE.lg * 1.3,
  },
  h5: {
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.md * 1.3,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  h6: {
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm * 1.3,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
  body: {
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  caption: {
    fontSize: FONT_SIZE.xs,
    lineHeight: FONT_SIZE.xs * 1.5,
  },
  button: {
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.md * 1.3,
    fontFamily: FONTS.SATOSHI_MEDIUM,
  },
});

export default Text;
