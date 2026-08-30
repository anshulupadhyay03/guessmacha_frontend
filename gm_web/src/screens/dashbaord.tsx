

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
    <div className="w-full max-w-md rounded-2xl border border-white/8 bg-white/3 p-5 text-[#f4f1f7]">
      {error && <p className="mb-5 rounded-xl bg-red-500/15 p-[14px] text-sm leading-5 text-[#ffd9d9]">{error}</p>}

      <div className="grid gap-5">
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-gradient-to-br from-[#7fe4dc] to-[#6cccff] px-[18px] py-4 text-[1.15rem] font-extrabold text-[#0f1723] transition hover:-translate-y-px"
          onClick={handleCreateGame}
        >
          Create Game
        </button>

        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.12em] text-[#dce6ef] uppercase">Join a Game</p>
          <div className="grid gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Enter room code"
              className="w-full rounded-[10px] border border-white/12 bg-white/3 px-[14px] py-4 text-[1.1rem] text-[#f2f5fc] outline-none placeholder:text-[#9ea8b8] focus:border-[#70ede5]/70 focus:ring-3 focus:ring-[#70ede5]/18"
              aria-label="Room code"
              maxLength={12}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl border border-white/12 bg-white/4 px-[18px] py-3 font-bold text-[#edf3ff] transition hover:bg-white/8"
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
