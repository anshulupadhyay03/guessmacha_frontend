import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { leaderboardService, LeaderboardEntry, LeaderboardScope } from '../../services/leaderboardService';

const TABS: { id: LeaderboardScope; label: string }[] = [
  { id: 'global', label: 'Global' },
  { id: 'country', label: 'Country' },
  { id: 'friends', label: 'Friends' },
  { id: 'category', label: 'Category' },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardScope>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    leaderboardService
      .fetch(activeTab)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <ScreenContainer edges={['top']}>
      <Text style={styles.title}>Leaderboard</Text>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {!loading && activeTab === 'friends' && entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>Add friends to see how you compare</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.userId}
          ListHeaderComponent={
            podium.length > 0 ? (
              <View style={styles.podiumRow}>
                {podium.map((entry) => (
                  <View key={entry.userId} style={styles.podiumItem}>
                    <Text style={styles.podiumAvatar}>{entry.avatarEmoji}</Text>
                    <Text style={styles.podiumRank}>#{entry.rank}</Text>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {entry.username}
                    </Text>
                    <Text style={styles.podiumScore}>{entry.score}</Text>
                  </View>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.row, item.isCurrentUser && styles.rowPinned]}>
              <Text style={styles.rowRank}>#{item.rank}</Text>
              <Text style={styles.rowAvatar}>{item.avatarEmoji}</Text>
              <Text style={styles.rowName}>{item.username}</Text>
              <Text style={styles.rowScore}>{item.score}</Text>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm },
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.md },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
  },
  tabActive: { backgroundColor: colors.accent.primary },
  tabText: { ...textStyles.small, color: colors.text.secondary },
  tabTextActive: { color: colors.text.primary },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  podiumItem: { alignItems: 'center', gap: 2, maxWidth: 100 },
  podiumAvatar: { fontSize: 30 },
  podiumRank: { ...textStyles.caption, color: colors.accent.primary },
  podiumName: { ...textStyles.small, color: colors.text.primary },
  podiumScore: { ...textStyles.caption, color: colors.text.secondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rowPinned: {
    backgroundColor: colors.accent.primaryMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  rowRank: { ...textStyles.small, color: colors.text.secondary, width: 32 },
  rowAvatar: { fontSize: 20 },
  rowName: { ...textStyles.bodyMedium, color: colors.text.primary, flex: 1 },
  rowScore: { ...textStyles.bodyMedium, color: colors.text.primary },
  emptyState: { alignItems: 'center', marginTop: spacing.xxxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...textStyles.body, color: colors.text.secondary },
});