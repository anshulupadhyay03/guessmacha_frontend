import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import { CATEGORIES } from '../../constants/categories';
import Button from '../../components/common/Button';
import ScreenContainer from '../../components/common/ScreenContainer';
import { matchService } from '../../services/matchService';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';
import type { MatchStackScreenProps } from '../../navigation/types';

export default function CategorySelectionScreen({
  navigation,
  route,
}: MatchStackScreenProps<'CategorySelection'>) {
  const { matchId } = route.params;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  // Subscribe to the match row for the opponent's "category confirmed" flag.
  // TODO: confirm exact channel/table shape with backend — see useRealtimeChannel.
  useRealtimeChannel(`match:${matchId}`, {
    onEvent: (payload: any) => {
      if (payload?.type === 'category_confirmed' && payload.byOpponent) {
        setOpponentReady(true);
      }
      if (payload?.type === 'both_ready' && payload.categoryId) {
        navigation.replace('SecretObjectSelection', {
          matchId,
          categoryId: payload.categoryId,
        });
      }
    },
  });

  const handleConfirm = async () => {
    if (!selectedId) return;
    setConfirming(true);
    try {
      await matchService.setCategory(matchId, selectedId);
      setConfirmed(true);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <ScreenContainer>
      {opponentReady && !confirmed && (
        <View style={styles.opponentPill}>
          <Text style={styles.opponentPillText}>Opponent has picked ✅ — your turn</Text>
        </View>
      )}

      <Text style={styles.title}>Pick a Category</Text>
      <Text style={styles.subtitle}>You and your opponent must agree on one</Text>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        scrollEnabled={!confirmed}
        renderItem={({ item }) => {
          const selected = selectedId === item.id;
          return (
            <Pressable
              disabled={confirmed}
              onPress={() => setSelectedId(item.id)}
              style={[styles.card, selected && styles.cardSelected, confirmed && styles.cardLocked]}
            >
              <Text style={styles.cardEmoji}>{item.icon}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        {confirmed ? (
          <View style={styles.waitingRow}>
            <Text style={styles.waitingText}>Waiting for opponent to choose…</Text>
          </View>
        ) : (
          <Button
            label="Confirm"
            onPress={handleConfirm}
            disabled={!selectedId}
            loading={confirming}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  opponentPill: {
    alignSelf: 'center',
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  opponentPillText: { ...textStyles.caption, color: colors.state.success },
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm },
  subtitle: { ...textStyles.body, color: colors.text.secondary, marginBottom: spacing.md },
  grid: { paddingBottom: spacing.xl },
  row: { gap: spacing.sm },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryMuted,
  },
  cardLocked: { opacity: 0.6 },
  cardEmoji: { fontSize: 26 },
  cardLabel: { ...textStyles.small, color: colors.text.primary, textAlign: 'center' },
  footer: { paddingBottom: spacing.lg },
  waitingRow: { alignItems: 'center', paddingVertical: spacing.md },
  waitingText: { ...textStyles.body, color: colors.text.secondary },
});