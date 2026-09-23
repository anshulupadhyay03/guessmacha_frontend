import { useGameDetails } from '../hooks/useGameDetails';

interface GameZoneScreenProps {
  gameId: string;
  roomCode: string;
  onBackToLobby?: () => void;
}

export default function GameZoneScreen({
  gameId,
  roomCode,
  onBackToLobby,
}: GameZoneScreenProps) {
  const { game, loading } = useGameDetails(gameId);

  return (
    <section className="min-h-full bg-[#100d13] font-lobby-body text-[#f4f1f7] px-4 py-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {onBackToLobby && (
              <button
                type="button"
                onClick={onBackToLobby}
                className="px-3 py-1.5 rounded-lg bg-white/4 border border-white/10 text-sm font-semibold text-[#63d6ea] hover:bg-white/8 transition cursor-pointer"
              >
                ← Lobby
              </button>
            )}
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/4 border border-white/10 text-[#c2c6d6] tracking-wider">
              ROOM: {roomCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">
              Live Game
            </span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="text-center py-6">
          <span className="text-xs font-bold tracking-[0.2em] text-[#63d6ea] uppercase">
            Game Zone
          </span>
          <h1 className="mt-1 font-lobby-display text-3xl sm:text-4xl font-extrabold text-white">
            Match In Progress
          </h1>
          <p className="mt-2 text-base text-[#c4c7d0]">
            Both secrets are locked! Prepare to deduce your opponent's pick.
          </p>
        </div>

        {/* Players & Category Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Category Card */}
          <div className="rounded-xl border border-white/10 bg-white/4 p-5">
            <span className="text-xs font-semibold tracking-wider text-[#63d6ea] uppercase">
              Selected Category
            </span>
            <h2 className="mt-2 text-xl font-bold text-white">
              {game?.category.name ?? (loading ? 'Loading…' : 'Mystery Category')}
            </h2>
            <p className="mt-1 text-sm text-[#c2c6d6]">
              {game?.questionLimit ?? 25} questions per player
            </p>
          </div>

          {/* Opponents Status Card */}
          <div className="rounded-xl border border-white/10 bg-white/4 p-5">
            <span className="text-xs font-semibold tracking-wider text-[#63d6ea] uppercase">
              Contenders
            </span>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-white">
                {game?.players.host.playerName ?? 'Host'}
                <span className="ml-1.5 text-xs text-[#10b981]">🔒 Secret Locked</span>
              </span>
              <span className="text-[#c4c7d0] font-bold">VS</span>
              <span className="font-semibold text-white">
                {game?.players.opponent?.playerName ?? 'Opponent'}
                <span className="ml-1.5 text-xs text-[#10b981]">🔒 Secret Locked</span>
              </span>
            </div>
          </div>
        </div>

        {/* Arena Placeholder */}
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/2 p-12 text-center space-y-4">
          <div className="size-16 mx-auto rounded-full bg-[#00363e]/60 border border-[#63d6ea]/40 flex items-center justify-center text-3xl text-[#63d6ea]">
            🎯
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Deduction Arena Ready
            </h3>
            <p className="mt-1 text-sm text-[#c4c7d0] max-w-md mx-auto">
              The game loop turns, question asking, and clue-guessing mechanics will render here in the next gameplay update.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

