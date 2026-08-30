import { useEffect, useState } from 'react'
import './App.css'
import './styles/shared-ui.css'
import {
  initializeFacebookInstant,
  isFacebookInstantGames,
  showFacebookPlayerProfileOverlay,
} from './platform/facebook/fbInstant'
import Dashboard from './screens/dashbaord'
import CreateGameScreen from './screens/CreateGameScreen'
import MatchLobbyScreen from './screens/MatchLobbyScreen'
import type { CreateGameResponse } from '../../shared/types/game'

function App() {
  const [screen, setScreen] = useState<'dashboard' | 'create-game' | 'match-lobby'>('dashboard')
  const [game, setGame] = useState<CreateGameResponse | null>(null)

  useEffect(() => {
    async function initializeGame() {
      try {
        if (isFacebookInstantGames()) {
          await initializeFacebookInstant()
        }
      } catch (initializationError) {
        console.error('Game initialization failed:', initializationError)
      }
    }

    void initializeGame()
  }, [])

  async function handleProfileClick() {
    const container = document.getElementById('profile-overlay-container')

    if (!container) {
      return
    }

    await showFacebookPlayerProfileOverlay(container)
  }

  function handleGameCreated(createdGame: CreateGameResponse) {
    setGame(createdGame)
    setScreen('match-lobby')
  }

  return (
    <main className="game-shell">
      {screen === 'create-game' ? (
        <CreateGameScreen
          onBack={() => setScreen('dashboard')}
          onGameCreated={handleGameCreated}
        />
      ) : screen === 'match-lobby' && game ? (
        <MatchLobbyScreen
          roomCode={game.roomCode}
          onStartGame={() => console.info('Start game selected:', game.gameId)}
        />
      ) : (
      <section className="game-card">
        <div className="brand-mark">GM</div>
        <p className="eyebrow">GUESSMACHA</p>
        <h1>Ready to play?</h1>
        <p className="subtitle">
          Challenge a friend, choose a category, and see who can guess the
          secret first.
        </p>
        <Dashboard onCreateGame={() => setScreen('create-game')} />

        {isFacebookInstantGames() && (
          <>
            <button
              type="button"
              className="profile-test-button"
              onClick={handleProfileClick}
            >
              Test Facebook Profile
            </button>
            <div
              id="profile-overlay-container"
              className="profile-overlay-container"
            />
          </>
        )}

        {!isFacebookInstantGames() && (
          <p className="development-note">
            Facebook Instant Games features are available when launched inside
            Facebook.
          </p>
        )}
      </section>
      )}
    </main>
  )
}

export default App
