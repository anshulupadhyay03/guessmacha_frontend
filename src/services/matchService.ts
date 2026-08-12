import { supabase } from '../api/supabaseClient';

export interface CreateMatchInput {
  mode: 'random' | 'ranked' | 'friend';
  friendId?: string;
}

export interface MatchRecord {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  mode: CreateMatchInput['mode'];
  categoryId: string | null;
  createdAt: string;
}

/**
 * matchService
 * Thin wrapper around backend match endpoints/RPCs. Exact table/RPC names
 * (e.g. `matches`, `rpc_create_match`) should be confirmed with the backend
 * team — swap the bodies below for the real calls once confirmed.
 */
export const matchService = {
  async createMatch(input: CreateMatchInput): Promise<MatchRecord> {
    const { data, error } = await supabase.rpc('create_match', {
      mode: input.mode,
      friend_id: input.friendId ?? null,
    });
    if (error) throw error;
    return data as MatchRecord;
  },

  async joinMatchByCode(code: string): Promise<MatchRecord> {
    const { data, error } = await supabase.rpc('join_match_by_code', { invite_code: code });
    if (error) throw error;
    return data as MatchRecord;
  },

  async setCategory(matchId: string, categoryId: string): Promise<void> {
    const { error } = await supabase.rpc('set_match_category', {
      match_id: matchId,
      category_id: categoryId,
    });
    if (error) throw error;
  },

  async lockSecretObject(matchId: string, objectName: string): Promise<void> {
    // objectName never gets read back by the client for the opponent — RLS on
    // the backend should prevent the opponent's query from returning this field
    // until a valid guess/reveal event occurs.
    const { error } = await supabase.rpc('lock_secret_object', {
      match_id: matchId,
      object_name: objectName,
    });
    if (error) throw error;
  },

  async getMatch(matchId: string): Promise<MatchRecord> {
    const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (error) throw error;
    return data as MatchRecord;
  },

  async leaveMatch(matchId: string): Promise<void> {
    const { error } = await supabase.rpc('leave_match', { match_id: matchId });
    if (error) throw error;
  },
};

export default matchService;