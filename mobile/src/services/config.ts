declare const process: { env?: Record<string, string | undefined> } | undefined;
const env = typeof process === 'undefined' ? {} : process.env ?? {};
export const config = {
  supabaseUrl: env.SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: env.SUPABASE_ANON_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  functionsUrl: env.SUPABASE_FUNCTIONS_URL ?? env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL,
};
export const functionsUrl = config.functionsUrl || (config.supabaseUrl ? `${config.supabaseUrl.replace(/\/+$/, '')}/functions/v1` : undefined);
