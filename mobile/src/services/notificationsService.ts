import { supabase } from '../api/supabaseClient';

export type NotificationType =
  | 'friend_request'
  | 'match_invite'
  | 'achievement_unlocked'
  | 'match_result'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon: string;
  read: boolean;
  createdAt: string;
  deepLink?: { screen: string; params?: Record<string, any> };
}

export const notificationsService = {
  async list(): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AppNotification[];
  },

  async markAllRead(): Promise<void> {
    const { error } = await supabase.rpc('mark_all_notifications_read');
    if (error) throw error;
  },

  async dismiss(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  },
};

export default notificationsService;