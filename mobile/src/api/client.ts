import { Platform } from 'react-native';

export type Query = Record<string, string | number | boolean | null | undefined>;
export type TokenProvider = () => Promise<string | null>;

/** Uses the exact Supabase Functions contract used by gm_web. Configure values at build time. */
export function createApiClient(baseUrl: string | undefined, anonKey: string | undefined, getToken: TokenProvider) {
  async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
    if (!baseUrl || !anonKey) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY mobile build configuration.');
    const url = new URL(path.replace(/^\/+/, ''), `${baseUrl.replace(/\/+$/, '')}/`);
    Object.entries(query ?? {}).forEach(([key, value]) => { if (value != null) url.searchParams.append(key, String(value)); });
    const token = await getToken();
    const response = await fetch(url.toString(), { method, headers: { apikey: anonKey, Authorization: `Bearer ${token ?? anonKey}`, 'Content-Type': 'application/json', 'X-Client-Info': `guessmate-mobile/${Platform.OS}` }, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text(); let data: unknown = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }
    if (!response.ok) { const item = data as { message?: string; error?: { message?: string } | string }; throw new Error(item?.message || (typeof item?.error === 'string' ? item.error : item?.error?.message) || `API request failed (${response.status})`); }
    return data as T;
  }
  return { get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query), post: <T>(path: string, body?: unknown) => request<T>('POST', path, body) };
}
