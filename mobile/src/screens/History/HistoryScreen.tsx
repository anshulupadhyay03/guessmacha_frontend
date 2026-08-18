import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import { profileService, MatchHistoryItem } from '../../services/profileService';
import type { ProfileStackScreenProps } from '../../navigation/types';

const OUTCOME_STYLE: Record<MatchHistoryItem['outcome'], { label: string; color: string }> = {
  win: { label: 'W', color: colors.state.success },
  loss: { label: 'L', color: colors.state.error },
  draw: { label: 'D', color: colors.text.secondary },
  forfeit_win: { label: 'W', color: colors.state.success },
  forfeit_loss: { label: 'L', color: colors.state.error },
};

export default function HistoryScreen({ navigation }: ProfileStackScreenProps<'History'>) {
  const [items, setItems] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    profileService
      .getHistory(page)
      .then((newItems) => setItems((prev) => (page === 0 ? newItems : [...prev, ...newItems])))
      .finally(() => setLoading(false));
  }, [page]);

  if (!loading && items.length === 0) {
    return (
      <ScreenContainer style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📜</Text>
        <Text style={styles.emptyText}>No matches yet — play your first game</Text>
        <Button
          label="Play Now"
          onPress={() => (navigation.getParent() as any)?.navigate('HomeTab')}
          style={styles.emptyButton}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <Text style={styles.title}>Match History</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        onEndReached={() => setPage((p) => p + 1)}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => {
          const outcome = OUTCOME_STYLE[item.outcome];
          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                item.hasReplay &&
                (navigation.getParent() as any)?.navigate('MatchFlow', {
                  screen: 'Replay',
                  params: { matchId: item.id },
                })
              }
            >
              <Text style={styles.rowAvatar}>{item.opponentAvatarEmoji}</Text>
              <View style={styles.rowInfo}>
                <Text style={styles.rowOpponent}>{item.opponentUsername}</Text>
                <Text style={styles.rowMeta}>
                  {item.categoryIcon} {item.categoryLabel} · {new Date(item.playedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.outcomeBadge, { backgroundColor: outcome.color }]}>
                <Text style={styles.outcomeBadgeText}>{outcome.label}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  rowAvatar: { fontSize: 28 },
  rowInfo: { flex: 1 },
  rowOpponent: { ...textStyles.bodyMedium, color: colors.text.primary },
  rowMeta: { ...textStyles.caption, color: colors.text.secondary, marginTop: 2 },
  outcomeBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outcomeBadgeText: { ...textStyles.caption, color: colors.text.primary, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...textStyles.body, color: colors.text.secondary },
  emptyButton: { marginTop: spacing.md, width: 160 },
});
