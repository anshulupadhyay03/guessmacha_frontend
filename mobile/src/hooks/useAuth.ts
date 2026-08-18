import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';
import { profileService } from '../services/profileService';

interface AuthState {
  initializing: boolean;
  session: Session | null;
  hasCompletedInterests: boolean;
}

async function getHasCompletedInterests(session: Session | null) {
  if (!session?.user.id) return false;

  try {
    const profile = await profileService.getProfile(session.user.id);
    return profile.interests.length > 0;
  } catch {
    return false;
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    initializing: true,
    session: null,
    hasCompletedInterests: false,
  });

  useEffect(() => {
    let mounted = true;

    const syncSession = async (session: Session | null) => {
      const hasCompletedInterests = await getHasCompletedInterests(session);

      if (mounted) {
        setState({
          initializing: false,
          session,
          hasCompletedInterests,
        });
      }
    };

    supabase.auth.getSession().then(({ data }) => syncSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export default useAuth;
