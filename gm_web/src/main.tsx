import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupMockFbInstant } from './platform/facebook/mockFbInstant'
import { initializeFacebookInstant } from './platform/facebook/fbInstant'
import { initializeAuth } from './platform/supabase/auth'

console.log('GM_WEB main.tsx loaded')

// Ensure mock FBInstant is registered for localhost / dev environments
setupMockFbInstant()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

// Mount the React application immediately so the UI shell and theme render with zero delay
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Run background platform & auth bootstrapping without blocking the UI
async function bootstrap() {
  try {
    const platformPlayer = await initializeFacebookInstant()
    console.log('Platform player initialized:', platformPlayer)
  } catch (error) {
    console.warn('Facebook Instant initialization warning:', error)
  }

  try {
    const session = await initializeAuth()
    console.log('Supabase session initialized:', session)
  } catch (error) {
    console.warn('Supabase auth initialization warning:', error)
  }
}

void bootstrap()