import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import type { AuthScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🎯',
    title: 'Pick a shared category',
    subtitle: 'You and your opponent agree on one category — Fruits, Cities, Movies, and more.',
  },
  {
    emoji: '🤫',
    title: 'Choose your secret object',
    subtitle: "Secretly select one thing from that category. Your opponent can't see it.",
  },
  {
    emoji: '🕵️',
    title: 'Ask, answer, guess',
    subtitle: 'Chat, ask questions, run polls — then guess their object before they guess yours.',
  },
];

export default function OnboardingScreen({ navigation }: AuthScreenProps<'Onboarding'>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      navigation.replace('Auth');
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const handleSkip = () => navigation.replace('Auth');

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index !== activeIndex) setActiveIndex(index);
    },
  });

  return (
    <ScreenContainer noPadding>
      <View style={styles.skipRow}>
        <Text style={styles.skipText} onPress={handleSkip}>
          Skip
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Text style={styles.illustration}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.ctaWrap}>
        <Button label={isLastSlide ? 'Get Started' : 'Next'} onPress={handleNext} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skipText: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    padding: spacing.sm,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    fontSize: 96,
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border.strong,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
    width: 20,
  },
  ctaWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});