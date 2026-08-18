import { supabase } from '../api/supabaseClient';

export interface Friend {
  id: string;
  username: string;
  avatarEmoji: string;
  online: boolean;
}

export const friendsService = {
  async listFriends(): Promise<Friend[]> {
    const { data, error } = await supabase.from('friends_view').select('*');
    if (error) throw error;
    return (data ?? []) as Friend[];
  },

  async sendInvite(friendId: string, matchMode: 'friend' = 'friend') {
    const { data, error } = await supabase.rpc('create_match', {
      mode: matchMode,
      friend_id: friendId,
    });
    if (error) throw error;
    return data;
  },

  async generateInviteLink(matchId: string): Promise<string> {
    const { data, error } = await supabase.rpc('generate_invite_token', { match_id: matchId });
    if (error) throw error;
    return `https://guessit.app/invite/${data.token}`;
  },
};

export default friendsService;