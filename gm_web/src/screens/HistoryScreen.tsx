import { useEffect, useRef, useState } from 'react';
import type { HistoryFilter, HistoryMatchItem } from '../features/history/types';
import { useHistory } from '../hooks/useHistory';

interface HistoryScreenProps {
  onBack: () => void;
  onSelectMatch?: (match: HistoryMatchItem) => void;
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
      badgeClass: 'bg-[#63d6ea]/10 text-[#63d6ea] border-[#63d6ea]/30',
      outcomeText: 'You guessed correctly',
      outcomeColor: 'text-[#63d6ea]',
      avatarDotClass: 'bg-[#63d6ea]',
    };
  }
  if (lower === 'lost' || lower === 'defeat' || lower === 'loss') {
    return {
      type: 'loss' as const,
      badgeText: 'DEFEAT',
      badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
      outcomeText: 'guessed your secret',
      outcomeColor: 'text-[#f5f7fb]',
      avatarDotClass: '',
    };
  }
  return {
    type: 'draw' as const,
    badgeText: 'DRAW',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    outcomeText: 'Game ended in a draw',
    outcomeColor: 'text-[#c5cad4]',
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

function DefaultAvatarIcon() {
  return (
    <svg className="size-6 text-[#9ca3af]" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  );
}

export default function HistoryScreen({ onBack, onSelectMatch }: HistoryScreenProps) {
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
    <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#f5f7fb]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-between border-b border-white/8 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="grid size-10 place-items-center rounded-xl bg-white/4 text-[#edf3ff] transition hover:-translate-y-px hover:bg-white/8 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          aria-label="Back to previous screen"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="text-xl font-bold tracking-tight text-white">History</h1>

        {/* Placeholder balance spacing */}
        <div className="size-10" aria-hidden="true" />
      </div>

      {/* Segmented Filter Control */}
      <div
        role="tablist"
        aria-label="Filter match history"
        className="mx-auto mb-6 flex w-full max-w-md rounded-xl bg-[#241c24] p-1 border border-white/8 shadow-inner"
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
                  ? 'bg-[#63d6ea] text-[#00363e] shadow-[0_2px_8px_rgba(99,214,234,0.35)]'
                  : 'text-[#c4cbd4] hover:bg-white/6 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="my-4 rounded-xl bg-red-500/15 p-4 text-center text-sm text-[#ffd9d9] border border-red-500/25" role="alert">
          <p>{error.message || 'Failed to load match history.'}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-2 text-xs font-bold text-cyan-300 underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading initial skeleton */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-white/8 bg-[#1e1924] p-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-white/10" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full bg-white/10" />
              </div>
              <div className="my-4 h-16 rounded-xl bg-white/5" />
              <div className="h-4 w-40 mx-auto rounded bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && matches.length === 0 && (
        <div className="my-12 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-white/4 border border-white/8 text-[#63d6ea]">
            <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">No matches found</h2>
          <p className="mt-1 max-w-xs text-xs text-[#a9afbc]">
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1e1924] shadow-md transition hover:border-[#63d6ea]/35"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/8 bg-white/2 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {match.opponentImageUrl ? (
                        <img
                          src={match.opponentImageUrl}
                          alt={match.opponentName || 'Opponent'}
                          className="size-12 rounded-full object-cover border-2 border-white/15"
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-full bg-white/8 border-2 border-white/15">
                          <DefaultAvatarIcon />
                        </div>
                      )}
                      {resultDetails.avatarDotClass && (
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-[#1e1924] ${resultDetails.avatarDotClass}`}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-base font-bold text-white leading-tight">
                        {match.opponentName || 'Opponent'}
                      </span>
                      <span className="text-[11px] font-bold tracking-wider text-[#a9afbc] uppercase">
                        {match.categoryName || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest ${resultDetails.badgeClass}`}
                    >
                      {resultDetails.badgeText}
                    </span>
                    <span className="text-[11px] text-[#9ca3af]">
                      {formatRelativeTime(match.playedAt)}
                    </span>
                  </div>
                </div>

                {/* Secrets Comparison (if present) */}
                {hasSecrets && (
                  <div className="p-4 bg-[#141018]">
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#18131e] p-3.5">
                      <div className="flex flex-1 flex-col text-center">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a88a87]">
                          Your Secret
                        </span>
                        <span className="text-base sm:text-lg font-bold text-white truncate px-1">
                          {match.playerSecret || '—'}
                        </span>
                      </div>

                      <div className="mx-3 h-10 w-px bg-white/10" aria-hidden="true" />

                      <div className="flex flex-1 flex-col text-center">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a88a87] truncate px-1">
                          {match.opponentName ? `${match.opponentName.toUpperCase()}'S SECRET` : "OPPONENT'S SECRET"}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-white truncate px-1">
                          {match.opponentSecret || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outcome Statement & Question Stats */}
                <div className="px-4 py-3.5 text-center bg-[#1e1924]">
                  <p className={`text-base font-bold ${resultDetails.outcomeColor}`}>
                    {resultDetails.type === 'loss'
                      ? `${match.opponentName || 'Opponent'} guessed your secret`
                      : resultDetails.outcomeText}
                  </p>
                  <p className="mt-1 text-xs text-[#a9afbc]">
                    {match.questionCount} questions asked • <span className="text-white font-medium">You {match.playerQuestionCount}</span> • <span className="text-white font-medium">{match.opponentName || 'Opponent'} {match.opponentQuestionCount}</span>
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/8 bg-white/2 px-4 py-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#a9afbc]">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatDuration(match.durationSeconds)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectMatch?.(match)}
                    className="flex items-center gap-1 font-bold text-[#63d6ea] transition hover:gap-1.5 cursor-pointer"
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
        <div className="my-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#63d6ea]">
          <span className="size-3 animate-spin rounded-full border-2 border-[#63d6ea] border-t-transparent" />
          <span>Loading more matches…</span>
        </div>
      )}

      {/* End of list message */}
      {!loading && !hasMore && matches.length > 0 && (
        <p className="mt-6 text-center text-xs text-[#71717a]">
          You have reached the end of your match history.
        </p>
      )}
    </section>
  );
}

