import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // `.env.local` values without the `VITE_` prefix are deliberately private to
  // the Vite config. These two values are only injected while running `vite`.
  const env = loadEnv(mode, process.cwd(), '')

  // Also support reading from a `local.env` file if present
  const localEnvPath = path.resolve(process.cwd(), 'local.env')
  if (fs.existsSync(localEnvPath)) {
    try {
      const content = fs.readFileSync(localEnvPath, 'utf8')
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
        if (match) {
          const key = match[1]
          let val = (match[2] || '').trim()
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
          env[key] = val
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  return {
    base: './',
    envPrefix: ['VITE_', 'MOCK_'],
    plugins: [react(), tailwindcss()],
    define: {
      __DEV_SUPABASE_ACCESS_TOKEN__: JSON.stringify(
        command === 'serve' ? env.ACCESS_TOKEN ?? '' : '',
      ),
      __DEV_SUPABASE_REFRESH_TOKEN__: JSON.stringify(
        command === 'serve' ? env.REFRESH_TOKEN ?? '' : '',
      ),
    },
  }
})
