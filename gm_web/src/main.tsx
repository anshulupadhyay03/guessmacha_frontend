import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeFacebookInstant } from './platform/facebook/fbInstant'

console.log('GM_WEB main.tsx loaded')

async function bootstrap() {
  const platformPlayer = await initializeFacebookInstant()

  console.log('Platform player:', platformPlayer)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap GuessMacha:', error)
})