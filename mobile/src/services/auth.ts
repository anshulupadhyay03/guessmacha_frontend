import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = config.supabaseUrl && config.supabaseAnonKey ? createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }) : null;
export async function session(): Promise<Session | null> { if (!supabase) return null; const { data, error } = await supabase.auth.getSession(); if (error) throw error; return data.session; }
export async function accessToken() { return (await session())?.access_token ?? null; }
