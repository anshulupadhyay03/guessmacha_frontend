

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  getSession,
  subscribeToAuthChanges,
} from '../platform/supabase/auth';

interface UseAuthResult {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Failed to get Supabase session:', error);

        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      });

    const unsubscribe = subscribeToAuthChanges((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return {
    session,
    loading,
    isAuthenticated: session !== null,
  };
}