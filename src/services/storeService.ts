import { supabase } from '../api/supabaseClient';

export type StoreCategory = 'themes' | 'avatars' | 'powerups' | 'chat_effects';

export interface StoreItem {
  id: string;
  category: StoreCategory;
  title: string;
  thumbnail: string; // emoji placeholder for a real asset/thumbnail URL
  priceCoins?: number;
  priceUsd?: number;
  owned: boolean;
  equipped: boolean;
}

export interface CoinTransaction {
  id: string;
  delta: number; // positive = earned, negative = spent
  reason: string;
  icon: string;
  createdAt: string;
}

export interface SeasonPassTier {
  tier: number;
  xpRequired: number;
  freeReward?: { icon: string; label: string };
  premiumReward?: { icon: string; label: string };
  claimed: boolean;
}

export const storeService = {
  async listItems(category: StoreCategory): Promise<StoreItem[]> {
    const { data, error } = await supabase.from('store_items').select('*').eq('category', category);
    if (error) throw error;
    return (data ?? []) as StoreItem[];
  },

  async purchaseWithCoins(itemId: string): Promise<{ success: boolean; newBalance: number }> {
    const { data, error } = await supabase.rpc('purchase_item_with_coins', { item_id: itemId });
    if (error) throw error;
    return data as { success: boolean; newBalance: number };
  },

  async equipItem(itemId: string): Promise<void> {
    const { error } = await supabase.rpc('equip_item', { item_id: itemId });
    if (error) throw error;
  },

  async getCoinBalance(): Promise<number> {
    const { data, error } = await supabase.from('profiles').select('coins').single();
    if (error) throw error;
    return data?.coins ?? 0;
  },

  async getTransactions(page = 0, pageSize = 30): Promise<CoinTransaction[]> {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .range(page * pageSize, page * pageSize + pageSize - 1)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as CoinTransaction[];
  },

  async getSeasonPass(): Promise<{
    seasonEndsAt: string;
    currentXp: number;
    premiumOwned: boolean;
    tiers: SeasonPassTier[];
  }> {
    const { data, error } = await supabase.rpc('get_season_pass');
    if (error) throw error;
    return data;
  },

  async unlockPremiumPass(): Promise<void> {
    // TODO: wire to real IAP flow (react-native-iap), validate receipt server-side, then call this.
    const { error } = await supabase.rpc('unlock_premium_pass');
    if (error) throw error;
  },
};

export default storeService;