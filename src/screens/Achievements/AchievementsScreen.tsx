import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import { profileService, Achievement } from '../../services/profileService';
import ScreenContainer from '../../components/common/ScreenContainer';

type Filter = 'all' | 'unlocked' | 'in_progress';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'in_progress', label: 'In Progress' },
];

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Achievement | null>(null);

  useEffect(() => {
    profileService
      .listAchievements()
      .then(setAchievements)
      .finally(() => setLoading(false));
  }, []);

  const filtered = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'in_progress') return !a.unlocked;
    return true;
  });

  return (
    <ScreenContainer edges={['top']}>
      <Text style={styles.title}>Achievements</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelected(item)}>
            <Text style={[styles.cardIcon, !item.unlocked && styles.cardIconLocked]}>
              {item.icon}
            </Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {!item.unlocked && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
              </View>
            )}
          </Pressable>
        )}
      />

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <View style={styles.detailCard}>
            <Text style={styles.detailIcon}>{selected?.icon}</Text>
            <Text style={styles.detailTitle}>{selected?.title}</Text>
            <Text style={styles.detailDescription}>{selected?.description}</Text>
            {selected?.unlocked ? (
              <Text style={styles.detailUnlocked}>
                Unlocked {selected?.unlockedAt ? new Date(selected.unlockedAt).toLocaleDateString() : ''}
              </Text>
            ) : (
              <Text style={styles.detailProgress}>{Math.round((selected?.progress ?? 0) * 100)}% complete</Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...textStyles.titleLarge, color: colors.text.primary, marginTop: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
  },
  filterChipActive: { backgroundColor: colors.accent.primary },
  filterText: { ...textStyles.small, color: colors.text.secondary },
  filterTextActive: { color: colors.text.primary },
  row: { gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  cardIcon: { fontSize: 32 },
  cardIconLocked: { opacity: 0.35 },
  cardTitle: { ...textStyles.small, color: colors.text.primary, textAlign: 'center' },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border.subtle,
    marginTop: spacing.xs,
  },
  progressFill: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.secondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  detailCard: {
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  detailIcon: { fontSize: 48 },
  detailTitle: { ...textStyles.title, color: colors.text.primary },
  detailDescription: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
  detailUnlocked: { ...textStyles.small, color: colors.state.success },
  detailProgress: { ...textStyles.small, color: colors.text.secondary },
});