import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeFacebookInstant } from './platform/facebook/fbInstant'
import { initializeAuth } from './platform/supabase/auth'

console.log('GM_WEB main.tsx loaded')

async function bootstrap() {
  const platformPlayer = await initializeFacebookInstant()
  console.log('Platform player:', platformPlayer)

  const session = await initializeAuth()
  console.log('Supabase session:', session)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap GuessMacha:', error)
})