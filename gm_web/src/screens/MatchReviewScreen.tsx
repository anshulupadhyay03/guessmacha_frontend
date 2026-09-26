import { useState } from 'react';
import type { HistoryMatchItem } from '../features/history/types';
import { useAuth } from '../hooks/useAuth';
import { useMatchReview } from '../hooks/useMatchReview';
import './GameZoneScreen.css';

interface MatchReviewScreenProps {
  match: HistoryMatchItem;
  onBack: () => void;
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
    <svg className={`${className} text-[#a9afbc]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  );
}

function PlayerAvatar({
  imageUrl,
  name,
  sizeClass = 'size-10',
  iconSizeClass = 'size-5',
  borderClass = 'border border-white/20',
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
      className={`grid ${sizeClass} place-items-center rounded-full bg-white/8 shrink-0 ${borderClass} ${className}`}
      aria-label={name || 'Player'}
    >
      <DefaultAvatarIcon className={iconSizeClass} />
    </div>
  );
}

export default function MatchReviewScreen({ match, onBack }: MatchReviewScreenProps) {
  const { questions, loading, error, refresh } = useMatchReview(match.gameId);
  const { session } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const lowerResult = (match.result || '').toLowerCase();
  const isWon = lowerResult === 'won' || lowerResult === 'victory' || lowerResult === 'win';
  const isLost = lowerResult === 'lost' || lowerResult === 'defeat' || lowerResult === 'loss';

  const outcomeTitle = isWon ? 'VICTORY' : isLost ? 'DEFEAT' : 'DRAW';
  const outcomeColor = isWon ? 'text-[#63d6ea]' : isLost ? 'text-[#ffb4ab]' : 'text-[#f59e0b]';

  const outcomeSubtitle = isWon
    ? `You defeated ${match.opponentName || 'Opponent'}`
    : isLost
      ? `${match.opponentName || 'Opponent'} defeated you`
      : `Match with ${match.opponentName || 'Opponent'} ended in a draw`;

  const totalQuestions = match.questionCount || (match.playerQuestionCount + match.opponentQuestionCount) || 1;
  const playerPercent = Math.round(((match.playerQuestionCount || 0) / totalQuestions) * 100);

  const playerFromQuestions = questions.find(
    (q) => q.askedBy?.playerId && q.askedBy.playerId !== match.opponentId,
  );
  const userAvatarUrl =
    playerFromQuestions?.askedBy?.playerImageUrl ||
    (session?.user?.user_metadata?.avatar_url as string | undefined) ||
    (session?.user?.user_metadata?.picture as string | undefined) ||
    null;

  return (
    <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#f5f7fb]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-between border-b border-white/8 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="grid size-10 place-items-center rounded-xl bg-white/4 text-[#edf3ff] transition hover:-translate-y-px hover:bg-white/8 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          aria-label="Back to match history"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="text-xl font-bold tracking-tight text-white">Review Match</h1>

        <div className="size-10" aria-hidden="true" />
      </div>

      {/* Match Dashboard Summary Card */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-[#1e1924] p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${outcomeColor}`}>
              {outcomeTitle}
            </h2>
            <p className="text-sm text-[#c5cad4]">{outcomeSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-[#e1bfbc]">
              {match.categoryName || 'General'}
            </span>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-[#e1bfbc]">
              {formatDuration(match.durationSeconds)} • {match.questionCount} Qs
            </span>
          </div>
        </div>

        {/* Outcome Status Banner */}
        <div
          className={`mt-3 flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${
            isWon
              ? 'bg-[#63d6ea]/10 border border-[#63d6ea]/25 text-[#63d6ea]'
              : isLost
                ? 'bg-red-500/10 border border-red-500/25 text-[#ffdad6]'
                : 'bg-amber-400/10 border border-amber-400/25 text-[#fef3c7]'
          }`}
        >
          <span aria-hidden="true">{isWon ? '✓' : isLost ? '✕' : '•'}</span>
          <span>
            {isWon
              ? 'You guessed correctly first.'
              : isLost
                ? `${match.opponentName || 'Opponent'} guessed your secret first.`
                : 'Match ended in a draw.'}
          </span>
        </div>

        {/* Collapsible Details */}
        {isDetailsOpen && (
          <div className="mt-3.5 flex flex-col gap-3 border-t border-white/8 pt-3 text-xs">
            {/* Integrated Stats Grid matching design reference */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-lg border border-white/10 bg-white/3 p-4 mt-2">
              <div>
                <p className="text-xs font-semibold text-[#a9afbc]">Total Questions</p>
                <p className="text-lg sm:text-xl font-bold text-white mt-1">{match.questionCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#a9afbc]">Duration</p>
                <p className="text-lg sm:text-xl font-bold text-white mt-1">{formatDuration(match.durationSeconds)}</p>
              </div>
              <div className="col-span-2 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-semibold text-[#a9afbc]">Question Split</p>
                  <div className="flex gap-3 text-xs font-semibold">
                    <span className="text-[#63d6ea]">You: {match.playerQuestionCount}</span>
                    <span className="text-[#e5a93c]">{match.opponentName || 'Player B'}: {match.opponentQuestionCount}</span>
                  </div>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-white/10 w-full">
                  <div
                    className="bg-[#63d6ea] h-full transition-all"
                    style={{ width: `${playerPercent}%` }}
                    aria-label={`You asked ${playerPercent}% of questions`}
                  />
                  <div
                    className="bg-[#e5a93c] h-full transition-all"
                    style={{ width: `${100 - playerPercent}%` }}
                    aria-label={`Opponent asked ${100 - playerPercent}% of questions`}
                  />
                </div>
              </div>
            </div>

            {/* Players Condensed matching design reference */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
              <div className="flex items-center gap-3">
                <PlayerAvatar
                  imageUrl={userAvatarUrl}
                  name="You"
                  sizeClass="size-10"
                  iconSizeClass="size-5"
                  borderClass="border-2 border-[#63d6ea]/70"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-[#63d6ea] uppercase tracking-wider">YOU</span>
                  <span className="text-sm font-semibold text-white truncate">{match.playerSecret || '—'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 text-right">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-[#e5a93c] uppercase tracking-wider truncate">
                    {(match.opponentName || 'Player B').toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold text-[#c5cad4] truncate ${isWon ? 'line-through opacity-75' : ''}`}>
                    {match.opponentSecret || '—'}
                  </span>
                </div>
                <PlayerAvatar
                  imageUrl={match.opponentImageUrl}
                  name={match.opponentName || 'Player B'}
                  sizeClass="size-10"
                  iconSizeClass="size-5"
                  borderClass="border-2 border-[#e5a93c]/70"
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
            className="flex items-center gap-1 text-xs font-bold tracking-wider text-[#63d6ea] uppercase transition hover:text-[#63d6ea]/80 cursor-pointer"
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

      {/* Tactical Replay Timeline Card - Fixed Height with Internal Scroll */}
      <div className="mb-4 flex flex-col rounded-2xl border border-white/10 bg-[#1e1924] p-4 shadow-md">
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 pb-2.5 mb-3">
          <h3 className="text-xs font-bold tracking-wider text-[#a9afbc] uppercase">
            REPLAY TIMELINE
          </h3>
          <span className="text-xs text-[#a9afbc]" title="Chronological questions">
            🕒
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-xs text-[#63d6ea]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#63d6ea] border-t-transparent" />
            <span>Loading match replay…</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="my-4 rounded-xl border border-red-500/25 bg-red-500/15 p-3.5 text-center text-xs text-[#ffd9d9]">
            <p>{error.message || 'Unable to load question history.'}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-1.5 font-bold text-cyan-300 underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && questions.length === 0 && (
          <div className="flex h-[200px] items-center justify-center text-center text-xs text-[#a9afbc]">
            No question history recorded for this match.
          </div>
        )}

        {/* Q&A List with fixed height & scrolling - matching GameZoneScreen */}
        {!loading && questions.length > 0 && (
          <div className="gamezone-qa-container h-[380px] max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q) => {
              const isAskedByMe = q.askedBy?.playerId !== match.opponentId;
              const isAnswered = Boolean(q.answerText);
              const waitingText = isAskedByMe
                ? `Waiting for ${match.opponentName || 'opponent'}...`
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
      <div className="flex flex-col rounded-2xl border border-white/10 bg-[#1e1924] p-4 shadow-md">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg" aria-hidden="true">🤖</span>
          <h3 className="text-sm font-bold text-white">AI Fair Play Review</h3>
        </div>

        <p className="text-xs text-[#a9afbc] leading-relaxed">
          Let AI analyse the complete question and answer history for unusual or potentially suspicious behaviour.
        </p>

        <button
          type="button"
          onClick={() => setIsComingSoonOpen(true)}
          className="mt-3.5 flex w-full items-center justify-center rounded-xl bg-[#63d6ea] py-3 text-xs font-extrabold text-[#00363e] transition hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_16px_rgba(99,214,234,0.2)]"
        >
          Run Fair AI Play Review
        </button>
      </div>

      {/* Coming Soon Pop-up Dialog */}
      {isComingSoonOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#141218] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#63d6ea]/15 border border-[#63d6ea]/30 text-2xl text-[#63d6ea]">
              🤖
            </div>
            <h2 id="coming-soon-title" className="text-xl font-bold text-white">
              Coming Soon
            </h2>
            <p className="mt-2 text-sm text-[#c4c7d0] leading-relaxed">
              This feature is coming soon! AI Fair Play Review will be available in an upcoming update.
            </p>
            <button
              type="button"
              onClick={() => setIsComingSoonOpen(false)}
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
