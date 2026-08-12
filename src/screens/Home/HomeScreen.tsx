import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import { dimensions } from '../../constants/dimensions';
import ScreenContainer from '../../components/common/ScreenContainer';
import type { HomeStackScreenProps } from '../../navigation/types';

// TODO: replace with real Redux selectors once userSlice/matchSlice exist:
// const profile = useAppSelector(selectProfile);
// const stats = useAppSelector(selectUserStats);
const mockUser = {
  firstName: 'Anshul',
  games: 127,
  winRate: 68,
  winStreak: 5,
};

// TODO: replace with a real query (profileService.getHistory(0, 3)) once wired up.
const mockRecentMatches = [
  { id: '1', opponentName: 'Riya', outcome: 'win' as const, category: 'Movies' },
  { id: '2', opponentName: 'Kabir', outcome: 'loss' as const, category: 'Cities' },
  { id: '3', opponentName: 'Zara', outcome: 'win' as const, category: 'Fruits' },
];

const JOIN_CODE_REGEX = /^[A-Z0-9]{2,5}-?[A-Z0-9]{2,5}$/i;

export default function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
  const [roomCode, setRoomCode] = useState('');

  const handleOpenSettings = () => {
    (navigation.getParent() as any)?.navigate('ProfileTab', { screen: 'Settings' });
  };

  const handleOpenProfile = () => {
    (navigation.getParent() as any)?.navigate('ProfileTab');
  };

  const handleCreateRoom = () => {
    navigation.navigate('CreateMatch', {matchId: 'new-match-id'}); // Replace 'new-match-id' with actual match ID logic
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;
    navigation.navigate('JoinMatch', { inviteCode: roomCode.trim().toUpperCase() });
  };

  const isCodeValid = JOIN_CODE_REGEX.test(roomCode.trim());

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.logoAvatar} onPress={handleOpenProfile}>
            <Text style={styles.logoAvatarIcon}>🎙️</Text>
          </Pressable>
          <Text style={styles.appTitle}>GuessMate</Text>
          <Pressable style={styles.settingsButton} onPress={handleOpenSettings}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeTitle}>Welcome back {mockUser.firstName}.</Text>
          <Text style={styles.welcomeSubtitle}>Ready to outsmart your friends?</Text>
        </View>

        {/* Create Room */}
        <Pressable style={styles.card} onPress={handleCreateRoom}>
          <View style={styles.cardRow}>
            <View style={styles.iconBox}>
              <Text style={styles.iconBoxText}>⊕</Text>
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Create Room</Text>
              <Text style={styles.cardSubtitle}>Host a private match with rules.</Text>
            </View>
          </View>
        </Pressable>

        {/* Join Room */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconBox}>
              <Text style={styles.iconBoxText}>👥</Text>
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Join Room</Text>
              <Text style={styles.cardSubtitle}>Enter a code to join a friend.</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>ENTER ROOM CODE</Text>
          <TextInput
            value={roomCode}
            onChangeText={(v) => setRoomCode(v.toUpperCase())}
            placeholder="e.g. GM-1234"
            placeholderTextColor={colors.text.disabled}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.codeInput}
          />

          <Pressable
            style={[styles.joinButton, !isCodeValid && styles.joinButtonDisabled]}
            onPress={handleJoinRoom}
            disabled={!isCodeValid}
          >
            <Text style={styles.joinButtonText}>Join Room</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatItem icon="🎮" value={mockUser.games} label="GAMES" />
          <View style={styles.statDivider} />
          <StatItem icon="📊" value={`${mockUser.winRate}%`} label="WIN RATE" />
          <View style={styles.statDivider} />
          <StatItem icon="🔥" value={mockUser.winStreak} label="WIN STREAK" />
        </View>

        {/* Recent Matches */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          <Pressable onPress={() => navigation.getParent()?.navigate('ProfileTab' as never, { screen: 'History' } as never)}>
            <Text style={styles.viewAllLink}>View All</Text>
          </Pressable>
        </View>

        {mockRecentMatches.map((match) => (
          <View key={match.id} style={styles.matchRow}>
            <Text style={styles.matchAvatar}>🕵️</Text>
            <View style={styles.matchInfo}>
              <Text style={styles.matchOpponent}>{match.opponentName}</Text>
              <Text style={styles.matchCategory}>{match.category}</Text>
            </View>
            <View
              style={[
                styles.outcomeBadge,
                { backgroundColor: match.outcome === 'win' ? colors.state.success : colors.state.error },
              ]}
            >
              <Text style={styles.outcomeBadgeText}>{match.outcome === 'win' ? 'W' : 'L'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

function StatItem({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const LAVENDER = '#C7D2FE';
const LAVENDER_TEXT = '#161726';
const ICON_TINT_BG = 'rgba(108, 92, 231, 0.16)';

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: dimensions.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  logoAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAvatarIcon: { fontSize: 18 },
  appTitle: {
    ...textStyles.title,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 20 },
  welcomeBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  welcomeTitle: {
    ...textStyles.displayLarge,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text.primary,
  },
  welcomeSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: ICON_TINT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxText: {
    fontSize: 20,
    color: colors.accent.primary,
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    ...textStyles.bodyLarge,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardSubtitle: {
    ...textStyles.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  inputLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  codeInput: {
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    ...textStyles.bodyMedium,
    marginTop: -spacing.xs,
  },
  joinButton: {
    backgroundColor: LAVENDER,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    ...textStyles.button,
    color: LAVENDER_TEXT,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.subtle,
  },
  statIcon: { fontSize: 16 },
  statValue: {
    ...textStyles.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.caption,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.title,
    fontSize: 18,
    color: colors.text.primary,
  },
  viewAllLink: {
    ...textStyles.small,
    color: LAVENDER,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  matchAvatar: { fontSize: 24 },
  matchInfo: { flex: 1 },
  matchOpponent: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  matchCategory: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  outcomeBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outcomeBadgeText: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.text.primary,
  },
});