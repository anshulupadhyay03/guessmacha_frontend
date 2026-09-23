import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export const SUPABASE_FUNCTIONS_BASE_URL =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
  import.meta.env.VITE_BASE_URL ||
  `${supabaseUrl.replace(/\/+$/, '')}/functions/v1`;
export const BASE_URL = SUPABASE_FUNCTIONS_BASE_URL;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);