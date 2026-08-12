import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { matchService } from '../../services/matchService';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';
import type { MatchStackScreenProps } from '../../navigation/types';

// TODO: this curated list (icon + item count + "coming soon" flag) doesn't exist
// in constants/categories.ts yet — that file only has icon/label/description/objects.
// Once backend confirms real item counts per category, either extend Category in
// categories.ts with `itemCount` and `comingSoon`, or fetch this from a `categories`
// table so counts/soon-flags aren't hardcoded on the client.
interface CategoryDisplay {
  id: string;
  icon: string;
  label: string;
  itemsLabel: string;
  comingSoon?: boolean;
}

const AVAILABLE_CATEGORIES: CategoryDisplay[] = [
  { id: 'animals', icon: '🐾', label: 'Animals', itemsLabel: '150 items' },
  { id: 'cricket', icon: '🏏', label: 'Cricket', itemsLabel: '85 items' },
  { id: 'football', icon: '⚽', label: 'Football', itemsLabel: '200 items' },
  { id: 'countries', icon: '🌍', label: 'Countries', itemsLabel: '190 items' },
  { id: 'cars', icon: '🚗', label: 'Cars', itemsLabel: '120+' },
  { id: 'space', icon: '🚀', label: 'Space', itemsLabel: '60+' },
];

const COMING_SOON_CATEGORIES: CategoryDisplay[] = [
  { id: 'bollywood', icon: '🎬', label: 'Bollywood', itemsLabel: 'SOON', comingSoon: true },
  { id: 'video_games', icon: '🎮', label: 'Video Games', itemsLabel: 'SOON', comingSoon: true },
];

export default function CategorySelectionScreen({
  navigation,
  route,
}: MatchStackScreenProps<'CategorySelection'>) {
  const { matchId } = route.params;
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  // TODO: confirm exact channel/table shape with backend — see useRealtimeChannel.
  useRealtimeChannel(`match:${matchId}`, {
    onEvent: (payload: any) => {
      if (payload?.type === 'category_confirmed' && payload.byOpponent) setOpponentReady(true);
      if (payload?.type === 'both_ready' && payload.categoryId) {
        navigation.replace('SecretObjectSelection', { matchId, categoryId: payload.categoryId });
      }
    },
  });

  const filtered = useMemo(
    () =>
      AVAILABLE_CATEGORIES.filter((c) => c.label.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

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
    <ScreenContainer noPadding edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Text style={styles.iconButtonText}>👤</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Category</Text>
        <Pressable style={styles.iconButton} onPress={() => {}}>
          <Text style={styles.iconButtonText}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Both players will choose their secret from this category.
        </Text>

        {opponentReady && !confirmed && (
          <View style={styles.opponentPill}>
            <Text style={styles.opponentPillText}>Opponent has picked ✅ — your turn</Text>
          </View>
        )}

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Find a category..."
          placeholderTextColor={colors.text.disabled}
          editable={!confirmed}
          style={styles.searchInput}
        />

        <FlatList
          data={filtered}
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
                style={[styles.card, selected && styles.cardSelected]}
              >
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardMeta}>🔒 {item.itemsLabel}</Text>
              </Pressable>
            );
          }}
          ListFooterComponent={
            <>
              <View style={styles.comingSoonHeader}>
                <Text style={styles.comingSoonHeaderText}>⏳ COMING SOON</Text>
              </View>
              <View style={styles.row}>
                {COMING_SOON_CATEGORIES.map((item) => (
                  <View key={item.id} style={[styles.card, styles.cardDisabled]}>
                    <View style={[styles.cardIconBox, styles.cardIconBoxDisabled]}>
                      <Text style={styles.cardIconText}>{item.icon}</Text>
                    </View>
                    <Text style={styles.cardLabelDisabled} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <View style={styles.soonBadge}>
                      <Text style={styles.soonBadgeText}>SOON</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          }
        />
      </View>

      <View style={styles.footer}>
        {confirmed ? (
          <View style={styles.waitingRow}>
            <Text style={styles.waitingText}>Waiting for opponent to choose…</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.continueButton, !selectedId && styles.continueButtonDisabled]}
            onPress={handleConfirm}
            disabled={!selectedId || confirming}
          >
            <Text style={styles.continueButtonText}>
              {confirming ? 'Confirming…' : 'Continue  →'}
            </Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}

// Best-guess hex values sampled visually from the screenshot — flag anything
// that looks off and I'll adjust against the real design file/tokens.
const LAVENDER = '#C7D2FE';
const LAVENDER_TEXT = '#161726';
const SELECTED_BORDER = '#7C8CFB';
const ICON_TINT_BG = 'rgba(108, 92, 231, 0.16)';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { fontSize: 18 },
  headerTitle: {
    ...textStyles.titleLarge,
    color: colors.text.primary,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  opponentPill: {
    alignSelf: 'center',
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  opponentPillText: { ...textStyles.caption, color: colors.state.success },
  searchInput: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: { paddingBottom: spacing.xl },
  row: { gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 4,
  },
  cardSelected: {
    borderColor: SELECTED_BORDER,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: ICON_TINT_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cardIconBoxDisabled: {
    backgroundColor: colors.bg.surfaceRaised,
  },
  cardIconText: { fontSize: 18 },
  cardLabel: {
    ...textStyles.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardLabelDisabled: {
    ...textStyles.bodyMedium,
    fontWeight: '700',
    color: colors.text.disabled,
  },
  cardMeta: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  soonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: 2,
  },
  soonBadgeText: {
    ...textStyles.caption,
    fontSize: 10,
    color: colors.text.disabled,
    letterSpacing: 0.5,
  },
  comingSoonHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  comingSoonHeaderText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  continueButton: {
    backgroundColor: LAVENDER,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...textStyles.button,
    color: LAVENDER_TEXT,
  },
  waitingRow: { alignItems: 'center', paddingVertical: spacing.md },
  waitingText: { ...textStyles.body, color: colors.text.secondary },
});