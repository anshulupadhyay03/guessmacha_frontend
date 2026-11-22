# GuessMate mobile

The React Native app is a native counterpart to `gm_web` and uses its exact Supabase table/function contracts. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optionally `SUPABASE_FUNCTIONS_URL` as build-time environment values; see `.env.example`.

Install dependencies with `npm install`, then use `npm run android` or `npm run ios`. The app intentionally contains no web view and no mock backend.
