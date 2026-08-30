import { useState } from 'react'

interface HomeScreenProps {
  onCreateGame: () => void
}

export default function HomeScreen({ onCreateGame }: HomeScreenProps) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleJoinRoom() {
    const normalizedCode = roomCode.trim().toUpperCase()

    if (!normalizedCode) {
      setError('Enter a room code to join a game.')
      return
    }

    setError(null)
    console.info('Join Room selected:', normalizedCode)
  }

  return (
    <section className="w-full" aria-label="GuessMacha home screen">
      <main className="mx-auto w-full max-w-[640px] flex-1 px-[22px] pt-2 max-[520px]:px-[18px]">
        <h1 className="m-0 text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#f6f5f8]">
          Welcome back <span>Anshul</span>.
        </h1>
        <p className="mt-2.5 text-[1.05rem] leading-6 text-[#c1bec9]">Ready to outsmart your friends?</p>

        <button type="button" className="mt-[18px] flex w-full cursor-pointer items-center gap-4 rounded-[18px] border border-white/8 bg-white/3 px-[18px] py-[18px] text-left text-[#f4f1f7] transition hover:-translate-y-px hover:border-[#7fe4dc]/35 max-[520px]:px-[14px]" onClick={onCreateGame}>
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#c4cbd4]/12 text-[2.1rem] leading-none font-bold text-[#e9f8ff]" aria-hidden="true">
            +
          </span>
          <span className="flex flex-col gap-1">
            <strong className="text-[clamp(1.2rem,2.7vw,1.8rem)] font-extrabold tracking-[-0.04em]">Create Room</strong>
            <small className="text-[0.95rem] tracking-[-0.01em] text-[#c4c7d0]">Host a private match with rules.</small>
          </span>
        </button>

        <div className="mt-[18px] pt-2">
          <label className="mb-2.5 inline-block text-[0.76rem] font-bold tracking-[0.12em] text-[#dce6ef] uppercase" htmlFor="room-code">Enter room code</label>
          <input
            id="room-code"
            type="text"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
            className="w-full rounded-[10px] border border-white/12 bg-white/3 px-[14px] py-4 text-[1.1rem] text-[#f2f5fc] outline-none placeholder:text-[#9ea8b8] transition focus:border-[#70ede5]/70 focus:ring-3 focus:ring-[#70ede5]/18"
            placeholder="e.g. GM-1234"
            aria-label="Room code"
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="mt-[14px] w-full cursor-pointer rounded-xl bg-gradient-to-br from-[#7fe4dc] to-[#6cccff] px-[18px] py-4 text-[1.2rem] font-extrabold text-[#0f1723] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(111,211,225,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" onClick={handleJoinRoom}>
            Join Room
          </button>
        </div>

        {error && <p className="mt-[14px] text-[0.88rem] leading-5 text-[#f8d1d4]" role="alert">{error}</p>}
      </main>

    </section>
  )
}
