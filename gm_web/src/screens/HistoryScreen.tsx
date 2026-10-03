import { useEffect, useRef, useState } from 'react';
import type { HistoryFilter } from '../features/history/types';
import { useHistory } from '../hooks/useHistory';
//import FacebookOpponentProfile from '../components/FacebookOpponentProfile';
import FacebookPlayerName from '../components/FacebookPlayerName';

interface HistoryScreenProps {
  onSelectMatch?: (gameId: string) => void;
}

const FILTER_OPTIONS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'draws', label: 'Draws' },
];

function getResultDetails(result: string) {
  const lower = (result || '').toLowerCase();
  if (lower === 'won' || lower === 'victory' || lower === 'win') {
    return {
      type: 'win' as const,
      badgeText: 'VICTORY',
      badgeClass: 'bg-[#e6f6ee] text-[#0b6b45] border-[#0b6b45]/30',
      outcomeText: 'You guessed correctly',
      outcomeColor: 'text-[#006875]',
      avatarDotClass: 'bg-[#006875]',
    };
  }
  if (lower === 'lost' || lower === 'defeat' || lower === 'loss') {
    return {
      type: 'loss' as const,
      badgeText: 'DEFEAT',
      badgeClass: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30',
      outcomeText: 'guessed your secret',
      outcomeColor: 'text-[#171d1e]',
      avatarDotClass: '',
    };
  }
  return {
    type: 'draw' as const,
    badgeText: 'DRAW',
    badgeClass: 'bg-[#ffeccf] text-[#904d00] border-[#904d00]/30',
    outcomeText: 'Game ended in a draw',
    outcomeColor: 'text-[#3c494c]',
    avatarDotClass: '',
  };
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const now = Date.now();
  const past = new Date(dateString).getTime();
  if (Number.isNaN(past)) return '';

  const diffSeconds = Math.max(0, Math.floor((now - past) / 1000));
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}


