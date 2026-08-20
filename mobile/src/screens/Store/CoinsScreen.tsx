import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius, elevation } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import { storeService, CoinTransaction } from '../../services/storeService';
import { useRealtimeChannel } from '../../hooks/useRealtimeChannel';
import Toast from 'react-native-toast-message';

const COIN_PACKS = [
  { id: 'pack_small', coins: 500, priceUsd: 0.99 },
  { id: 'pack_medium', coins: 1500, priceUsd: 2.99 },
  { id: 'pack_large', coins: 4000, priceUsd: 6.99 },
];

export default function CoinsScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([storeService.getCoinBalance(), storeService.getTransactions()])
      .then(([bal, tx]) => {
        setBalance(bal);
        setTransactions(tx);
      })
      .finally(() => setLoading(false));
  }, []);

  useRealtimeChannel('profile:me', {
    onEvent: (payload: any) => {
      if (payload?.type === 'coins_updated') setBalance(payload.newBalance);
    },
  });

  const handleBuyPack = async (packId: string) => {
    setPurchasingPackId(packId);
    try {
      // TODO: trigger react-native-iap purchase flow for the pack, validate
      // receipt server-side (idempotent), then refresh balance/transactions.
      Toast.show({ type: 'info', text1: 'Coin pack purchases not yet wired up' });
    } finally {
      setPurchasingPackId(null);
    }
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceValue}>🪙 {balance.toLocaleString()}</Text>
      </View>

      <View style={styles.packsRow}>
        {COIN_PACKS.map((pack) => (
          <View key={pack.id} style={styles.packCard}>
            <Text style={styles.packCoins}>🪙 {pack.coins}</Text>
            <Button
              label={`$${pack.priceUsd}`}
              onPress={() => handleBuyPack(pack.id)}
              loading={purchasingPackId === pack.id}
              size="sm"
              variant="secondary"
            />
          </View>
        ))}
      </View>

      <Text style={styles.historyTitle}>Transaction History</Text>
      {!loading && transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions yet — win a match to earn your first coins.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.txRow}>
              <Text style={styles.txIcon}>{item.icon}</Text>
              <View style={styles.txInfo}>
                <Text style={styles.txReason}>{item.reason}</Text>
                <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txDelta, item.delta < 0 && styles.txDeltaNegative]}>
                {item.delta > 0 ? '+' : ''}
                {item.delta}
              </Text>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceHeader: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
  balanceLabel: { ...textStyles.small, color: colors.text.secondary },
  balanceValue: { ...textStyles.displayLarge, color: colors.text.primary },
  packsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  packCard: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    ...elevation.card,
  },
  packCoins: { ...textStyles.bodyMedium, color: colors.text.primary },
  historyTitle: { ...textStyles.title, color: colors.text.primary, marginBottom: spacing.sm },
  emptyText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  txIcon: { fontSize: 20 },
  txInfo: { flex: 1 },
  txReason: { ...textStyles.bodyMedium, color: colors.text.primary },
  txDate: { ...textStyles.caption, color: colors.text.secondary },
  txDelta: { ...textStyles.bodyMedium, color: colors.state.success },
  txDeltaNegative: { color: colors.state.error },
});