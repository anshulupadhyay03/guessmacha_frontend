import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMatches } from '../hooks/useMatches';
import type { MatchItem } from '../features/matches/types';
import './MatchesScreen.css';

interface MatchesScreenProps {
  onSelectMatch: (match: MatchItem) => void;
  onCreateGame: () => void;
}

type MatchesTab = 'active' | 'expired';

function formatRoomCode(code: string): string {
  if (!code) return '';
  return code.toUpperCase().replace(/^GM-/, '');
}

function formatExpiryCountdown(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `Expires in ${hours}h ${minutes}m.`;
}

function CrossedSwordsIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#63d6ea"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Sword 1 (pointing top-right) */}
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="m13 19 2 2" />
      <path d="m19 13 2 2" />
      <path d="m17 15 4 4" />
      {/* Sword 2 (pointing top-left) */}
      <path d="m9.5 17.5 11.5-11.5V3h-3L6.5 14.5" />
      <path d="m11 19-2 2" />
      <path d="m5 13-2 2" />
      <path d="m7 15-4 4" />
    </svg>
  );
}

export default function MatchesScreen({ onSelectMatch, onCreateGame }: MatchesScreenProps) {
  const [activeTab, setActiveTab] = useState<MatchesTab>('active');
  const { activeMatches, expiredMatches, loading, error, refresh } = useMatches();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const currentList = useMemo(() => {
    return activeTab === 'active' ? activeMatches : expiredMatches;
  }, [activeTab, activeMatches, expiredMatches]);

  return (
    <section className="matches-screen" aria-label="Matches screen">
      <div className="matches-container">
        {/* Screen Header */}
        <div className="matches-header">
          <h1 className="matches-title">GuessMacha</h1>
        </div>

        {/* Tab Switcher */}
        <div className="matches-tabs-container">
          <div className="matches-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`matches-tab ${activeTab === 'active' ? 'active' : ''}`}
            >
              Active
              {activeTab === 'active' && <span className="matches-tab-indicator" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expired')}
              className={`matches-tab ${activeTab === 'expired' ? 'active' : ''}`}
            >
              Expired
              {activeTab === 'expired' && <span className="matches-tab-indicator" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="matches-content">
          {/* Loading state */}
          {loading && (
            <div className="matches-loading">
              <span className="matches-spinner" />
              <p>Loading matches…</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="matches-error">
              <p>{error.message}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="matches-retry-btn"
              >
                Tap to Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && currentList.length === 0 && (
            <div className="matches-empty">
              {/* Dual-ring crossed swords circular badge */}
              <div className="matches-empty-badge">
                <div className="matches-empty-badge-inner">
                  <CrossedSwordsIcon />
                </div>
              </div>

              <h2>{activeTab === 'active' ? 'No active matches' : 'No expired matches'}</h2>

              <p>
                {activeTab === 'active'
                  ? 'Create a game and invite a friend to start playing.'
                  : 'You do not have any expired matches.'}
              </p>

              {activeTab === 'active' && (
                <button
                  type="button"
                  onClick={onCreateGame}
                  className="create-game-btn"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>CREATE GAME</span>
                </button>
              )}
            </div>
          )}

          {/* Match cards list */}
          {!loading && !error && currentList.length > 0 && (
            <div className="matches-list">
              {currentList.map((match) => {
                const isWaiting = match.status === 'waiting' || (match.players?.length ?? 0) < 2;
                const isSecretSelection = match.status === 'secret_selection';
                const isInProgress = match.status === 'in_progress';
                const isExpired = match.matchStatus === 'expired';

                const opponentPlayer = match.players?.find((p) =>
                  currentUserId ? p.playerId !== currentUserId : !p.isHost,
                );
                const currentPlayer = match.players?.find((p) =>
                  currentUserId ? p.playerId === currentUserId : p.isHost,
                );

                const opponentName = opponentPlayer?.displayName?.trim() || 'Opponent';
                const mySecretLocked = currentPlayer?.isSecretLocked ?? false;

                // Action Required state:
                // Secret selection when current user has not locked their secret
                const isActionRequired = isSecretSelection && !mySecretLocked;

                const countdown = formatExpiryCountdown(match.expiresAt);

                return (
                  <article
                    key={match.gameId}
                    onClick={isExpired ? undefined : () => onSelectMatch(match)}
                    className={`match-card ${isActionRequired ? 'action-required' : ''} ${isExpired ? 'expired' : ''}`}
                  >
                    {/* Left cyan accent stripe on Action Required card */}
                    {isActionRequired && <div className="card-accent-stripe" />}

                    {/* Top Row: Category + Room Code (Left), Opponent/Host Status (Right) */}
                    <div className="card-top-row">
                      <div>
                        <strong className="card-category-name">{match.categoryName}</strong>
                        <span className="card-room-code">{formatRoomCode(match.roomCode)}</span>
                      </div>

                      <div>
                        {isWaiting && (
                          <span className="card-participant-info">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>You • Host</span>
                          </span>
                        )}

                        {isSecretSelection && (
                          <span className="card-participant-info cyan">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>{opponentName} joined</span>
                          </span>
                        )}

                        {isInProgress && (
                          <span className="card-participant-info">
                            You vs {opponentName}
                          </span>
                        )}

                        {isExpired && (
                          <span className="card-participant-info expired">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Section: Title, Badges, Subtitle & Chevron */}
                    <div className="card-main-content">
                      <div className="card-text-group">
                        {isWaiting && (
                          <>
                            <h3 className="card-title">Waiting for Player</h3>
                            <p className="card-subtitle">Waiting for an opponent to join.</p>
                          </>
                        )}

                        {isActionRequired && (
                          <>
                            <h3 className="card-title cyan">Choose Secret</h3>
                            <div className="card-badge-container">
                              <span className="action-badge">ACTION REQUIRED</span>
                            </div>
                            <p className="card-subtitle">
                              Your opponent has joined. Choose your secret to continue.
                            </p>
                          </>
                        )}

                        {isSecretSelection && mySecretLocked && (
                          <>
                            <h3 className="card-title">Waiting for Opponent</h3>
                            <p className="card-subtitle">
                              Your secret is locked. Waiting for opponent to pick theirs.
                            </p>
                          </>
                        )}

                        {isInProgress && (
                          <>
                            <h3 className="card-title">Match In Progress</h3>
                            <p className="card-subtitle">
                              Both secrets locked. Tap to enter the deduction arena.
                            </p>
                          </>
                        )}

                        {isExpired && (
                          <>
                            <h3 className="card-title">Match Expired</h3>
                            <p className="card-subtitle">
                              This room expired before the match completed.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Right Chevron (hidden for non-navigable expired cards) */}
                      {!isExpired && (
                        <div className={`card-chevron ${isActionRequired ? 'cyan' : ''}`}>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Expiry countdown if waiting */}
                    {isWaiting && countdown && (
                      <div className="card-footer">
                        <span>{countdown}</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
