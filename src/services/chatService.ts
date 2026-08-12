import { supabase } from '../api/supabaseClient';

export type MessageType = 'text' | 'poll' | 'guess';

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  pollOptions?: string[];
  pollVotes?: Record<string, number>;
  answer?: string;
  status: 'sent' | 'answered' | 'failed';
  createdAt: string;
}

export const chatService = {
  async fetchHistory(matchId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('match_messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  },

  async sendText(matchId: string, text: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('match_messages')
      .insert({ match_id: matchId, type: 'text', text })
      .select()
      .single();
    if (error) throw error;
    return data as ChatMessage;
  },

  async sendPoll(matchId: string, question: string, options: string[]): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('match_messages')
      .insert({ match_id: matchId, type: 'poll', text: question, poll_options: options })
      .select()
      .single();
    if (error) throw error;
    return data as ChatMessage;
  },

  async answerMessage(messageId: string, answer: string): Promise<void> {
    const { error } = await supabase
      .from('match_messages')
      .update({ answer, status: 'answered' })
      .eq('id', messageId);
    if (error) throw error;
  },
};

export default chatService;