import { Platform, TextStyle } from 'react-native';

export const fontFamily = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

export const fontSize = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLarge: 17,
  title: 20,
  titleLarge: 24,
  display: 28,
  displayLarge: 34,
};

export const lineHeight = {
  caption: 16,
  small: 18,
  body: 22,
  bodyLarge: 24,
  title: 26,
  titleLarge: 30,
  display: 34,
  displayLarge: 40,
};

/** Ready-to-spread text style presets. */
export const textStyles: Record<string, TextStyle> = {
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.displayLarge,
    lineHeight: lineHeight.displayLarge,
    fontWeight: fontWeight.extrabold,
  },
  display: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeight.extrabold,
  },
  titleLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.titleLarge,
    lineHeight: lineHeight.titleLarge,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
    fontWeight: fontWeight.bold,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    fontWeight: fontWeight.regular,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeight.regular,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeight.medium,
  },
  small: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.small,
    lineHeight: lineHeight.small,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: fontWeight.medium,
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeight.bold,
  },
};

export const typography = { fontFamily, fontWeight, fontSize, lineHeight, textStyles };

export default typography;