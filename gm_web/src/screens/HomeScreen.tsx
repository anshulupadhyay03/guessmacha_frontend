import { useState } from 'react';
import type { JoinGameData } from '../features/dashboard/types';
import { joinGame } from '../platform/api/gameApi';

interface HomeScreenProps {
  onCreateGame: () => void;
  onGameJoined?: (game: JoinGameData) => void;
}

export default function HomeScreen({ onCreateGame, onGameJoined }: HomeScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  async function handleJoinRoom() {
    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedCode) {
      setDialogError('Please enter a room code to join a game.');
      return;
    }

    setLoading(true);
    setDialogError(null);

    try {
      const data = await joinGame(normalizedCode);
      onGameJoined?.(data);
    } catch (err) {
      setDialogError(
        err instanceof Error
          ? err.message
          : 'Unable to join room. Please check the code and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full" aria-label="GuessMacha home screen">
      <main className="mx-auto w-full max-w-160 flex-1 px-5.5 pt-2 max-[520px]:px-4.5">
        <h1 className="m-0 text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] font-extrabold tracking-tighter text-[#f6f5f8]">
          Welcome back <span>Anshul</span>.
        </h1>
        <p className="mt-2.5 text-[1.05rem] leading-6 text-[#c1bec9]">Ready to outsmart your friends?</p>

        <button
          type="button"
          className="mt-4.5 flex w-full cursor-pointer items-center gap-4 rounded-[18px] border border-white/8 bg-white/3 px-4.5 py-4.5 text-left text-[#f4f1f7] transition hover:-translate-y-px hover:border-[#7fe4dc]/35 max-[520px]:px-3.5"
          onClick={onCreateGame}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#c4cbd4]/12 text-[2.1rem] leading-none font-bold text-[#e9f8ff]" aria-hidden="true">
            +
          </span>
          <span className="flex flex-col gap-1">
            <strong className="text-[clamp(1.2rem,2.7vw,1.8rem)] font-extrabold tracking-[-0.04em]">Create Room</strong>
            <small className="text-[0.95rem] tracking-[-0.01em] text-[#c4c7d0]">Host a private match with rules.</small>
          </span>
        </button>

        <div className="mt-4.5 pt-2">
          <label className="mb-2.5 inline-block text-[0.76rem] font-bold tracking-[0.12em] text-[#dce6ef] uppercase" htmlFor="room-code">
            Enter room code
          </label>
          <input
            id="room-code"
            type="text"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleJoinRoom();
              }
            }}
            className="w-full rounded-[10px] border border-white/12 bg-white/3 px-3.5 py-4 text-[1.1rem] text-[#f2f5fc] outline-none placeholder:text-[#9ea8b8] transition focus:border-[#70ede5]/70 focus:ring-3 focus:ring-[#70ede5]/18"
            placeholder="e.g. 2ZTVBD"
            aria-label="Room code"
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
          <button
            type="button"
            disabled={loading}
            className="mt-3.5 w-full cursor-pointer rounded-xl bg-linear-to-br from-[#7fe4dc] to-[#6cccff] px-4.5 py-4 text-[1.2rem] font-extrabold text-[#0f1723] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(111,211,225,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => void handleJoinRoom()}
          >
            {loading ? 'Joining Room…' : 'Join Room'}
          </button>
        </div>
      </main>

      {/* Error Dialog / Popup Box */}
      {dialogError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-error-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#141218] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-500/15 border border-red-500/30 text-xl text-red-400">
              ⚠️
            </div>
            <h2 id="join-error-title" className="text-xl font-bold text-white">
              Unable to Join Room
            </h2>
            <p className="mt-2 text-sm text-[#c4c7d0] leading-relaxed">
              {dialogError}
            </p>
            <button
              type="button"
              onClick={() => setDialogError(null)}
              className="mt-5 w-full cursor-pointer rounded-xl bg-[#63d6ea] py-3 text-base font-extrabold text-[#00363e] transition hover:opacity-90 shadow-[0_4px_16px_rgba(99,214,234,0.2)]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
