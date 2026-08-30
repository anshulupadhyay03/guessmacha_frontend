import { useState } from 'react';

interface MatchLobbyScreenProps {
  roomCode: string;
  onStartGame: () => void;
}

export default function MatchLobbyScreen({
  roomCode,
  onStartGame,
}: MatchLobbyScreenProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <section className="mx-auto w-full max-w-[640px] px-[22px] pt-3 pb-5 text-center text-[#f5f7fb]" aria-live="polite">
      <p className="mt-2 text-[0.7rem] font-bold tracking-[0.12em] text-[#9db7d8] uppercase">GAME CREATED</p>
      <h1 className="mt-3 mb-2 text-[clamp(2.1rem,5vw,2.8rem)] leading-[1.1] font-extrabold tracking-[-0.06em]">Match Lobby</h1>
      <p className="mx-auto mb-7 max-w-[420px] text-[0.96rem] leading-6 text-[#c5cad4]">Share this room code with your friend so they can join.</p>

      <div className="my-6 grid gap-2.5">
        <output className="w-full rounded-xl border border-white/12 bg-white/3 px-4 py-[18px] text-[1.7rem] font-extrabold tracking-[0.12em] text-[#f1f7ff]" aria-label="Room code">{roomCode}</output>
        <button type="button" className="min-h-12 cursor-pointer rounded-xl border border-white/12 bg-white/4 font-bold text-[#edf3ff] transition hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" onClick={() => void handleCopy()}>
          Copy code
        </button>
      </div>

      {copyStatus === 'copied' && <p className="-mt-3 mb-5 text-sm text-[#90e4a6]">Room code copied.</p>}
      {copyStatus === 'error' && (
        <p className="mb-5 rounded-xl bg-red-500/15 p-[14px] text-sm leading-5 text-[#ffd9d9]" role="alert">
          Couldn’t copy the room code. Please copy it manually.
        </p>
      )}

      <button type="button" className="mt-6 w-full cursor-pointer rounded-xl bg-gradient-to-br from-[#7fe4dc] to-[#6cccff] px-[18px] py-4 text-[1.15rem] font-extrabold text-[#0f1723] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(111,211,225,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" onClick={onStartGame}>
        Start Game
      </button>
    </section>
  );
}
