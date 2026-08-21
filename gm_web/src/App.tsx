import { useEffect, useState } from 'react'
import './App.css'
import {
  initializeFacebookInstant,
  isFacebookInstantGames,
  showFacebookPlayerProfileOverlay,
} from './platform/facebook/fbInstant'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initializeGame() {
      try {
        if (isFacebookInstantGames()) {
          await initializeFacebookInstant()
        }

        if (!cancelled) {
          setIsInitializing(false)
        }
      } catch (initializationError) {
        console.error('Game initialization failed:', initializationError)

        if (!cancelled) {
          setError(
            initializationError instanceof Error
              ? initializationError.message
              : 'Unable to initialize GuessMacha.',
          )
          setIsInitializing(false)
        }
      }
    }

    void initializeGame()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleProfileClick() {
    const container = document.getElementById('profile-overlay-container')

    if (!container) {
      return
    }

    await showFacebookPlayerProfileOverlay(container)
  }

  if (isInitializing) {
    return (
      <main className="game-shell">
        <section className="game-card loading-card">
          <div className="brand-mark">GM</div>
          <h1>GuessMacha</h1>
          <p>Getting the game ready...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="game-shell">
      <section className="game-card">
        <div className="brand-mark">GM</div>
        <p className="eyebrow">GUESSMACHА</p>
        <h1>Ready to play?</h1>
        <p className="subtitle">
          Challenge a friend, choose a category, and see who can guess the
          secret first.
        </p>

        {error && <p className="error-message">{error}</p>}

        {isFacebookInstantGames() && (
          <>
            <button type="button" className="primary-button" onClick={handleProfileClick}>
              View Facebook Profile
            </button>
            <div id="profile-overlay-container" className="profile-overlay-container" />
          </>
        )}

        {!isFacebookInstantGames() && (
          <p className="development-note">
            Facebook Instant Games features are available when launched inside
            Facebook.
          </p>
        )}
      </section>
    </main>
  )
}

export default App
