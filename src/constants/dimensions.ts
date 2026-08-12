import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline design frame (iPhone 14-ish) used for proportional scaling.
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

/** Moderate scale — dampens font/size scaling on very large/small devices. */
export const scaleModerate = (size: number, factor = 0.5) =>
  size + (scaleWidth(size) - size) * factor;

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isTablet = SCREEN_WIDTH >= 768;

export const dimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice,
  isTablet,
  pixelRatio: PixelRatio.get(),

  // Common component sizes
  tabBarHeight: Platform.select({ ios: 84, android: 64, default: 64 }),
  headerHeight: Platform.select({ ios: 96, android: 72, default: 72 }),
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },
  iconSize: {
    sm: 20,
    md: 24,
    lg: 28,
  },
  buttonHeight: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  cardMinHeight: 96,
  screenPaddingHorizontal: scaleWidth(20),
};

export default dimensions;