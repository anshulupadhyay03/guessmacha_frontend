import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius, elevation } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { profileService, Profile } from '../../services/profileService';
import type { ProfileStackScreenProps } from '../../navigation/types';

export default function ProfileScreen({ navigation, route }: ProfileStackScreenProps<'Profile'>) {
  const userId = (route.params as any)?.userId;
  const isOwnProfile = !userId;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService
      .getProfile(userId)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || !profile) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.skeletonHeader} />
      </ScreenContainer>
    );
  }

  const xpProgress = profile.xp / (profile.xp + profile.xpToNextLevel);

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable disabled={!isOwnProfile}>
            <Text style={styles.avatar}>{profile.avatarEmoji}</Text>
          </Pressable>
          <View style={styles.identityRow}>
            <Text style={styles.username}>{profile.username}</Text>
            {isOwnProfile && <Text style={styles.editPencil}>✎</Text>}
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{profile.detectiveRank}</Text>
          </View>

          <View style={styles.xpRow}>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.xpLabel}>Lvl {profile.level}</Text>
          </View>
        </View>

        <View style={styles.statCardsRow}>
          <StatCard label="Wins" value={profile.stats.wins} />
          <StatCard label="Losses" value={profile.stats.losses} />
          <StatCard label="Win Rate" value={`${Math.round(profile.stats.winRate * 100)}%`} />
          <StatCard label="Avg. Qs" value={profile.stats.avgQuestionsPerMatch.toFixed(1)} />
        </View>

        {isOwnProfile && (
          <View style={styles.linksRow}>
            <ProfileLink label="🏅 Achievements" onPress={() => navigation.navigate('Achievements')} />
            <ProfileLink label="📜 Match History" onPress={() => navigation.navigate('History')} />
            <ProfileLink label="⚙️ Settings" onPress={() => navigation.navigate('Settings')} />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkText}>{label}</Text>
      <Text style={styles.linkChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl, gap: spacing.lg },
  skeletonHeader: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    marginTop: spacing.xl,
  },
  header: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  avatar: { fontSize: 72 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  username: { ...textStyles.titleLarge, color: colors.text.primary },
  editPencil: { color: colors.text.secondary },
  rankBadge: {
    backgroundColor: colors.accent.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  rankBadgeText: { ...textStyles.small, color: colors.text.primary },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: '80%', marginTop: spacing.sm },
  xpTrack: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.border.subtle },
  xpFill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.accent.secondary },
  xpLabel: { ...textStyles.caption, color: colors.text.secondary },
  statCardsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...elevation.card,
  },
  statValue: { ...textStyles.title, color: colors.text.primary },
  statLabel: { ...textStyles.caption, color: colors.text.secondary, marginTop: 2 },
  linksRow: { gap: spacing.sm },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  linkText: { ...textStyles.bodyMedium, color: colors.text.primary },
  linkChevron: { color: colors.text.secondary, fontSize: 18 },
});