import { supabase } from '../api/supabaseClient';

export type LeaderboardScope = 'global' | 'country' | 'friends' | 'category';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarEmoji: string;
  rank: number;
  score: number;
  isCurrentUser?: boolean;
}

export const leaderboardService = {
  async fetch(scope: LeaderboardScope, categoryId?: string): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      scope,
      category_id: categoryId ?? null,
    });
    if (error) throw error;
    return (data ?? []) as LeaderboardEntry[];
  },
};

export default leaderboardService;