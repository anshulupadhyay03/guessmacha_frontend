import { useEffect, useMemo, useRef, useState } from 'react';
import ChooseSecretModal from '../components/ChooseSecretModal';
import type { PuzzleItem } from '../features/chooseSecret/types';
import type { GameStateData, GameStatePlayer, GameStateQuestion } from '../features/gameZone/types';
import { useGameDetails } from '../hooks/useGameDetails';
import { useGameState } from '../hooks/useGameState';
import { usePuzzles } from '../hooks/usePuzzles';
import './GameZoneScreen.css';

interface GameZoneScreenProps {
  gameId: string;
  roomCode: string;
  categoryId?: string;
  categoryName?: string;
  onBackToLobby?: () => void;
  onLeave?: () => void;
}

type ActionMode = 'ask' | 'answer' | 'disabled';

function DefaultAvatarIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlayerAvatar({
  imageUrl,
  name,
  className = 'gamezone-player-avatar',
  iconSize = 'size-5',
}: {
  imageUrl?: string | null;
  name?: string;
  className?: string;
  iconSize?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (imageUrl && !hasError) {
    return (
      <div className={className} aria-label={name || 'Player'}>
        <img
          src={imageUrl}
          alt={name || 'Player'}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className={className} aria-label={name || 'Player'}>
      <DefaultAvatarIcon className={iconSize} />
    </div>
  );
}

function getTurnInfo(
  me?: GameStatePlayer,
  opponent?: GameStatePlayer,
  currentPlayerId?: string,
  currentQuestion?: GameStateQuestion | null,
): { title: string; isMyTurn: boolean; isBonus: boolean } {
  const opponentName = opponent?.playerName || 'Opponent';

  // Check if I am the active player
  const isMyTurn = (currentPlayerId === me?.playerId || me?.isMyTurn === true) && !opponent?.isMyTurn;

  if (isMyTurn) {
    // If opponent asked a question and I must answer
    if (currentQuestion && !currentQuestion.answerText && currentQuestion.askedByPlayerId === opponent?.playerId) {
      return {
        title: `Your Turn: Answer ${opponentName}'s question`,
        isMyTurn: true,
        isBonus: me?.isBonusTurn ?? false,
      };
    }
    return {
      title: `Your Turn: Ask ${opponentName} one question.`,
      isMyTurn: true,
      isBonus: me?.isBonusTurn ?? false,
    };
  }

  // Opponent turn
  if (currentQuestion && !currentQuestion.answerText && currentQuestion.askedByPlayerId === me?.playerId) {
    return {
      title: `${opponentName}'s Turn: Ready toAnswer the question.`,
      isMyTurn: false,
      isBonus: opponent?.isBonusTurn ?? false,
    };
  }

  return {
    title: `${opponentName}'s Turn: Waiting for question`,
    isMyTurn: false,
    isBonus: opponent?.isBonusTurn ?? false,
  };
}

function getActionMode(
  gameState: GameStateData | null,
  activeQuestion?: GameStateQuestion | null,
): { mode: ActionMode; placeholder: string } {
  if (!gameState || gameState.status !== 'in_progress') {
    return { mode: 'disabled', placeholder: 'Game is not in progress' };
  }

  const { me, opponent } = gameState.players;
  const opponentName = opponent?.playerName || 'Opponent';

  // Check if there is an active question waiting for my answer
  const isWaitingMyAnswer =
    (activeQuestion &&
      !activeQuestion.answerText &&
      activeQuestion.askedByPlayerId === opponent?.playerId) ||
    (!me.isMyTurn && activeQuestion?.answeredByPlayerId === me.playerId && !activeQuestion?.answerText);

  if (isWaitingMyAnswer) {
    return { mode: 'answer', placeholder: 'Answer the question...' };
  }

  // Check if it's my turn to ask
  const isMyTurnToAsk =
    (gameState.currentPlayerId === me.playerId || me.isMyTurn) &&
    !me.isCompleted &&
    me.questionsAsked < (gameState.questionLimit ?? 25);

  if (isMyTurnToAsk) {
    return { mode: 'ask', placeholder: 'Ask next question...' };
  }

  if (me.questionsAsked >= (gameState.questionLimit ?? 25)) {
    return { mode: 'disabled', placeholder: 'Question limit reached. Use Guess Secret!' };
  }

  return { mode: 'disabled', placeholder: `Waiting for ${opponentName}...` };
}

export default function GameZoneScreen({
  gameId,
  categoryId,
  categoryName,
  onBackToLobby,
  onLeave,
}: GameZoneScreenProps) {
  const { game: detailsGame } = useGameDetails(gameId);
  const effectiveCategoryId = categoryId || detailsGame?.category?.id;
  const effectiveCategoryName = categoryName || detailsGame?.category?.name || 'Category';

  const { puzzles } = usePuzzles(effectiveCategoryId);
  const {
    gameState,
    questions,
    loading,
    error,
    submitQuestion,
    submitAnswer,
    submitGuess,
    exitGame,
  } = useGameState(gameId);

  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [guessFeedback, setGuessFeedback] = useState<{
    isOpen: boolean;
    isCorrect: boolean;
    guessedName?: string;
  }>({
    isOpen: false,
    isCorrect: false,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest question
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions]);

  const me = gameState?.players?.me;
  const opponent = gameState?.players?.opponent;
  const questionLimit = gameState?.questionLimit ?? 25;

  // Resolve player secret display name
  const mySecret = me?.secret;
  const mySecretName = useMemo(() => {
    if (!mySecret) return 'Secret Locked';
    const found = puzzles.find((p) => p.id === mySecret);
    return found ? found.name : mySecret;
  }, [mySecret, puzzles]);

  // Turn calculations
  const latestQuestion = questions.length > 0 ? questions[questions.length - 1] : gameState?.question;
  const turnInfo = getTurnInfo(me, opponent, gameState?.currentPlayerId, latestQuestion);
  const { mode: actionMode, placeholder: inputPlaceholder } = getActionMode(gameState, latestQuestion);

  const turnAvatarUrl = turnInfo.isMyTurn ? me?.playerImageUrl : opponent?.playerImageUrl;
  const turnPlayerName = turnInfo.isMyTurn ? (me?.playerName || 'You') : (opponent?.playerName || 'Opponent');

  // Guess Secret button enablement
  const isGuessDisabled =
    Boolean(me?.isCompleted) ||
    Boolean(me?.finalGuessUsed) ||
    !me?.isMyTurn ||
    gameState?.status !== 'in_progress' ||
    submitting;

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || submitting || actionMode === 'disabled') return;

    setSubmitting(true);
    setActionError(null);
    try {
      if (actionMode === 'ask') {
        await submitQuestion(text);
        setInputText('');
      } else if (actionMode === 'answer') {
        await submitAnswer(text);
        setInputText('');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmGuess(secret: PuzzleItem) {
    setIsGuessModalOpen(false);
    setSubmitting(true);
    setActionError(null);
    try {
      const result = await submitGuess(secret.id);
      setGuessFeedback({
        isOpen: true,
        isCorrect: result.is_correct,
        guessedName: secret.name,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit guess.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmLeave() {
    setLeaving(true);
    setActionError(null);
    try {
      await exitGame();
      setIsLeaveModalOpen(false);
      if (onLeave) {
        onLeave();
      } else if (onBackToLobby) {
        onBackToLobby();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to leave game.');
    } finally {
      setLeaving(false);
    }
  }

  const meQuestionsLeft = Math.max(0, questionLimit - (me?.questionsAsked ?? 0));
  const opponentQuestionsLeft = Math.max(0, questionLimit - (opponent?.questionsAsked ?? 0));

  return (
    <section className="gamezone-container">
      <div className="gamezone-content">
        {/* Header matching gamezone.png: Back Arrow (left), Category Name (center), Leave (right) */}
        <header className="gamezone-header">
          {onBackToLobby ? (
            <button
              type="button"
              onClick={onBackToLobby}
              className="gamezone-back-btn"
              aria-label="Back to Lobby"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-8" />
          )}

          <h1 className="gamezone-header-title">
            {effectiveCategoryName}
          </h1>

          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="gamezone-leave-btn"
            aria-label="Leave Game"
          >
            Leave
          </button>
        </header>

        {/* Global Action / Error banner */}
        {actionError && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-center text-sm text-[#ffd9d9]">
            {actionError}
          </div>
        )}

        {/* Loading state indicator */}
        {loading && !gameState && (
          <div className="py-12 text-center text-[#c4c7d0]">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-[#63d6ea] border-t-transparent mb-2" />
            <p className="text-sm">Entering Game Zone…</p>
          </div>
        )}

        {/* Error state */}
        {error && !gameState && (
          <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-center text-[#ffd9d9]">
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {gameState && (
          <>
            {/* Players Status Grid */}
            <div className="gamezone-players-grid">
              {/* Me Player Card */}
              <div className="gamezone-player-card gamezone-player-card--me">
                <PlayerAvatar
                  imageUrl={me?.playerImageUrl}
                  name={me?.playerName || 'You'}
                  className="gamezone-player-avatar"
                  iconSize="size-5"
                />

                <div className="gamezone-player-info">
                  <div className="gamezone-player-name">{me?.playerName || 'You'}</div>
                  <div className="gamezone-player-secret gamezone-player-secret--revealed">
                    <span>{mySecretName}</span>
                  </div>
                  <div className="gamezone-player-questions">
                    <span className="gamezone-player-questions-label">Questions left:</span>{' '}
                    <span className="gamezone-player-questions-count">{meQuestionsLeft}/{questionLimit}</span>
                  </div>
                </div>
              </div>

              {/* Opponent Player Card */}
              <div className="gamezone-player-card gamezone-player-card--opponent">
                <PlayerAvatar
                  imageUrl={opponent?.playerImageUrl}
                  name={opponent?.playerName || 'Opponent'}
                  className="gamezone-player-avatar"
                  iconSize="size-5"
                />

                <div className="gamezone-player-info">
                  <div className="gamezone-player-name">{opponent?.playerName || 'Opponent'}</div>
                  <div className="gamezone-player-secret gamezone-player-secret--hidden">
                    <span>Hidden 👁️‍🗨️</span>
                  </div>
                  <div className="gamezone-player-questions">
                    <span className="gamezone-player-questions-label">Questions left:</span>{' '}
                    <span className="gamezone-player-questions-count">{opponentQuestionsLeft}/{questionLimit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Turn Status Banner with Player Avatar */}
            <div
              className={`gamezone-turn-banner ${
                !turnInfo.isMyTurn ? 'gamezone-turn-banner--opponent' : ''
              }`}
            >
              <PlayerAvatar
                imageUrl={turnAvatarUrl}
                name={turnPlayerName}
                className="gamezone-turn-banner-avatar"
                iconSize="size-4"
              />
              <div className="gamezone-turn-banner-text">{turnInfo.title}</div>
              {turnInfo.isBonus && (
                <span className="gamezone-turn-banner-badge gamezone-turn-banner-badge--bonus">
                  Bonus Turn
                </span>
              )}
            </div>

            {/* Game Over Banner */}
            {gameState.status === 'completed' && (
              <div className="gamezone-game-over-banner">
                <h2 className="gamezone-game-over-title">
                  {gameState.gameResult ? `Match Over: ${gameState.gameResult.toUpperCase()}` : 'Match Concluded'}
                </h2>
                <p className="gamezone-game-over-desc">
                  {gameState.endReason ?? 'The match has finished.'}
                </p>
              </div>
            )}

            {/* Scrollable Questions & Answers History - exact UI structure from screenshot */}
            <div className="gamezone-qa-container" role="log" aria-label="Question and Answer History">
              {questions.length === 0 ? (
                <div className="gamezone-qa-empty">
                  <div className="gamezone-qa-empty-icon">💬</div>
                  <p className="gamezone-qa-empty-text">No questions asked yet.</p>
                  <p className="text-xs text-[#8f94a6] mt-1">
                    {turnInfo.isMyTurn ? 'Start by asking your first question below!' : 'Waiting for opponent to ask a question.'}
                  </p>
                </div>
              ) : (
                questions.map((q) => {
                  const isAskedByMe = q.askedByPlayerId === me?.playerId;
                  const isAnswered = Boolean(q.answerText);
                  const waitingText = isAskedByMe
                    ? `Waiting for ${opponent?.playerName || 'opponent'}...`
                    : `Waiting for ${me?.playerName || 'you'}...`;

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
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Actions Bar */}
            <div className="gamezone-bottom-bar">
              {/* Question / Answer text form */}
              <form onSubmit={handleSendMessage} className="gamezone-input-form">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={inputPlaceholder}
                  disabled={actionMode === 'disabled' || submitting}
                  className="gamezone-input-field"
                  maxLength={180}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || actionMode === 'disabled' || submitting}
                  className="gamezone-send-btn"
                  aria-label="Send message"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>

              {/* Guess Secret Button - Primary color background (#63d6ea) */}
              <button
                type="button"
                onClick={() => setIsGuessModalOpen(true)}
                disabled={isGuessDisabled}
                className="gamezone-guess-btn"
                aria-label="Guess Secret"
              >
                Guess Secret
              </button>
            </div>
          </>
        )}
      </div>

      {/* Choose Secret Modal for Guessing Opponent's Secret */}
      <ChooseSecretModal
        isOpen={isGuessModalOpen}
        categoryId={effectiveCategoryId}
        categoryName={effectiveCategoryName}
        title="Guess Opponent's Secret"
        subtitle="Select the secret you think your opponent chose"
        confirmButtonText="Confirm Guess"
        helperText="Warning: If your guess is wrong, your opponent gets a 2-question bonus turn!"
        onClose={() => setIsGuessModalOpen(false)}
        onConfirmSelection={handleConfirmGuess}
      />

      {/* Leave Game Confirmation Modal */}
      {isLeaveModalOpen && (
        <div className="gamezone-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title">
          <div className="gamezone-modal-box">
            <div className="gamezone-modal-icon">🚪</div>
            <h2 id="leave-dialog-title" className="gamezone-modal-title">Leave Game?</h2>
            <p className="gamezone-modal-desc">
              Are you sure you want to leave this game? Leaving will forfeit your progress and forfeit the match.
            </p>
            <div className="gamezone-modal-actions">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={leaving}
                className="gamezone-modal-btn gamezone-modal-btn--cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                disabled={leaving}
                className="gamezone-modal-btn gamezone-modal-btn--danger"
              >
                {leaving ? 'Leaving…' : 'Leave Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guess Result Feedback Modal */}
      {guessFeedback.isOpen && (
        <div className="gamezone-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="feedback-dialog-title">
          <div className="gamezone-modal-box">
            <div className="gamezone-modal-icon">
              {guessFeedback.isCorrect ? '🎉' : '❌'}
            </div>
            <h2 id="feedback-dialog-title" className="gamezone-modal-title">
              {guessFeedback.isCorrect ? 'Correct Guess!' : 'Incorrect Guess'}
            </h2>
            <p className="gamezone-modal-desc">
              {guessFeedback.isCorrect
                ? `Outstanding! You successfully deduced that ${opponent?.playerName || 'your opponent'}'s secret is "${guessFeedback.guessedName}".`
                : `That was not ${opponent?.playerName || 'your opponent'}'s secret! They now receive a 2-question bonus turn.`}
            </p>
            <div className="gamezone-modal-actions">
              <button
                type="button"
                onClick={() => setGuessFeedback({ isOpen: false, isCorrect: false })}
                className="gamezone-modal-btn gamezone-modal-btn--confirm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