export default function HistoryScreen({ onSelectMatch }: HistoryScreenProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const { matches, loading, loadingMore, error, hasMore, loadMore, refresh } = useHistory(filter);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(currentSentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  return (
    <section className="relative mx-auto flex w-full max-w-160 flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-center border-b border-[#bbc9cc] pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">History</h1>
      </div>

      {/* Segmented Filter Control */}
      <div
        role="tablist"
        aria-label="Filter match history"
        className="mx-auto mb-6 flex w-full max-w-md rounded-xl bg-[#eff4f7] p-1 border border-[#bbc9cc] shadow-inner"
      >
        {FILTER_OPTIONS.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition select-none cursor-pointer ${
                isActive
                  ? 'bg-[#006875] text-white shadow-xs'
                  : 'text-[#3c494c] hover:bg-white hover:text-[#171d1e]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="my-4 rounded-xl bg-[#ffdad6] p-4 text-center text-sm text-[#93000a] border border-[#ba1a1a]/25" role="alert">
          <p>{error.message || 'Failed to load match history.'}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-2 text-xs font-bold text-[#006875] underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading initial skeleton */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#bbc9cc] bg-white p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#bbc9cc]">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-[#eff4f7]" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 rounded bg-[#eff4f7]" />
                    <div className="h-3 w-16 rounded bg-[#eff4f7]" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full bg-[#eff4f7]" />
              </div>
              <div className="my-4 h-16 rounded-xl bg-[#eff4f7]" />
              <div className="h-4 w-40 mx-auto rounded bg-[#eff4f7]" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && matches.length === 0 && (
        <div className="my-12 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-[#eff4f7] border border-[#bbc9cc] text-[#006875]">
            <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#171d1e]">No matches found</h2>
          <p className="mt-1 max-w-xs text-xs text-[#3c494c]">
            {filter === 'all'
              ? 'You have not played any matches yet. Start a new match to build your history!'
              : `No matches found for the "${filter}" filter.`}
          </p>
        </div>
      )}

      {/* Matches List */}
      {!loading && matches.length > 0 && (
        <div className="flex flex-col gap-4">
          {matches.map((match) => {
            const resultDetails = getResultDetails(match.result);
            const hasSecrets = Boolean(match.playerSecret || match.opponentSecret);

            return (
              <article
                key={match.gameId}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#bbc9cc] bg-white shadow-xs transition hover:border-[#006875] hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#bbc9cc] bg-[#eff4f7]/40 p-3 sm:p-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/*<FacebookOpponentProfile
                      opponentId={match.opponentName}
                      fallbackName={match.opponentName || 'Opponent'}
                      fallbackImageUrl={match.opponentImageUrl}
                    />*/}
                    <span className="inline-block rounded-md bg-[#eff4f7] border border-[#bbc9cc] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#3c494c] uppercase shrink-0">
                      {match.categoryName || 'General'}
                    </span>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1 ml-2">
                    <span
                      className={`rounded-full border px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest ${resultDetails.badgeClass}`}
                    >
                      {resultDetails.badgeText}
                    </span>
                    <span className="text-[11px] text-[#6c797c]">
                      {formatRelativeTime(match.playedAt)}
                    </span>
                  </div>
                </div>

                {/* Secrets Comparison (if present) */}
                {hasSecrets && (
                  <div className="p-4 bg-[#eff4f7]/60">
                    <div className="flex items-center justify-between rounded-xl border border-[#bbc9cc] bg-white p-3.5">
                      <div className="flex flex-1 flex-col text-center">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6c797c]">
                          Your Secret
                        </span>
                        <span className="text-base sm:text-lg font-bold text-[#171d1e] truncate px-1">
                          {match.playerSecret || '—'}
                        </span>
                      </div>

                      <div className="mx-3 h-10 w-px bg-[#bbc9cc]" aria-hidden="true" />

                      <div className="flex flex-1 flex-col text-center">
                        <div className="mb-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-[#6c797c] truncate px-1">
                          <FacebookPlayerName
                            initialData={{ playerId: match.opponentName , extraText: "'S SECRET" }}
                            fallbackName="Opponent"
                            className="w-full h-3"
                            textClassName="text-[10px] font-bold uppercase tracking-widest text-[#6c797c]"
                            uppercase={true}
                            overlayPath="overlays/history/player_name_label.xml"
                            overlayCassPath="overlays/history/history_style.css"
                          />
                        </div>
                        <span className="text-base sm:text-lg font-bold text-[#171d1e] truncate px-1">
                          {match.opponentSecret || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outcome Statement & Question Stats */}
                <div className="px-4 py-3.5 text-center bg-white">
                  <p className={`text-base font-bold ${resultDetails.outcomeColor} flex items-center justify-center gap-1 flex-wrap`}>
                    {resultDetails.type === 'loss' ? (
                      <>
                        <FacebookPlayerName
                           initialData={{ playerId: match.opponentName , extraText: "guessed your secret" }}
                          fallbackName="Opponent"
                          className="w-full h-5.5"
                          textClassName={`text-base font-bold ${resultDetails.outcomeColor}`}
                          overlayPath="overlays/history/player_name_outcome.xml"
                          overlayCassPath="overlays/history/history_style.css"
                        />
                      </>
                    ) : (
                      resultDetails.outcomeText
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#3c494c] flex items-center justify-center gap-1 flex-wrap">
                    <span>{match.questionCount} questions asked • </span>
                    <span className="text-[#171d1e] font-semibold">You {match.playerQuestionCount}</span>
                    <span>•</span>
                    <span className="text-[#171d1e] font-semibold inline-flex items-center gap-1">
                      <FacebookPlayerName
                        initialData={{ playerId: match.opponentName , extraText:`${match.opponentQuestionCount}` }}
                        fallbackName="Opponent"
                        className="max-w-22.5 h-4"
                        textClassName="text-[#171d1e] font-semibold text-xs"
                        overlayPath="overlays/history/player_name_stat.xml"
                        overlayCassPath="overlays/history/history_style.css"
                      />
                    </span>
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#bbc9cc] bg-[#eff4f7]/30 px-4 py-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#3c494c]">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatDuration(match.durationSeconds)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectMatch?.(match.gameId)}
                    className="flex items-center gap-1 font-bold text-[#006875] transition hover:gap-1.5 cursor-pointer"
                  >
                    <span>Review Match</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="my-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#006875]">
          <span className="size-3 animate-spin rounded-full border-2 border-[#006875] border-t-transparent" />
          <span>Loading more matches…</span>
        </div>
      )}

      {/* End of list message */}
      {!loading && !hasMore && matches.length > 0 && (
        <p className="mt-6 text-center text-xs text-[#6c797c]">
          You have reached the end of your match history.
        </p>
      )}
    </section>
  );
}


