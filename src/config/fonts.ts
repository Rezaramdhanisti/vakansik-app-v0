// Font configuration for the app

export const FONTS = {
  // Satoshi font family
  SATOSHI_BLACK: 'Satoshi-Black',
  SATOSHI_BLACK_ITALIC: 'Satoshi-BlackItalic',
  SATOSHI_BOLD: 'Satoshi-Bold',
  SATOSHI_BOLD_ITALIC: 'Satoshi-BoldItalic',
  SATOSHI_ITALIC: 'Satoshi-Italic',
  SATOSHI_LIGHT: 'Satoshi-Light',
  SATOSHI_LIGHT_ITALIC: 'Satoshi-LightItalic',
  SATOSHI_MEDIUM: 'Satoshi-Medium',
  SATOSHI_MEDIUM_ITALIC: 'Satoshi-MediumItalic',
  SATOSHI_REGULAR: 'Satoshi-Regular',
};

// Font size configuration
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// Font weight configuration (for cross-platform consistency)
export const FONT_WEIGHT = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  black: '900',
};

// Helper function to get the font family based on weight and style
export const getFontFamily = (
  weight: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'black' = 'regular',
  isItalic: boolean = false
): string => {
  switch (weight) {
    case 'light':
      return FONTS.SATOSHI_LIGHT;
    case 'medium':
      return FONTS.SATOSHI_MEDIUM;
    case 'semiBold':
    case 'bold':
      return FONTS.SATOSHI_BOLD;
    case 'black':
      return FONTS.SATOSHI_BLACK;
    case 'regular':
    default:
      return FONTS.SATOSHI_REGULAR;
  }
};
