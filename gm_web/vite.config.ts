import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // `.env.local` values without the `VITE_` prefix are deliberately private to
  // the Vite config. These two values are only injected while running `vite`.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    envPrefix: ['VITE_', 'BASE_'],
    plugins: [react(), tailwindcss()],
    define: {
      __DEV_SUPABASE_ACCESS_TOKEN__: JSON.stringify(
        command === 'serve' ? env.ACCESS_TOKEN ?? '' : '',
      ),
      __DEV_SUPABASE_REFRESH_TOKEN__: JSON.stringify(
        command === 'serve' ? env.REFRESH_TOKEN ?? '' : '',
      ),
      'import.meta.env.BASE_IMAGE_URL': JSON.stringify(
        env.BASE_IMAGE_URL || env.VITE_BASE_IMAGE_URL || '',
      ),
    },
  }
})
