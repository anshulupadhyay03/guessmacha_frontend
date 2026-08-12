import React, { useEffect, useRef, useState } from 'react';
import { Animated, Share, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius, elevation } from '../../constants/tokens';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import type { MatchStackScreenProps } from '../../navigation/types';

type Outcome = 'win' | 'loss' | 'draw' | 'forfeit_win';

// TODO: replace with the real match summary fetch (RPC/table) once confirmed with backend.
const mockResult = {
  outcome: 'win' as Outcome,
  yourSecret: 'Mango',
  opponentSecret: 'Banana',
  questionsAsked: 6,
  guessesUsed: 1,
  timeTakenSeconds: 142,
  xpEarned: 40,
  coinsEarned: 25,
};

const OUTCOME_COPY: Record<Outcome, { title: string; tone: string }> = {
  win: { title: 'You Won! 🎉', tone: colors.state.success },
  loss: { title: 'You Lost', tone: colors.state.error },
  draw: { title: "It's a Draw", tone: colors.text.secondary },
  forfeit_win: { title: 'Win by Forfeit', tone: colors.state.success },
};

export default function ResultScreen({ navigation, route }: MatchStackScreenProps<'Result'>) {
  const { matchId } = route.params;
  const [statsRevealed, setStatsRevealed] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;

  const outcomeCopy = OUTCOME_COPY[mockResult.outcome];

  useEffect(() => {
    Animated.timing(revealAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(() =>
      setStatsRevealed(true),
    );
  }, [revealAnim]);

  const handleRematch = () => {
    navigation.replace('CreateMatch');
  };

  const handleShare = async () => {
    await Share.share({
      message: `I just played Guess It and ${mockResult.outcome === 'win' ? 'won' : 'played'} in ${mockResult.questionsAsked} questions! 🕵️`,
    });
  };

  const handleHome = () => {
    navigation.getParent()?.goBack();
  };

  return (
    <ScreenContainer style={styles.container}>
      <Text style={[styles.outcomeTitle, { color: outcomeCopy.tone }]}>{outcomeCopy.title}</Text>

      <Animated.View style={[styles.revealCard, { opacity: revealAnim }]}>
        <View style={styles.secretCol}>
          <Text style={styles.secretLabel}>Your Secret</Text>
          <Text style={styles.secretValue}>{mockResult.yourSecret}</Text>
        </View>
        <Text style={styles.vsDivider}>vs</Text>
        <View style={styles.secretCol}>
          <Text style={styles.secretLabel}>Opponent's Secret</Text>
          <Text style={styles.secretValue}>{mockResult.opponentSecret}</Text>
        </View>
      </Animated.View>

      {statsRevealed && (
        <View style={styles.statBox}>
          <StatRow label="Questions Asked" value={mockResult.questionsAsked} />
          <StatRow label="Guesses Used" value={mockResult.guessesUsed} />
          <StatRow label="Time Taken" value={`${mockResult.timeTakenSeconds}s`} />
          <StatRow label="XP Earned" value={`+${mockResult.xpEarned}`} />
          <StatRow label="Coins Earned" value={`+${mockResult.coinsEarned} 🪙`} />
        </View>
      )}

      <View style={styles.actions}>
        <Button label="Rematch" onPress={handleRematch} />
        <Button label="Share Result" onPress={handleShare} variant="secondary" />
        <Button label="Back to Home" onPress={handleHome} variant="ghost" />
      </View>
    </ScreenContainer>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.lg },
  outcomeTitle: { ...textStyles.displayLarge },
  revealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    justifyContent: 'space-around',
    ...elevation.card,
  },
  secretCol: { alignItems: 'center', gap: spacing.xs },
  secretLabel: { ...textStyles.caption, color: colors.text.secondary },
  secretValue: { ...textStyles.title, color: colors.text.primary },
  vsDivider: { ...textStyles.small, color: colors.text.disabled },
  statBox: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statLabel: { ...textStyles.small, color: colors.text.secondary },
  statValue: { ...textStyles.bodyMedium, color: colors.text.primary },
  actions: { width: '100%', gap: spacing.sm, marginTop: 'auto', paddingBottom: spacing.lg },
});