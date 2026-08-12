import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing } from '../../constants/tokens';

/**
 * SplashScreen
 * Doubles as the app's bootstrap screen (rendered directly by AppNavigator
 * while `initializing` is true) and as the first route inside AuthNavigator
 * for a brief branded beat before routing decisions are made.
 */
export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [opacity, scale, pulse]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity, transform: [{ scale: Animated.multiply(scale, pulse) }] },
        ]}
      >
        <Text style={styles.logoEmoji}>🕵️</Text>
        <Text style={styles.logoText}>Guess It</Text>
      </Animated.View>
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoEmoji: {
    fontSize: 56,
  },
  logoText: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
  },
  version: {
    position: 'absolute',
    bottom: spacing.xl,
    ...textStyles.caption,
    color: colors.text.disabled,
  },
});