import { useState } from 'react';
import type { HistoryMatchItem } from '../features/history/types';
import { useAuth } from '../hooks/useAuth';
import { useMatchReview } from '../hooks/useMatchReview';
import './GameZoneScreen.css';

interface MatchReviewScreenProps {
  gameId: string;
  onBack: () => void;
  match?: HistoryMatchItem;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function DefaultAvatarIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`${className} text-[#006875]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  );
}

function PlayerAvatar({
  imageUrl,
  name,
  sizeClass = 'size-10',
  iconSizeClass = 'size-5',
  borderClass = 'border border-[#bbc9cc]',
  className = '',
}: {
  imageUrl?: string | null;
  name?: string;
  sizeClass?: string;
  iconSizeClass?: string;
  borderClass?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Player'}
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${borderClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`grid ${sizeClass} place-items-center rounded-full bg-[#eff4f7] shrink-0 ${borderClass} ${className}`}
      aria-label={name || 'Player'}
    >
      <DefaultAvatarIcon className={iconSizeClass} />
    </div>
  );
}

export default function MatchReviewScreen({ gameId, onBack, match: initialMatch }: MatchReviewScreenProps) {
  const { match: matchSummary, questions, loading, error, refresh } = useMatchReview(gameId);
  const { session } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  // Player & Opponent metadata from API response (matchSummary), falling back to initialMatch
  const opponentName = matchSummary?.opponent?.playerName || initialMatch?.opponentName || 'Opponent';
  const opponentId = matchSummary?.opponent?.playerId || initialMatch?.opponentId;
  const opponentImageUrl = matchSummary?.opponent?.playerImageUrl || initialMatch?.opponentImageUrl || null;
  const opponentSecret = matchSummary?.opponent?.secret ?? initialMatch?.opponentSecret ?? null;
  const opponentQuestionCount =
    matchSummary?.opponentQuestionCount ??
    matchSummary?.opponent?.questionsAsked ??
    initialMatch?.opponentQuestionCount ??
    0;

  const playerSecret = matchSummary?.player?.secret ?? initialMatch?.playerSecret ?? null;
  const playerQuestionCount =
    matchSummary?.playerQuestionCount ??
    matchSummary?.player?.questionsAsked ??
    initialMatch?.playerQuestionCount ??
    0;

  const categoryName = matchSummary?.categoryName || initialMatch?.categoryName || 'General';
  const durationSeconds = matchSummary?.durationSeconds ?? initialMatch?.durationSeconds ?? 0;
  const questionCount =
    matchSummary?.questionCount ??
    initialMatch?.questionCount ??
    (playerQuestionCount + opponentQuestionCount);

  // Outcome computation
  let result = matchSummary?.result || initialMatch?.result || '';
  if (!result && matchSummary?.winnerId) {
    if (matchSummary.winnerId === matchSummary.player?.playerId) {
      result = 'won';
    } else if (matchSummary.winnerId === matchSummary.opponent?.playerId) {
      result = 'lost';
    }
  }

  const lowerResult = (result || '').toLowerCase();
  const isWon = lowerResult === 'won' || lowerResult === 'victory' || lowerResult === 'win';
  const isLost = lowerResult === 'lost' || lowerResult === 'defeat' || lowerResult === 'loss';
  const isDraw = lowerResult === 'draw';

  const outcomeTitle = isWon
    ? 'VICTORY'
    : isLost
      ? 'DEFEAT'
      : isDraw
        ? 'DRAW'
        : 'IN PROGRESS';

  const outcomeColor = isWon
    ? 'text-[#006875]'
    : isLost
      ? 'text-[#ba1a1a]'
      : isDraw
        ? 'text-[#904d00]'
        : 'text-[#006875]';

  const outcomeSubtitle = isWon
    ? `You defeated ${opponentName}`
    : isLost
      ? `${opponentName} defeated you`
      : isDraw
        ? `Match with ${opponentName} ended in a draw`
        : `Match with ${opponentName} is currently in progress`;

  const totalQuestions = questionCount || (playerQuestionCount + opponentQuestionCount) || 1;
  const playerPercent = Math.round((playerQuestionCount / totalQuestions) * 100);

  const playerFromQuestions = questions.find(
    (q) => q.askedBy?.playerId && q.askedBy.playerId !== opponentId,
  );
  const userAvatarUrl =
    matchSummary?.player?.playerImageUrl ||
    playerFromQuestions?.askedBy?.playerImageUrl ||
    (session?.user?.user_metadata?.avatar_url as string | undefined) ||
    (session?.user?.user_metadata?.picture as string | undefined) ||
    null;

  return (
    <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-between border-b border-[#bbc9cc] pb-3">
        <button
          type="button"
          onClick={onBack}
          className="grid size-10 place-items-center rounded-xl border border-[#bbc9cc] bg-[#eff4f7] text-[#171d1e] transition hover:-translate-y-px hover:bg-[#e9eff1] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875]"
          aria-label="Back to match history"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">Review Match</h1>

        <div className="size-10" aria-hidden="true" />
      </div>

      {/* Initial Loading Skeleton */}
      {loading && !matchSummary && !initialMatch && (
        <div className="flex flex-col gap-4">
          <div className="animate-pulse rounded-2xl border border-[#bbc9cc] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 rounded bg-[#eff4f7]" />
              <div className="h-5 w-24 rounded-full bg-[#eff4f7]" />
            </div>
            <div className="mt-3 h-4 w-48 rounded bg-[#eff4f7]" />
            <div className="mt-4 h-10 rounded-xl bg-[#eff4f7]" />
          </div>
          <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-xs text-[#006875]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#006875] border-t-transparent" />
            <span>Loading match details…</span>
          </div>
        </div>
      )}

      {/* Initial Error State */}
      {error && !matchSummary && !initialMatch && (
        <div className="my-4 rounded-xl border border-[#ba1a1a]/25 bg-[#ffdad6] p-4 text-center text-sm text-[#93000a]">
          <p>{error.message || 'Unable to load match review details.'}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-2 text-xs font-bold text-[#006875] underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Match Dashboard Summary Card */}
      {(matchSummary || initialMatch) && (
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#bbc9cc] bg-white p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${outcomeColor}`}>
                {outcomeTitle}
              </h2>
              <p className="text-sm text-[#3c494c]">{outcomeSubtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eff4f7] px-3 py-1 text-xs font-bold text-[#3c494c]">
                {categoryName}
              </span>
              <span className="rounded-full bg-[#eff4f7] px-3 py-1 text-xs font-bold text-[#3c494c]">
                {formatDuration(durationSeconds)} • {questionCount} Qs
              </span>
            </div>
          </div>

          {/* Outcome Status Banner */}
          <div
            className={`mt-3 flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${
              isWon
                ? 'bg-[#e6f6ee] border border-[#0b6b45]/25 text-[#0b6b45]'
                : isLost
                  ? 'bg-[#ffdad6] border border-[#ba1a1a]/25 text-[#93000a]'
                  : isDraw
                    ? 'bg-[#ffeccf] border border-[#904d00]/25 text-[#904d00]'
                    : 'bg-[#eff4f7] border border-[#006875]/25 text-[#006875]'
            }`}
          >
            <span aria-hidden="true">{isWon ? '✓' : isLost ? '✕' : '•'}</span>
            <span>
              {isWon
                ? 'You guessed correctly first.'
                : isLost
                  ? `${opponentName} guessed your secret first.`
                  : isDraw
                    ? 'Match ended in a draw.'
                    : 'Match is currently in progress.'}
            </span>
          </div>

          {/* Collapsible Details */}
          {isDetailsOpen && (
            <div className="mt-3.5 flex flex-col gap-3 border-t border-[#bbc9cc] pt-3 text-xs">
              {/* Integrated Stats Grid matching design reference */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-lg border border-[#bbc9cc] bg-[#eff4f7]/50 p-4 mt-2">
                <div>
                  <p className="text-xs font-semibold text-[#6c797c]">Total Questions</p>
                  <p className="text-lg sm:text-xl font-bold text-[#171d1e] mt-1">{questionCount}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6c797c]">Duration</p>
                  <p className="text-lg sm:text-xl font-bold text-[#171d1e] mt-1">{formatDuration(durationSeconds)}</p>
                </div>
                <div className="col-span-2 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-semibold text-[#6c797c]">Question Split</p>
                    <div className="flex gap-3 text-xs font-semibold">
                      <span className="text-[#006875]">You: {playerQuestionCount}</span>
                      <span className="text-[#904d00]">{opponentName}: {opponentQuestionCount}</span>
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-[#bbc9cc]/40 w-full">
                    <div
                      className="bg-[#006875] h-full transition-all"
                      style={{ width: `${playerPercent}%` }}
                      aria-label={`You asked ${playerPercent}% of questions`}
                    />
                    <div
                      className="bg-[#f89a43] h-full transition-all"
                      style={{ width: `${100 - playerPercent}%` }}
                      aria-label={`Opponent asked ${100 - playerPercent}% of questions`}
                    />
                  </div>
                </div>
              </div>

              {/* Players Condensed matching design reference */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#bbc9cc] pt-4 mt-2">
                <div className="flex items-center gap-3">
                  <PlayerAvatar
                    imageUrl={userAvatarUrl}
                    name="You"
                    sizeClass="size-10"
                    iconSizeClass="size-5"
                    borderClass="border-2 border-[#006875]"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-[#006875] uppercase tracking-wider">YOU</span>
                    <span className="text-sm font-semibold text-[#171d1e] truncate">{playerSecret || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 text-right">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-[#904d00] uppercase tracking-wider truncate">
                      {opponentName.toUpperCase()}
                    </span>
                    <span className={`text-sm font-semibold text-[#3c494c] truncate ${isWon ? 'line-through opacity-75' : ''}`}>
                      {opponentSecret || '—'}
                    </span>
                  </div>
                  <PlayerAvatar
                    imageUrl={opponentImageUrl}
                    name={opponentName}
                    sizeClass="size-10"
                    iconSizeClass="size-5"
                    borderClass="border-2 border-[#f89a43]"
                    className={isWon ? 'grayscale-[25%]' : ''}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Details Toggle Button */}
          <div className="mt-2.5 flex justify-center">
            <button
              type="button"
              onClick={() => setIsDetailsOpen((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-bold tracking-wider text-[#006875] uppercase transition hover:opacity-80 cursor-pointer"
              aria-expanded={isDetailsOpen}
            >
              <span>Match Details</span>
              <span
                className={`inline-block transition-transform duration-200 ${
                  isDetailsOpen ? 'rotate-180' : 'rotate-0'
                }`}
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tactical Replay Timeline Card - Fixed Height with Internal Scroll */}
      <div className="mb-4 flex flex-col rounded-2xl border border-[#bbc9cc] bg-white p-4 shadow-xs">
        <div className="flex shrink-0 items-center justify-between border-b border-[#bbc9cc] pb-2.5 mb-3">
          <h3 className="text-xs font-bold tracking-wider text-[#3c494c] uppercase">
            REPLAY TIMELINE
          </h3>
          <span className="text-xs text-[#6c797c]" title="Chronological questions">
            🕒
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-xs text-[#006875]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#006875] border-t-transparent" />
            <span>Loading match replay…</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="my-4 rounded-xl border border-[#ba1a1a]/25 bg-[#ffdad6] p-3.5 text-center text-xs text-[#93000a]">
            <p>{error.message || 'Unable to load question history.'}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-1.5 font-bold text-[#006875] underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && questions.length === 0 && (
          <div className="flex h-[200px] items-center justify-center text-center text-xs text-[#6c797c]">
            No question history recorded for this match.
          </div>
        )}

        {/* Q&A List with fixed height & scrolling - matching GameZoneScreen */}
        {!loading && questions.length > 0 && (
          <div className="gamezone-qa-container h-[380px] max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q) => {
              const isAskedByMe = opponentId
                ? q.askedBy?.playerId !== opponentId
                : Boolean(matchSummary?.player?.playerId && q.askedBy?.playerId === matchSummary.player.playerId);
              const isAnswered = Boolean(q.answerText);
              const waitingText = isAskedByMe
                ? `Waiting for ${opponentName}...`
                : 'Waiting for answer...';

              return (
                <div
                  key={q.id}
                  className={`gamezone-qa-card ${
                    isAskedByMe ? 'gamezone-qa-card--me' : 'gamezone-qa-card--opponent'
                  } ${!isAnswered ? 'gamezone-qa-card--waiting' : ''}`}
                >
                  <div className="gamezone-qa-question">{q.questionText}</div>
                  {isAnswered ? (
                    <div className="gamezone-qa-answer">{q.answerText}</div>
                  ) : (
                    <div className="gamezone-qa-waiting">{waitingText}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Fair Play Review Card */}
      <div className="flex flex-col rounded-2xl border border-[#bbc9cc] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg" aria-hidden="true">🤖</span>
          <h3 className="text-sm font-bold text-[#171d1e]">AI Fair Play Review</h3>
        </div>

        <p className="text-xs text-[#3c494c] leading-relaxed">
          Let AI analyse the complete question and answer history for unusual or potentially suspicious behaviour.
        </p>

        <button
          type="button"
          onClick={() => setIsComingSoonOpen(true)}
          className="mt-3.5 flex w-full items-center justify-center rounded-xl bg-[#006875] py-3 text-xs font-extrabold text-white transition hover:bg-[#005a66] active:scale-[0.99] cursor-pointer shadow-[0_4px_14px_rgba(0,104,117,0.2)]"
        >
          Run Fair AI Play Review
        </button>
      </div>

      {/* Coming Soon Pop-up Dialog */}
      {isComingSoonOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#bbc9cc] bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#02c2d9]/15 border border-[#006875]/30 text-2xl text-[#006875]">
              🤖
            </div>
            <h2 id="coming-soon-title" className="text-xl font-bold text-[#171d1e]">
              Coming Soon
            </h2>
            <p className="mt-2 text-sm text-[#3c494c] leading-relaxed">
              This feature is coming soon! AI Fair Play Review will be available in an upcoming update.
            </p>
            <button
              type="button"
              onClick={() => setIsComingSoonOpen(false)}
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
