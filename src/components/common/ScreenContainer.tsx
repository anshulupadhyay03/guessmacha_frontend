import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { dimensions } from '../../constants/dimensions';

interface ScreenContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  noPadding?: boolean;
}

/** Common full-screen wrapper: safe area + base background + horizontal padding. */
export default function ScreenContainer({
  children,
  style,
  edges = ['top', 'bottom'],
  noPadding = false,
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      <View style={[styles.content, !noPadding && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: dimensions.screenPaddingHorizontal,
  },
});