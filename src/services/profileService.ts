import { supabase } from '../api/supabaseClient';

export interface Profile {
  id: string;
  username: string;
  avatarEmoji: string;
  detectiveRank: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  interests: string[];
  stats: {
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    avgQuestionsPerMatch: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number; // 0-1
  unlocked: boolean;
  unlockedAt?: string;
}

export interface MatchHistoryItem {
  id: string;
  opponentUsername: string;
  opponentAvatarEmoji: string;
  categoryLabel: string;
  categoryIcon: string;
  outcome: 'win' | 'loss' | 'draw' | 'forfeit_win' | 'forfeit_loss';
  playedAt: string;
  hasReplay: boolean;
}

export const profileService = {
  async getProfile(userId?: string): Promise<Profile> {
    const query = supabase.from('profiles').select('*');
    const { data, error } = userId ? await query.eq('id', userId).single() : await query.single();
    if (error) throw error;
    return data as Profile;
  },

  async updateUsername(username: string): Promise<{ available: boolean }> {
    const { data, error } = await supabase.rpc('check_and_update_username', { username });
    if (error) throw error;
    return data as { available: boolean };
  },

  async listAchievements(userId?: string): Promise<Achievement[]> {
    const { data, error } = await supabase.rpc('get_achievements', { user_id: userId ?? null });
    if (error) throw error;
    return (data ?? []) as Achievement[];
  },

  async getHistory(page = 0, pageSize = 20): Promise<MatchHistoryItem[]> {
    const { data, error } = await supabase
      .from('match_history_view')
      .select('*')
      .range(page * pageSize, page * pageSize + pageSize - 1)
      .order('played_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as MatchHistoryItem[];
  },
};

export default profileService;