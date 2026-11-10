import { useEffect, useRef, useState } from 'react';
import type {
  DashboardActiveMatch,
  JoinGameData,
} from '../features/dashboard/types';
import type { MatchItem } from '../features/matches/types';
import { useDashboard } from '../hooks/useDashboard';
import { useJoinGame } from '../hooks/useJoinGame';
import CategoryIcon from '../components/CategoryIcon';
import {
  ChevronIcon,
  ComingSoonIcon,
  CreatePlusIcon,
  GamesIcon,
  JoinUsersIcon,
  WinRateIcon,
  WinStreakIcon,
} from '../components/icons';
import { mapActiveMatchToMatchItem } from '../features/dashboard/activeMatchMapper';
import { getActiveMatchPresentation } from '../features/dashboard/activeMatchPresentation';
import { FALLBACK_COMING_SOON } from '../features/dashboard/comingSoonFallback';
import { showFacebookPlayerProfileOverlay } from '../platform/facebook/fbInstant';

interface HomeScreenProps {
  onCreateGame: () => void;
  onGameJoined?: (game: JoinGameData) => void;
  onSelectMatch?: (match: MatchItem) => void;
  onViewAllMatches?: () => void;
}

export default function HomeScreen({
  onCreateGame,
  onGameJoined,
  onSelectMatch,
  onViewAllMatches,
}: HomeScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, loading, error, clearError } = useJoinGame();
  const {
    dashboard,
    activeMatches,
    popularCategories,
    comingSoon,
    stats,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboard();
  const [localError, setLocalError] = useState<string | null>(null);

  const dialogError = localError || (error ? error.message : null);
  const comingSoonFeatures =
    comingSoon.length > 0 ? comingSoon : FALLBACK_COMING_SOON;

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

  function handleActiveMatchClick(match: DashboardActiveMatch) {
    onSelectMatch?.(mapActiveMatchToMatchItem(match));
  }

  function handlePopularCategoryClick() {
    onCreateGame();
  }

  return (
    <section className="w-full" aria-label="GuessMacha home screen">
      <main className="mx-auto w-full max-w-160 flex-1 px-5.5 pt-2 pb-8 max-[520px]:px-4.5">
        <div
          ref={profileContainerRef}
          id="profile-card-container"
          className="flex w-full items-center min-h-[clamp(4.5rem,8vw,6rem)]"
        />
        <p className="mt-2.5 font-body-md text-body-md text-on-surface-variant">
          Ready to outsmart your friends?
        </p>

        {dashboardError && !dashboardLoading && (
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-error/30 bg-error-container/80 px-4 py-2.5 text-sm text-on-error-container"
            role="alert"
          >
            <span className="font-body-md text-sm">{dashboardError.message}</span>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-primary/20 bg-surface-container-lowest px-2.5 py-1.5 font-label-sm text-label-sm text-primary shadow-xs transition hover:bg-surface-container-low"
              onClick={() => void refreshDashboard()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Matches */}
        <div className="mt-7 flex items-center justify-between gap-3 border-b border-outline-variant/10 pb-2">
          <h2 className="font-title-md text-title-md text-on-background">
            Active Matches
          </h2>
          <button
            type="button"
            className="cursor-pointer font-label-sm text-label-sm text-primary transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onViewAllMatches}
          >
            View All
          </button>
        </div>

        <div className="mt-3">
          {dashboardLoading && (
            <div className="grid grid-cols-2 gap-3 animate-pulse" aria-busy="true">
              <div className="h-20 rounded-xl border border-outline-variant/20 bg-surface-container-lowest" />
              <div className="h-20 rounded-xl border border-outline-variant/20 bg-surface-container-lowest" />
            </div>
          )}

          {!dashboardLoading && !dashboardError && activeMatches.length === 0 && (
            <div className="rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-lowest/70 px-4 py-5 text-center">
              <p className="font-title-md text-sm font-bold text-on-background">No active matches</p>
              <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                Create a room or join one with a code to get started.
              </p>
            </div>
          )}

          {!dashboardLoading && activeMatches.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {activeMatches.map((match) => {
                const presentation = getActiveMatchPresentation(match);
                return (
                  <button
                    key={match.gameId}
                    type="button"
                    className={`relative flex w-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border p-3 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] ${
                      presentation.isAction
                        ? 'border-primary/30 bg-surface-container-lowest'
                        : 'border-outline-variant/10 bg-surface-container-lowest'
                    }`}
                    onClick={() => handleActiveMatchClick(match)}
                    aria-label={`Open ${match.categoryName} match ${match.roomCode}, ${presentation.title}`}
                  >
                    {presentation.isAction && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
                    )}
                    <div className={`flex flex-col justify-between h-full w-full ${presentation.isAction ? 'pl-1.5' : ''}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant truncate">
                          {match.categoryName}
                        </span>
                        <span className="font-label-sm text-[10px] text-on-surface-variant/70 uppercase tracking-wider shrink-0">
                          {match.roomCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <h3
                          className={`font-title-md text-sm font-bold leading-snug truncate ${
                            presentation.isAction ? 'text-primary' : 'text-on-background'
                          }`}
                        >
                          {presentation.title}
                        </h3>
                        <ChevronIcon
                          className={`size-4.5 shrink-0 ${
                            presentation.isAction ? 'text-primary' : 'text-on-surface-variant'
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Room */}
        <button
          type="button"
          className="group mt-6 flex w-full cursor-pointer items-center gap-3.5 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99]"
          onClick={onCreateGame}
        >
          <span
            className="grid size-12 shrink-0 place-items-center rounded-lg border border-outline-variant/10 bg-surface-container-high text-secondary transition-colors group-hover:text-primary"
            aria-hidden="true"
          >
            <CreatePlusIcon className="size-6" />
          </span>
          <span className="flex flex-col gap-0.5">
            <strong className="font-title-md text-title-md text-on-surface transition-colors group-hover:text-primary">
              Create Room
            </strong>
            <small className="font-body-md text-sm text-on-surface-variant">
              Host a private match with rules.
            </small>
          </span>
        </button>

        {/* Join Room */}
        <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-lg border border-outline-variant/10 bg-surface-container-high text-secondary"
              aria-hidden="true"
            >
              <JoinUsersIcon className="size-6" />
            </span>
            <span className="flex flex-col gap-0.5">
              <strong className="font-title-md text-title-md text-on-surface">
                Join Room
              </strong>
              <small className="font-body-md text-sm text-on-surface-variant">
                Enter a code to join a friend.
              </small>
            </span>
          </div>

          <label
            className="mt-4 mb-2 inline-block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
            htmlFor="room-code"
          >
            Enter Room Code
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
            className="w-full rounded-md border border-outline-variant/20 bg-surface-container-high px-4 py-2 font-body-md text-base text-on-surface outline-none placeholder:text-on-surface-variant/50 transition-colors focus:border-primary/50 focus:outline-none"
            placeholder="e.g. GM-1234"
            aria-label="Room code"
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
          <button
            type="button"
            disabled={loading}
            className="mt-3 w-full cursor-pointer rounded-md bg-primary py-2.5 font-title-md text-base font-bold text-on-primary shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleJoinRoom()}
          >
            {loading ? 'Joining Room…' : 'Join Room'}
          </button>
        </div>

        {/* Personal stats */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-outline-variant/20 rounded-xl border border-outline-variant/10 bg-surface-container-lowest py-4 px-2 shadow-xs">
          <div className="flex items-center justify-center gap-2.5 px-2">
            <span className="text-on-surface-variant shrink-0" aria-hidden="true">
              <GamesIcon className="size-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-title-md text-sm md:text-base font-bold text-on-surface">
                {dashboardLoading ? '—' : stats.gamesPlayed}
              </span>
              <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Games
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2.5 px-2">
            <span className="text-on-surface-variant shrink-0" aria-hidden="true">
              <WinRateIcon className="size-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-title-md text-sm md:text-base font-bold text-on-surface">
                {dashboardLoading ? '—' : `${stats.winRate}%`}
              </span>
              <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Win Rate
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2.5 px-2">
            <span className="text-on-surface-variant shrink-0" aria-hidden="true">
              <WinStreakIcon className="size-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-title-md text-sm md:text-base font-bold text-on-surface">
                {dashboardLoading ? '—' : stats.winStreak}
              </span>
              <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Win Streak
              </span>
            </div>
          </div>
        </div>

        {dashboard && (
          <p className="sr-only">
            {dashboard.recentMatches.length > 0
              ? `${dashboard.recentMatches.length} recent matches available.`
              : 'No recent matches yet.'}
          </p>
        )}

        {/* Popular Categories */}
        <div className="mt-8 flex items-center justify-between border-b border-outline-variant/10 pb-2">
          <h2 className="font-title-md text-title-md text-on-background">
            Popular Categories
          </h2>
        </div>
        <div className="mt-3">
          {dashboardLoading && (
            <div className="grid grid-cols-2 gap-3 animate-pulse" aria-busy="true">
              <div className="h-16 rounded-xl border border-outline-variant/20 bg-surface-container-lowest" />
              <div className="h-16 rounded-xl border border-outline-variant/20 bg-surface-container-lowest" />
              <div className="h-16 rounded-xl border border-outline-variant/20 bg-surface-container-lowest" />
              <div className="h-16 rounded-xl border border-outline-variant/20 bg-surface-container-lowest" />
            </div>
          )}

          {!dashboardLoading && !dashboardError && popularCategories.length === 0 && (
            <p className="rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-lowest/70 px-4 py-4 text-center font-body-md text-sm text-on-surface-variant">
              No popular categories yet. Be the first to play!
            </p>
          )}

          {!dashboardLoading && popularCategories.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {popularCategories.map((category) => (
                <button
                  key={category.categoryId}
                  type="button"
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                  onClick={() => handlePopularCategoryClick()}
                  aria-label={`Create a room in ${category.categoryName}`}
                >
                  <CategoryIcon
                    iconKey={category.iconKey}
                    name={category.categoryName}
                    className="size-7 shrink-0 object-contain select-none pointer-events-none text-secondary transition-colors group-hover:text-primary"
                  />
                  <div className="min-w-0">
                    <span className="font-body-md text-body-md font-medium text-on-surface block truncate">
                      {category.categoryName}
                    </span>
                    <small className="font-label-sm block text-[11px] font-semibold text-on-surface-variant/70">
                      {category.gamesPlayed.toLocaleString()} played
                    </small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 flex items-center justify-between border-b border-outline-variant/10 pb-2">
          <h2 className="font-title-md text-title-md text-on-background">
            Coming Soon
          </h2>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-xs">
          <ul className="divide-y divide-outline-variant/10">
            {comingSoonFeatures.map((feature) => (
              <li key={feature.id} className="flex items-center gap-3.5 px-4.5 py-4">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-outline-variant/10 bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <ComingSoonIcon id={feature.id} />
                </span>
                <div className="min-w-0">
                  <span className="font-body-md text-body-md font-medium text-on-surface block">
                    {feature.title}
                  </span>
                  {feature.description && (
                    <small className="mt-0.5 block font-body-md text-xs leading-5 text-on-surface-variant">
                      {feature.description}
                    </small>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
          <div className="w-full max-w-sm rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-error/30 bg-error-container text-xl text-error">
              ⚠️
            </div>
            <h2 id="join-error-title" className="font-title-md text-title-md text-on-background">
              Unable to Join Room
            </h2>
            <p className="mt-2 font-body-md text-sm leading-relaxed text-on-surface-variant">
              {dialogError}
            </p>
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                clearError();
              }}
              className="mt-5 w-full cursor-pointer rounded-md bg-primary py-2.5 font-title-md text-base font-bold text-on-primary shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
