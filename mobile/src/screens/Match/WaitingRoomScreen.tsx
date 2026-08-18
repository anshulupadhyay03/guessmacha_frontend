import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';
import type { MatchStackScreenProps } from '../../navigation/types';

const DISCONNECT_TIMEOUT_MS = 45000;

export default function WaitingRoomScreen({
  navigation,
  route,
}: MatchStackScreenProps<'WaitingRoom'>) {
  const { matchId } = route.params;
  const [youReady, setYouReady] = useState(true); // arriving here implies you've locked your secret
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useRealtimeChannel(`match:${matchId}`, {
    onEvent: (payload: any) => {
      if (payload?.type === 'secret_locked' && payload.byOpponent) setOpponentReady(true);
      if (payload?.type === 'match_started') setCountdown(3);
    },
    onPresenceChange: (state) => {
      // TODO: derive opponent presence from the actual presence state shape.
      setOpponentConnected(Object.keys(state ?? {}).length > 0);
    },
  });

  // Countdown -> Game
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigation.replace('Game', { matchId });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : c)), 1000);
    return () => clearTimeout(t);
  }, [countdown, matchId, navigation]);

  // Disconnect timeout
  useEffect(() => {
    if (opponentConnected) return;
    const t = setTimeout(() => {
      navigation.goBack();
    }, DISCONNECT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [opponentConnected, navigation]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.vsCard}>
        <View style={styles.playerCol}>
          <Text style={styles.avatar}>🕵️</Text>
          <Text style={styles.name}>You</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.playerCol}>
          <Text style={styles.avatar}>{opponentConnected ? '🎭' : '❓'}</Text>
          <Text style={styles.name}>{opponentConnected ? 'Opponent' : 'Reconnecting…'}</Text>
        </View>
      </View>

      <View style={styles.checklist}>
        <ChecklistRow label="You: category & secret ready" done={youReady} />
        <ChecklistRow label="Opponent: category & secret ready" done={opponentReady} />
      </View>

      {countdown !== null ? (
        <Text style={styles.countdown}>Starting in {countdown}…</Text>
      ) : (
        <Text style={styles.waitingText}>
          {opponentConnected ? 'Waiting for opponent…' : 'Opponent lost connection — waiting…'}
        </Text>
      )}

      <Text style={styles.leaveLink} onPress={() => navigation.goBack()}>
        Leave Match
      </Text>
    </ScreenContainer>
  );
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.checklistRow}>
      <Text style={[styles.checkIcon, done && styles.checkIconDone]}>{done ? '✅' : '⏳'}</Text>
      <Text style={styles.checklistLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  vsCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  playerCol: { alignItems: 'center', gap: spacing.xs },
  avatar: { fontSize: 48 },
  name: { ...textStyles.bodyMedium, color: colors.text.primary },
  vsText: { ...textStyles.title, color: colors.text.secondary },
  checklist: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkIcon: { fontSize: 16, opacity: 0.5 },
  checkIconDone: { opacity: 1 },
  checklistLabel: { ...textStyles.small, color: colors.text.primary },
  countdown: { ...textStyles.displayLarge, color: colors.accent.primary },
  waitingText: { ...textStyles.body, color: colors.text.secondary },
  leaveLink: { ...textStyles.small, color: colors.text.disabled, marginTop: spacing.lg },
});