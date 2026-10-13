import { useState } from 'react';
import type { HistoryMatchItem } from '../features/history/types';
import { useAuth } from '../hooks/useAuth';
import { useMatchReview } from '../hooks/useMatchReview';
import PlayerAvatar from '../components/PlayerAvatar';
import FacebookPlayerName from '../platform/facebook/FacebookPlayerName';
import './MatchReviewScreen.css';

// Inline text style for the isMe profile-name overlay (your own name).
// Mirrors public/overlays/matchreview/match_review_player_name_me.css;
// margin:-8px offsets the overlay iframe's default 8px body margin so the
// name never gets clipped into a scroller.
const REVIEW_ME_NAME_TEXT_STYLE =
  'font-family: Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 700; color: #006875; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; line-height: 1.4; margin: -8px; padding: 0;'

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

  const currentUserId = session?.user?.id;
  // match.player is the requesting (logged-in) user by construction
  // (match_review RPC builds it from p_player_id = auth UUID), verified
  // against the session id so `isMe` unambiguously means the logged-in
  // player and routes to the profile overlays (no id needed).
  const playerId = matchSummary?.player?.playerId;
  const playerFbName = matchSummary?.player?.playerName || null;
  const amPlayer = Boolean(currentUserId && playerId && currentUserId === playerId);
  // Overlay ids must be numeric FB ids: a non-numeric display name is already
  // human-readable, so skip the overlay and let the fallback render it.
  // (An overlay mounted with a bogus id would hide the fallback and render blank.)
  const playerFbId = playerFbName && /^\d{10,}$/.test(playerFbName) ? playerFbName : undefined;
  const playerInitialData = !amPlayer && playerFbId ? { playerId: playerFbId } : undefined;
  // FB-scoped id for the opponent overlay: playerName carries the FB id
  // (profiles.display_name). Never feed the 'Opponent' display default.
  const opponentFbName = matchSummary?.opponent?.playerName || initialMatch?.opponentName || null;
  const opponentFbId = opponentFbName && /^\d{10,}$/.test(opponentFbName) ? opponentFbName : undefined;
  const opponentInitialData = opponentFbId ? { playerId: opponentFbId } : undefined;
  // Human-readable name for sentence fallbacks (raw numeric ids never print).
  const oppDisplayName = opponentName && !/^\d{10,}$/.test(opponentName) ? opponentName : 'Opponent';

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

  const outcomeModifier = isWon
    ? 'won'
    : isLost
      ? 'lost'
      : isDraw
        ? 'draw'
        : 'progress';

  // Outcome subtitle as ONE overlay text (whole sentence measured together),
  // gamezone game-result style. Split static+overlay compositions leave
  // fallback/overlay width gaps ("Paridhi   defeated you") because the host
  // sizes to the fallback while the overlay renders a different width.
  const subtitleOverlayPath = isWon
    ? 'overlays/matchreview/player_name_review_subtitle_win.xml'
    : isLost
      ? 'overlays/matchreview/player_name_review_subtitle_loss.xml'
      : isDraw
        ? 'overlays/matchreview/player_name_review_subtitle_draw.xml'
        : 'overlays/matchreview/player_name_review_subtitle_progress.xml';
  const outcomeSubtitle = (
    <FacebookPlayerName
      isMe={false}
      initialData={opponentInitialData}
      fallbackName={
        isWon
          ? `You defeated ${oppDisplayName}`
          : isLost
            ? `${oppDisplayName} defeated you`
            : isDraw
              ? `Match with ${oppDisplayName} ended in a draw`
              : `Match with ${oppDisplayName} is currently in progress`
      }
      className="w-full h-5.5"
      textClassName="truncate text-sm"
      overlayPath={subtitleOverlayPath}
      overlayCassPath="overlays/matchreview/match_review_outcome_name.css"
    />
  );
  const opponentStatInitialData = opponentFbId
    ? { playerId: opponentFbId, count: opponentQuestionCount }
    : undefined;

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
    <section className="match-review-screen">
      {/* Top Header */}
      <div className="match-review-header">
        <button
          type="button"
          onClick={onBack}
          className="match-review-back-btn"
          aria-label="Back to match history"
        >
          <svg className="match-review-back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="match-review-title">Review Match</h1>

        <div className="match-review-header-spacer" aria-hidden="true" />
      </div>

      {/* Initial Loading Skeleton */}
      {loading && !matchSummary && !initialMatch && (
        <div className="match-review-skeleton-container">
          <div className="match-review-skeleton-card">
            <div className="match-review-skeleton-row">
              <div className="match-review-skeleton-bar match-review-skeleton-bar--title" />
              <div className="match-review-skeleton-bar match-review-skeleton-bar--badge" />
            </div>
            <div className="match-review-skeleton-bar match-review-skeleton-bar--subtitle" />
            <div className="match-review-skeleton-bar match-review-skeleton-bar--banner" />
          </div>
          <div className="match-review-loading-view">
            <span className="match-review-spinner" />
            <span>Loading match details…</span>
          </div>
        </div>
      )}

      {/* Initial Error State */}
      {error && !matchSummary && !initialMatch && (
        <div className="match-review-error-box">
          <p>{error.message || 'Unable to load match review details.'}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="match-review-retry-btn"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Match Dashboard Summary Card */}
      {(matchSummary || initialMatch) && (
        <div className="match-review-card">
          <div className="match-review-card-top">
            <div>
              <h2 className={`match-review-outcome-title match-review-outcome-title--${outcomeModifier}`}>
                {outcomeTitle}
              </h2>
              <p className="match-review-outcome-subtitle">{outcomeSubtitle}</p>
            </div>

            <div className="match-review-badges-row">
              <span className="match-review-badge">
                {categoryName}
              </span>
              <span className="match-review-badge">
                {formatDuration(durationSeconds)} • {questionCount} Qs
              </span>
            </div>
          </div>

          {/* Outcome Status Banner */}
          <div
            className={`match-review-outcome-banner match-review-outcome-banner--${outcomeModifier}`}
          >
            <span aria-hidden="true">{isWon ? '✓' : isLost ? '✕' : '•'}</span>
            <span>
              {isWon
                ? 'You guessed correctly first.'
                : isLost
                  ? (
                    <FacebookPlayerName
                      isMe={false}
                      initialData={opponentInitialData}
                      fallbackName={`${oppDisplayName} guessed your secret first.`}
                      className="w-full h-4.5 justify-center"
                      textClassName="truncate text-xs font-semibold text-center"
                      overlayPath="overlays/matchreview/player_name_review_banner_loss.xml"
                      overlayCassPath="overlays/matchreview/match_review_banner_name.css"
                    />
                  )
                  : isDraw
                    ? 'Match ended in a draw.'
                    : 'Match is currently in progress.'}
            </span>
          </div>

          {/* Collapsible Details */}
          {isDetailsOpen && (
            <div className="match-review-details-section">
              {/* Integrated Stats Grid matching design reference */}
              <div className="match-review-stats-grid">
                <div>
                  <p className="match-review-stat-label">Total Questions</p>
                  <p className="match-review-stat-val">{questionCount}</p>
                </div>
                <div>
                  <p className="match-review-stat-label">Duration</p>
                  <p className="match-review-stat-val">{formatDuration(durationSeconds)}</p>
                </div>
                <div className="match-review-split-col">
                  <div className="match-review-split-header">
                    <p className="match-review-stat-label">Question Split</p>
                    <div className="match-review-split-tags">
                      <span className="match-review-split-tag-me">You: {playerQuestionCount}</span>
                      <FacebookPlayerName
                        isMe={false}
                        initialData={opponentStatInitialData}
                        fallbackName={`${oppDisplayName}: ${opponentQuestionCount}`}
                        className="w-[110px] shrink-0 h-4.5"
                        textClassName="truncate text-xs font-semibold text-[#904d00]"
                        overlayPath="overlays/matchreview/player_name_review_stat.xml"
                        overlayCassPath="overlays/matchreview/match_review_stat_name.css"
                      />
                    </div>
                  </div>
                  <div className="match-review-progress-track">
                    <div
                      className="match-review-progress-fill-me"
                      style={{ width: `${playerPercent}%` }}
                      aria-label={`You asked ${playerPercent}% of questions`}
                    />
                    <div
                      className="match-review-progress-fill-opp"
                      style={{ width: `${100 - playerPercent}%` }}
                      aria-label={`Opponent asked ${100 - playerPercent}% of questions`}
                    />
                  </div>
                </div>
              </div>

              {/* Players Condensed matching design reference */}
              <div className="match-review-players-row">
                <div className="match-review-player-item">
                  <PlayerAvatar
                    isMe={amPlayer}
                    initialData={playerInitialData}
                    imageUrl={userAvatarUrl}
                    name="You"
                    className="size-10 shrink-0 rounded-full bg-[#eff4f7] text-[#006875] match-review-avatar--me"
                    iconSize="size-5"
                    xmlPath="overlays/profile_pic.xml"
                    cssPath="overlays/profile_pic.css"
                  />
                  <div className="match-review-player-details flex-1">
                    <FacebookPlayerName
                      isMe={amPlayer}
                      initialData={playerInitialData}
                      fallbackName="You"
                      uppercase
                      className="w-full h-3.5"
                      textClassName="truncate text-[10px] font-bold uppercase tracking-[0.05em] text-[#006875]"
                      textStyle={REVIEW_ME_NAME_TEXT_STYLE}
                      overlayPath="overlays/player_name.xml"
                      overlayCassPath="overlays/matchreview/match_review_player_name_me.css"
                    />
                    <span className="match-review-secret-text">{playerSecret || '—'}</span>
                  </div>
                </div>

                <div className="match-review-player-item--right">
                  <div className="match-review-player-details flex-1">
                    <FacebookPlayerName
                      isMe={false}
                      initialData={opponentInitialData}
                      fallbackName={opponentName}
                      uppercase
                      className="w-full h-3.5 justify-end"
                      textClassName="truncate text-[10px] font-bold uppercase tracking-[0.05em] text-[#904d00] text-right"
                      overlayPath="overlays/player_name.xml"
                      overlayCassPath="overlays/matchreview/match_review_player_name_opp.css"
                    />
                    <span className={`match-review-secret-text--opp ${isWon ? 'match-review-secret-text--struck' : ''}`}>
                      {opponentSecret || '—'}
                    </span>
                  </div>
                  <PlayerAvatar
                    isMe={false}
                    initialData={opponentInitialData}
                    imageUrl={opponentImageUrl}
                    name={opponentName}
                    className={`size-10 shrink-0 rounded-full bg-[#eff4f7] text-[#006875] match-review-avatar--opp ${isWon ? 'match-review-avatar--opp-won' : ''}`}
                    iconSize="size-5"
                    xmlPath="overlays/profile_pic.xml"
                    cssPath="overlays/profile_pic.css"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Details Toggle Button */}
          <div className="match-review-details-toggle-row">
            <button
              type="button"
              onClick={() => setIsDetailsOpen((prev) => !prev)}
              className="match-review-details-toggle-btn"
              aria-expanded={isDetailsOpen}
            >
              <span>Match Details</span>
              <span
                className={`match-review-toggle-icon ${
                  isDetailsOpen ? 'match-review-toggle-icon--open' : ''
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
      <div className="match-review-timeline-card">
        <div className="match-review-timeline-header">
          <h3 className="match-review-timeline-heading">
            REPLAY TIMELINE
          </h3>
          <span className="match-review-timeline-clock" title="Chronological questions">
            🕒
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="match-review-timeline-loading">
            <span className="match-review-spinner" />
            <span>Loading match replay…</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="match-review-timeline-error">
            <p>{error.message || 'Unable to load question history.'}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="match-review-retry-btn"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && questions.length === 0 && (
          <div className="match-review-timeline-empty">
            No question history recorded for this match.
          </div>
        )}

        {/* Q&A List with fixed height & scrolling */}
        {!loading && questions.length > 0 && (
          <div className="match-review-qa-scroll">
            {questions.map((q) => {
              const isAskedByMe = opponentId
                ? q.askedBy?.playerId !== opponentId
                : Boolean(matchSummary?.player?.playerId && q.askedBy?.playerId === matchSummary.player.playerId);
              const isAnswered = Boolean(q.answerText);

              return (
                <div
                  key={q.id}
                  className={`review-qa-card ${
                    isAskedByMe ? 'review-qa-card--me' : 'review-qa-card--opponent'
                  } ${!isAnswered ? 'review-qa-card--waiting' : ''}`}
                >
                  <div className="review-qa-question">{q.questionText}</div>
                  {isAnswered ? (
                    <div className="review-qa-answer">{q.answerText}</div>
                  ) : (
                    <div className="review-qa-waiting">
                      {isAskedByMe ? (
                        <FacebookPlayerName
                          isMe={false}
                          initialData={opponentInitialData}
                          fallbackName={`Waiting for ${oppDisplayName}...`}
                          className="w-full h-5"
                          textClassName="truncate text-[0.9rem] italic"
                          overlayPath="overlays/matchreview/player_name_review_waiting.xml"
                          overlayCassPath="overlays/matchreview/match_review_waiting_name.css"
                        />
                      ) : (
                        'Waiting for answer...'
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Fair Play Review Card */}
      <div className="match-review-fairplay-card">
        <div className="match-review-fairplay-header">
          <span className="match-review-fairplay-icon" aria-hidden="true">🤖</span>
          <h3 className="match-review-fairplay-title">AI Fair Play Review</h3>
        </div>

        <p className="match-review-fairplay-desc">
          Let AI analyse the complete question and answer history for unusual or potentially suspicious behaviour.
        </p>

        <button
          type="button"
          onClick={() => setIsComingSoonOpen(true)}
          className="match-review-fairplay-btn"
        >
          Run Fair AI Play Review
        </button>
      </div>

      {/* Coming Soon Pop-up Dialog */}
      {isComingSoonOpen && (
        <div
          className="match-review-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
        >
          <div className="match-review-modal-card">
            <div className="match-review-modal-icon-badge">
              🤖
            </div>
            <h2 id="coming-soon-title" className="match-review-modal-title">
              Coming Soon
            </h2>
            <p className="match-review-modal-desc">
              This feature is coming soon! AI Fair Play Review will be available in an upcoming update.
            </p>
            <button
              type="button"
              onClick={() => setIsComingSoonOpen(false)}
              className="match-review-modal-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
