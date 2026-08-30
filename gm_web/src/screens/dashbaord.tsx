

import { useState } from 'react'

interface DashboardProps {
  onCreateGame: () => void
}

export default function Dashboard({ onCreateGame }: DashboardProps) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleCreateGame() {
    setError(null)
    onCreateGame()
  }

  function handleJoinGame() {
    const code = roomCode.trim().toUpperCase()

    if (!code) {
      setError('Enter a room code to join a game.')
      return
    }

    setError(null)
    console.log('Join Game selected:', code)
  }

  return (
    <div className="dashboard-card">
      {error && <p className="error-message">{error}</p>}

      <div className="game-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleCreateGame}
        >
          Create Game
        </button>

        <div className="join-section">
          <p className="section-label">Join a Game</p>
          <div className="join-controls">
            <input
              type="text"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Enter room code"
              className="room-code-input"
              aria-label="Room code"
              maxLength={12}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={handleJoinGame}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
