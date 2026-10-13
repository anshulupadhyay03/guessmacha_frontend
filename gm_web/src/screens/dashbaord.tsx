import { useState } from 'react'
import type {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
} from '../features/dashboard/types'

export type {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
}

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
    <div className="w-full max-w-md rounded-2xl border border-[#bbc9cc] bg-white p-5 text-[#171d1e] shadow-xs">
      {error && <p className="mb-5 rounded-xl border border-[#ba1a1a]/20 bg-[#ffdad6] p-3.5 text-sm leading-5 text-[#93000a]">{error}</p>}

      <div className="grid gap-5">
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-[#006875] px-4.5 py-4 text-[1.15rem] font-extrabold text-white shadow-[0_4px_14px_rgba(0,104,117,0.2)] transition hover:-translate-y-px hover:bg-[#005a66]"
          onClick={handleCreateGame}
        >
          Create Game
        </button>

        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.12em] text-[#36656e] uppercase">Join a Game</p>
          <div className="grid gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Enter room code"
              className="w-full rounded-[10px] border border-[#bbc9cc] bg-white px-3.5 py-4 text-[1.1rem] text-[#171d1e] outline-none placeholder:text-[#6c797c] focus:border-[#006875] focus:ring-3 focus:ring-[#006875]/15"
              aria-label="Room code"
              maxLength={12}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl border border-[#bbc9cc] bg-[#eff4f7] px-4.5 py-3 font-bold text-[#006875] transition hover:bg-[#e9eff1]"
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
