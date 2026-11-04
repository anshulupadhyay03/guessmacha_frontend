/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string;
  readonly VITE_MOCK_FB_INSTANT?: string;
  readonly VITE_USE_MOCK_FB_INSTANT?: string;
  readonly MOCK_FB_INSTANT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

