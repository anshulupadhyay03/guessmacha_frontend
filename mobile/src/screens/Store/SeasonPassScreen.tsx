import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import { storeService, SeasonPassTier } from '../../services/storeService';
import Toast from 'react-native-toast-message';

export default function SeasonPassScreen() {
  const [tiers, setTiers] = useState<SeasonPassTier[]>([]);
  const [currentXp, setCurrentXp] = useState(0);
  const [premiumOwned, setPremiumOwned] = useState(false);
  const [seasonEndsAt, setSeasonEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    storeService
      .getSeasonPass()
      .then((res) => {
        setTiers(res.tiers);
        setCurrentXp(res.currentXp);
        setPremiumOwned(res.premiumOwned);
        setSeasonEndsAt(res.seasonEndsAt);
      })
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = seasonEndsAt
    ? Math.max(0, Math.ceil((new Date(seasonEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const handleUnlockPremium = async () => {
    setUnlocking(true);
    try {
      // TODO: trigger IAP flow, validate receipt, then call storeService.unlockPremiumPass().
      await storeService.unlockPremiumPass();
      setPremiumOwned(true);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: "Couldn't unlock Premium Pass", text2: err.message });
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Season Pass</Text>
        {daysLeft !== null && (
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>{daysLeft}d left</Text>
          </View>
        )}
      </View>
      <Text style={styles.xpLabel}>{currentXp.toLocaleString()} XP earned this season</Text>

      {daysLeft !== null && daysLeft <= 2 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Claim your rewards before the season ends!</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trackScroll}>
        {tiers.map((tier) => (
          <View key={tier.tier} style={styles.tierNode}>
            <View
              style={[
                styles.rewardBox,
                !premiumOwned && styles.rewardBoxLocked,
              ]}
            >
              <Text style={styles.rewardIcon}>{tier.premiumReward?.icon ?? '🔒'}</Text>
            </View>
            <Text style={styles.tierNumber}>{tier.tier}</Text>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardIcon}>{tier.freeReward?.icon ?? '—'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {!premiumOwned && (
        <Button
          label="Unlock Premium Pass"
          onPress={handleUnlockPremium}
          loading={unlocking}
          style={styles.unlockBtn}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  title: { ...textStyles.titleLarge, color: colors.text.primary },
  timerPill: { backgroundColor: colors.accent.ranked, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  timerText: { ...textStyles.caption, color: colors.text.primary },
  xpLabel: { ...textStyles.small, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.md },
  warningBanner: { backgroundColor: colors.state.warning, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  warningText: { ...textStyles.small, color: colors.bg.base, fontWeight: '600' },
  trackScroll: { marginBottom: spacing.lg },
  tierNode: { alignItems: 'center', gap: spacing.xs, marginRight: spacing.md },
  rewardBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardBoxLocked: { opacity: 0.4 },
  rewardIcon: { fontSize: 22 },
  tierNumber: { ...textStyles.caption, color: colors.text.secondary },
  unlockBtn: { marginTop: 'auto', marginBottom: spacing.lg },
});