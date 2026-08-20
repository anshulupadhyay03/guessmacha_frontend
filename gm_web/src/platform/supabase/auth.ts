import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { getFacebookSignedPlayerInfo } from '../facebook/fbInstant';


export async function authenticateFacebookInstant(): Promise<Session | null> {
  const signedPlayerInfo = await getFacebookSignedPlayerInfo();

  if (!signedPlayerInfo) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke('fb-instant-auth', {
    body: signedPlayerInfo,
  });

  if (error) {
    throw error;
  }

  const session = data?.data?.session as Session | undefined;

  if (!session) {
    throw new Error('Facebook Instant authentication did not return a session');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (sessionError) {
    throw sessionError;
  }

  return session;
}

export async function initializeAuth(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (session) {
    return session;
  }

  return authenticateFacebookInstant();
}

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  return () => {
    subscription.unsubscribe();
  };
}