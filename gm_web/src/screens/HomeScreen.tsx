import { useEffect, useRef, useState } from 'react';
import type { JoinGameData } from '../../../shared/types/game';
import { useJoinGame } from '../hooks/useJoinGame';
import { showFacebookPlayerProfileOverlay } from '../platform/facebook/fbInstant';

interface HomeScreenProps {
  onCreateGame: () => void;
  onGameJoined?: (game: JoinGameData) => void;
}

export default function HomeScreen({ onCreateGame, onGameJoined }: HomeScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, loading, error, clearError } = useJoinGame();
  const [localError, setLocalError] = useState<string | null>(null);

  const dialogError = localError || (error ? error.message : null);

  async function handleJoinRoom() {
    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedCode) {
      setLocalError('Please enter a room code to join a game.');
      return;
    }

    setLocalError(null);
    clearError();

    const data = await joinGame(normalizedCode);
    if (data) {
      onGameJoined?.(data);
    }
  }

  const profileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileOverlay() {
      const container = profileContainerRef.current;
      if (!container || !isMounted) {
        return;
      }

      await showFacebookPlayerProfileOverlay(container);
    }

    void loadProfileOverlay();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full" aria-label="GuessMacha home screen">
      <main className="mx-auto w-full max-w-160 flex-1 px-5.5 pt-2 max-[520px]:px-4.5">
        <div
          ref={profileContainerRef}
          id="profile-card-container"
          className="flex w-full items-center min-h-[clamp(4.5rem,8vw,6rem)]"
        />
        <p className="mt-2.5 text-[1.05rem] leading-6 text-[#3c494c]">Ready to outsmart your friends?</p>

        <button
          type="button"
          className="mt-4.5 flex w-full cursor-pointer items-center gap-4 rounded-[18px] border border-[#bbc9cc] bg-white px-4.5 py-4.5 text-left text-[#171d1e] shadow-xs transition hover:-translate-y-px hover:border-[#006875] hover:shadow-md max-[520px]:px-3.5"
          onClick={onCreateGame}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#02c2d9]/15 text-[2.1rem] leading-none font-bold text-[#006875]" aria-hidden="true">
            +
          </span>
          <span className="flex flex-col gap-1">
            <strong className="text-[clamp(1.2rem,2.7vw,1.8rem)] font-extrabold tracking-[-0.04em] text-[#171d1e]">Create Room</strong>
            <small className="text-[0.95rem] tracking-[-0.01em] text-[#3c494c]">Host a private match with rules.</small>
          </span>
        </button>

        <div className="mt-4.5 pt-2">
          <label className="mb-2.5 inline-block text-[0.76rem] font-bold tracking-[0.12em] text-[#36656e] uppercase" htmlFor="room-code">
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
            className="w-full rounded-xl border border-[#bbc9cc] bg-white px-3.5 py-4 text-[1.1rem] font-medium text-[#171d1e] outline-none placeholder:text-[#6c797c] shadow-xs transition focus:border-[#006875] focus:ring-3 focus:ring-[#006875]/15"
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
            className="mt-3.5 w-full cursor-pointer rounded-xl bg-[#006875] px-4.5 py-4 text-[1.15rem] font-extrabold text-white shadow-[0_4px_14px_rgba(0,104,117,0.2)] transition hover:-translate-y-px hover:bg-[#005a66] hover:shadow-[0_8px_24px_rgba(0,104,117,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => void handleJoinRoom()}
          >
            {loading ? 'Joining Room…' : 'Join Room'}
          </button>
        </div>
      </main>

      {/* Error Dialog / Popup Box */}
      {dialogError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-error-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#bbc9cc] bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#ffdad6] border border-[#ba1a1a]/30 text-xl text-[#ba1a1a]">
              ⚠️
            </div>
            <h2 id="join-error-title" className="text-xl font-bold text-[#171d1e]">
              Unable to Join Room
            </h2>
            <p className="mt-2 text-sm text-[#3c494c] leading-relaxed">
              {dialogError}
            </p>
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                clearError();
              }}
              className="mt-5 w-full cursor-pointer rounded-xl bg-[#006875] py-3 text-base font-extrabold text-white transition hover:bg-[#005a66] shadow-[0_4px_14px_rgba(0,104,117,0.2)]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
