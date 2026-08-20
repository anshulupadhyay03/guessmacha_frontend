import type { AuthProvider } from '../../../../shared/api/client';
import { supabase } from './client';

export const authProvider: AuthProvider = {
  async getAccessToken(): Promise<string | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return session?.access_token ?? null;
  },
};