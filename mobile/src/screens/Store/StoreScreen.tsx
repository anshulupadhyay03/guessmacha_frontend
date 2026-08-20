import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import ScreenContainer from '../../components/common/ScreenContainer';
import { storeService, StoreItem, StoreCategory } from '../../services/storeService';
import type { ProfileStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';

const CATEGORIES: { id: StoreCategory; label: string }[] = [
  { id: 'themes', label: 'Themes' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'powerups', label: 'Power-ups' },
  { id: 'chat_effects', label: 'Chat Effects' },
];

export default function StoreScreen({ navigation }: ProfileStackScreenProps<'Store'>) {
  const [category, setCategory] = useState<StoreCategory>('themes');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    storeService
      .listItems(category)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [category]);

  const handleBuy = async (item: StoreItem) => {
    setPurchasingId(item.id);
    try {
      if (item.priceCoins) {
        const result = await storeService.purchaseWithCoins(item.id);
        if (!result.success) throw new Error('Purchase failed');
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i)));
      } else {
        // TODO: trigger platform IAP sheet via react-native-iap for priceUsd items,
        // validate the receipt server-side, then mark owned on success.
        Toast.show({ type: 'info', text1: 'Real-money purchases not yet wired up' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Purchase failed', text2: err.message });
    } finally {
      setPurchasingId(null);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    await storeService.equipItem(item.id);
    setItems((prev) =>
      prev.map((i) => ({ ...i, equipped: i.id === item.id ? true : i.category === item.category ? false : i.equipped })),
    );
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Store</Text>
        <Pressable onPress={() => navigation.navigate('Coins')}>
          <Text style={styles.getCoinsLink}>🪙 Get Coins</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategory(c.id)}
            style={[styles.tab, category === c.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, category === c.id && styles.tabTextActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardThumb}>{item.thumbnail}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.owned ? (
              <Pressable
                style={[styles.actionBtn, item.equipped && styles.actionBtnEquipped]}
                onPress={() => handleEquip(item)}
              >
                <Text style={styles.actionBtnText}>{item.equipped ? 'Equipped' : 'Equip'}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.actionBtn}
                onPress={() => handleBuy(item)}
                disabled={purchasingId === item.id}
              >
                <Text style={styles.actionBtnText}>
                  {purchasingId === item.id
                    ? '…'
                    : item.priceCoins
                    ? `🪙 ${item.priceCoins}`
                    : `$${item.priceUsd?.toFixed(2)}`}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  title: { ...textStyles.titleLarge, color: colors.text.primary },
  getCoinsLink: { ...textStyles.small, color: colors.accent.secondary },
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.md, flexWrap: 'wrap' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.bg.surface },
  tabActive: { backgroundColor: colors.accent.primary },
  tabText: { ...textStyles.small, color: colors.text.secondary },
  tabTextActive: { color: colors.text.primary },
  row: { gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardThumb: { fontSize: 36 },
  cardTitle: { ...textStyles.small, color: colors.text.primary },
  actionBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  actionBtnEquipped: { backgroundColor: colors.state.success },
  actionBtnText: { ...textStyles.caption, color: colors.text.primary },
});