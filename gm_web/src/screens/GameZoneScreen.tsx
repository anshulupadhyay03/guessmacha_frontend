import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChooseSecretModal from '../components/ChooseSecretModal';
import PlayerAvatar from '../components/PlayerAvatar';
import FacebookPlayerName from '../platform/facebook/FacebookPlayerName';
import type { PuzzleItem } from '../features/chooseSecret/types';
import type { GameStateData, GameStatePlayer, GameStateQuestion } from '../features/gameZone/types';
import { useGameDetails } from '../hooks/useGameDetails';
import { useGameState } from '../hooks/useGameState';
import './GameZoneScreen.css';

interface GameZoneScreenProps {
  gameId: string;
  roomCode: string;
  categoryId?: string;
  categoryName?: string;
  onBackToLobby?: () => void;
  onLeave?: () => void;
  onGoHome?: () => void;
  onReviewMatch?: (gameId: string) => void;
}

type ActionMode = 'ask' | 'answer' | 'disabled';

interface GameOutcome {
  isFinished: boolean;
  resultType: 'win' | 'loss' | 'draw' | null;
  title: string;
  subtitle: string;
  badgeClass: string;
  textColor: string;
}

function resolveGameOutcome(gameState: GameStateData | null): GameOutcome {
  if (!gameState) {
    return { isFinished: false, resultType: null, title: '', subtitle: '', badgeClass: '', textColor: '' };
  }

  const isFinished = gameState.status === 'finished' || gameState.status === 'completed';
  if (!isFinished) {
    return { isFinished: false, resultType: null, title: '', subtitle: '', badgeClass: '', textColor: '' };
  }

  const me = gameState.players?.me;
  const opponent = gameState.players?.opponent;
  const opponentName = opponent?.playerName || 'Opponent';

  const rawResult = gameState.gameResult;
  let winnerId: string | null = null;
  let resultStatus = '';

  if (typeof rawResult === 'object' && rawResult !== null) {
    winnerId = rawResult.winnerId ?? null;
    resultStatus = (rawResult.status || '').toLowerCase();
  } else if (typeof rawResult === 'string') {
    resultStatus = rawResult.toLowerCase();
  }

  // 1. Authoritative resolution based on winnerId
  if (winnerId) {
    if (winnerId === me?.playerId) {
      return {
        isFinished: true,
        resultType: 'win',
        title: 'VICTORY',
        subtitle: `You defeated ${opponentName}!`,
        badgeClass: 'bg-[#e6f6ee] text-[#0b6b45] border-[#0b6b45]/30',
        textColor: 'text-[#006875]',
      };
    }
    if (winnerId === opponent?.playerId) {
      return {
        isFinished: true,
        resultType: 'loss',
        title: 'DEFEAT',
        subtitle: `${opponentName} won the match!`,
        badgeClass: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30',
        textColor: 'text-[#ba1a1a]',
      };
    }
  }

  // 2. Fallback resolution based on result status
  if (resultStatus === 'won' || resultStatus === 'win' || resultStatus === 'victory') {
    if (gameState.endedByPlayerId && gameState.endedByPlayerId === opponent?.playerId) {
      return {
        isFinished: true,
        resultType: 'loss',
        title: 'DEFEAT',
        subtitle: `${opponentName} outsmarted you!`,
        badgeClass: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30',
        textColor: 'text-[#ba1a1a]',
      };
    }
    return {
      isFinished: true,
      resultType: 'win',
      title: 'VICTORY',
      subtitle: `You outsmarted ${opponentName}!`,
      badgeClass: 'bg-[#e6f6ee] text-[#0b6b45] border-[#0b6b45]/30',
      textColor: 'text-[#006875]',
    };
  }

  if (resultStatus === 'lost' || resultStatus === 'loss' || resultStatus === 'defeat') {
    return {
      isFinished: true,
      resultType: 'loss',
      title: 'DEFEAT',
      subtitle: `${opponentName} outsmarted you!`,
      badgeClass: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30',
      textColor: 'text-[#ba1a1a]',
    };
  }

  // 3. Draw fallback
  return {
    isFinished: true,
    resultType: 'draw',
    title: 'DRAW',
    subtitle: `Match with ${opponentName} ended in a draw`,
    badgeClass: 'bg-[#ffeccf] text-[#904d00] border-[#904d00]/30',
    textColor: 'text-[#904d00]',
  };
}

function getTurnInfo(
  me?: GameStatePlayer,
  opponent?: GameStatePlayer,
  currentPlayerId?: string | null,
  currentQuestion?: GameStateQuestion | null,
  isFinished = false,
): { title: string; isMyTurn: boolean; isBonus: boolean } {
  if (isFinished) {
    return {
      title: 'Match Finished',
      isMyTurn: false,
      isBonus: false,
    };
  }

  //const opponentName = opponent?.playerName || 'Opponent';

  // 1. If an unanswered question exists, turn is defined by who must answer it
  if (currentQuestion && !currentQuestion.answerText) {
    // If opponent asked the question (or it's assigned to me to answer): It's my turn to ANSWER
    if (
      currentQuestion.askedByPlayerId === opponent?.playerId ||
      currentQuestion.answeredByPlayerId === me?.playerId
    ) {
      /* return {
        title: `Your Turn: Answer ${opponentName}'s question`,
        isMyTurn: true,
        isBonus: me?.isBonusTurn ?? false,
      }; */
      return {
        title: `Your Turn: Answer opponent's question`,
        isMyTurn: true,
        isBonus: me?.isBonusTurn ?? false,
      };
    }

    // If I asked the question (or it's assigned to opponent to answer): It's opponent's turn to ANSWER
    if (
      currentQuestion.askedByPlayerId === me?.playerId ||
      currentQuestion.answeredByPlayerId === opponent?.playerId
    ) {
      /* return {
        title: `${opponentName}'s Turn: Ready to Answer the question.`,
        isMyTurn: false,
        isBonus: opponent?.isBonusTurn ?? false,
      }; */
      return {
        title: `Opponent's Turn: Wait for the question and answer it.`,
        isMyTurn: false,
        isBonus: opponent?.isBonusTurn ?? false,
      };
    }
  }

  // 2. No unanswered question pending: It is someone's turn to ASK a question
  const isMyTurnToAsk = Boolean(
    (currentPlayerId === me?.playerId || me?.isMyTurn === true) && !opponent?.isMyTurn
  );

  if (isMyTurnToAsk) {
   /*  return {
      title: `Your Turn: Ask ${opponentName} one question.`,
      isMyTurn: true,
      isBonus: me?.isBonusTurn ?? false,
    }; */
    return {
      title: `Your Turn: Ask opponent a question.`,
      isMyTurn: true,
      isBonus: me?.isBonusTurn ?? false,
    };
  }

  // Opponent's turn to ask
  /* return {
    title: `${opponentName}'s Turn: Waiting for question`,
    isMyTurn: false,
    isBonus: opponent?.isBonusTurn ?? false,
  }; */
  return {
    title: `Opponent's Turn: Wait for the questions and answer it.`,
    isMyTurn: false,
    isBonus: opponent?.isBonusTurn ?? false,
  };
}

function getActionMode(
  gameState: GameStateData | null,
  activeQuestion?: GameStateQuestion | null,
): { mode: ActionMode; placeholder: string } {
  if (!gameState || gameState.status === 'finished' || gameState.status === 'completed') {
    return { mode: 'disabled', placeholder: 'Match is finished' };
  }

  if (gameState.status !== 'in_progress') {
    return { mode: 'disabled', placeholder: 'Game is not in progress' };
  }

  const { me, opponent } = gameState.players;
  //const opponentName = opponent?.playerName || 'Opponent';

  // 1. Check if there is an active unanswered question
  if (activeQuestion && !activeQuestion.answerText) {
    // Waiting for my answer
    if (
      activeQuestion.askedByPlayerId === opponent?.playerId ||
      activeQuestion.answeredByPlayerId === me?.playerId
    ) {
      return { mode: 'answer', placeholder: 'Answer the question...' };
    }

    // Question was asked by me, waiting for opponent's answer -> disable asking further questions
    if (
      activeQuestion.askedByPlayerId === me?.playerId ||
      activeQuestion.answeredByPlayerId === opponent?.playerId
    ) {
      /* return { mode: 'disabled', placeholder: `Waiting for ${opponentName}...` }; */
      return { mode: 'disabled', placeholder: `Waiting for opponent to answer...` };
    }
  }

  // 2. No unanswered question pending: Check if it's my turn to ask
  const isMyTurnToAsk =
    (gameState.currentPlayerId === me.playerId || me.isMyTurn) &&
    !me.isCompleted;

  if (isMyTurnToAsk) {
    if (me.questionsAsked >= (gameState.questionLimit ?? 25)) {
      return { mode: 'disabled', placeholder: 'Question limit reached. Use Guess Secret!' };
    }
    return { mode: 'ask', placeholder: 'Ask next question...' };
  }

  if (me.questionsAsked >= (gameState.questionLimit ?? 25)) {
    return { mode: 'disabled', placeholder: 'Question limit reached. Use Guess Secret!' };
  }

  /* return { mode: 'disabled', placeholder: `Waiting for ${opponentName}...` }; */
  return { mode: 'disabled', placeholder: 'Waiting for opponent to answer...' };
}

interface PlayersStatusGridProps {
  me?: GameStatePlayer;
  opponent?: GameStatePlayer;
  mySecretName: string;
  meQuestionsLeft: number;
  opponentQuestionsLeft: number;
  questionLimit: number;
  isFinished: boolean;
}

const PlayersStatusGrid = React.memo(function PlayersStatusGrid({
  me,
  opponent,
  mySecretName,
  meQuestionsLeft,
  opponentQuestionsLeft,
  questionLimit,
  isFinished,
}: PlayersStatusGridProps) {
  const opponentPlayerName = opponent?.playerName;
  const opponentInitialData = useMemo(() => {
    return opponentPlayerName ? { playerId: opponentPlayerName } : undefined;
  }, [opponentPlayerName]);

  return (
    <div className="gamezone-players-grid">
      {/* Me Player Card */}
      <div className="gamezone-player-card gamezone-player-card--me">
        <PlayerAvatar
          isMe
          imageUrl={me?.playerImageUrl}
          name={me?.playerName || 'You'}
          className="gamezone-player-avatar"
          iconSize="size-5"
        />

        <div className="gamezone-player-info">
          <div className="gamezone-player-name">
            <span>You</span>
          </div>
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
          initialData={opponentInitialData}
          imageUrl={opponent?.playerImageUrl}
          name={opponent?.playerName || 'Opponent'}
          className="gamezone-player-avatar"
          iconSize="size-5"
          xmlPath="overlays/profile_pic.xml"
          cssPath="overlays/profile_pic.css"
        />

        <div className="gamezone-player-info">
          <div className="gamezone-player-name">
            <FacebookPlayerName
              initialData={opponentInitialData}
              fallbackName={opponent?.playerName || 'Opponent'}
              className="w-full h-5 justify-end text-right"
              textClassName="truncate font-bold text-[#171d1e] text-[14.7px] text-right"
              overlayPath="overlays/player_name.xml"
              overlayCassPath="overlays/gamezone/gamezone_profile_player_name.css"
            />
          </div>
          <div className="gamezone-player-secret gamezone-player-secret--hidden">
            <span>
              {opponent?.secret ? opponent.secret : isFinished ? 'Revealed in Review' : 'Hidden 👁️‍🗨️'}
            </span>
          </div>
          <div className="gamezone-player-questions">
            <span className="gamezone-player-questions-label">Questions left:</span>{' '}
            <span className="gamezone-player-questions-count">{opponentQuestionsLeft}/{questionLimit}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function GameZoneScreen({
  gameId,
  categoryId,
  categoryName,
  onBackToLobby,
  onLeave,
  onGoHome,
  onReviewMatch,
}: GameZoneScreenProps) {
  const { game: detailsGame } = useGameDetails(gameId);
  const effectiveCategoryId = categoryId || detailsGame?.category?.id;
  const effectiveCategoryName = categoryName || detailsGame?.category?.name || 'Category';

  const {
    gameState,
    questions,
    loading,
    error,
    guessNotification,
    clearGuessNotification,
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

  // Resolve player secret display name directly from API response
  const mySecretName = me?.secret || 'Secret Locked';

  // Realtime guess notification message
  const guessNotificationMessage = useMemo(() => {
    if (!guessNotification) return null;

    const guesserId = guessNotification.guesserId;
    const isCorrect = guessNotification.isCorrect;
    //const oppName = opponent?.playerName || 'Opponent';

    const isOpponent = guesserId === opponent?.playerId || (!guesserId && me?.isBonusTurn);
    const isMe = guesserId === me?.playerId || (!guesserId && opponent?.isBonusTurn);

    if (isOpponent) {
      if (isCorrect) {
        //return `${oppName} guessed your secret correctly! You continue to ask Questions to guess ${oppName} secret.`;
        return `Opponent guessed your secret correctly!`;
      }
      //return `${oppName}'s guess was incorrect! You receive a bonus turn.`;
      return `Opponent's guess was incorrect! You receive a bonus turn.`;
    }

    if (isMe) {
      if (isCorrect) {
        //return 'Your guess was correct! You can only answer to help ${oppName} to guess your secret.';
        return 'Your guess was correct! You can only answer to help opponent guess your secret.';
      }
      //return `Your guess was incorrect! ${oppName} receives a bonus turn.`;
      return `Your guess was incorrect! Opponent receives a bonus turn.`;
    }

    // Generic fallback if guesser cannot be determined
    if (isCorrect) {
      return 'Secret guess was correct!';
    }
    return 'Secret guess was incorrect! Opponent receives a bonus turn.';
  }, [guessNotification, me?.playerId, me?.isBonusTurn, opponent?.playerId, opponent?.playerName, opponent?.isBonusTurn]);

  // Turn calculations
  const outcome = resolveGameOutcome(gameState);
  const pendingQuestion = questions.find((q) => !q.answerText);
  const latestQuestion =
    pendingQuestion ||
    (gameState?.question && !gameState.question.answerText ? gameState.question : null) ||
    (questions.length > 0 ? questions[questions.length - 1] : (gameState?.question ?? null));
  const turnInfo = getTurnInfo(me, opponent, gameState?.currentPlayerId, latestQuestion, outcome.isFinished);
  const { mode: actionMode, placeholder: inputPlaceholder } = getActionMode(gameState, latestQuestion);

  const hasUnansweredQuestion = Boolean(latestQuestion && !latestQuestion.answerText);

  // Guess Secret button enablement
  const isGuessDisabled =
    outcome.isFinished ||
    Boolean(me?.isCompleted) ||
    Boolean(me?.finalGuessUsed) ||
    !me?.isMyTurn ||
    hasUnansweredQuestion ||
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

  function handleGoHome() {
    if (onGoHome) {
      onGoHome();
    } else if (onLeave) {
      onLeave();
    } else if (onBackToLobby) {
      onBackToLobby();
    }
  }

  function handleReviewMatch() {
    if (onReviewMatch && gameId) {
      onReviewMatch(gameId);
    } else {
      handleGoHome();
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

        {/* Real-time Guess Event Notification Tooltip */}
        {guessNotification && guessNotificationMessage && (
          <div
            className={`relative mb-3 flex items-center justify-between gap-3 rounded-xl p-3 text-sm shadow-md border ${
              guessNotification.isCorrect
                ? 'bg-[#63d6ea]/15 border-[#63d6ea]/40 text-[#63d6ea]'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base" aria-hidden="true">
                {guessNotification.isCorrect ? '🎯' : '⚠️'}
              </span>
              <span className="font-semibold leading-snug">
                {guessNotificationMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={clearGuessNotification}
              className="grid size-6 shrink-0 place-items-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white cursor-pointer"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Action / Error banner */}
        {actionError && (
          <div className="relative mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-sm color: var(--text-primary); font-weight: 600;
">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="grid size-8 shrink-0 place-items-center rounded-lg cursor-pointer"
              aria-label="Close error"
            >
              ✕
            </button>
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
            <PlayersStatusGrid
              me={me}
              opponent={opponent}
              mySecretName={mySecretName}
              meQuestionsLeft={meQuestionsLeft}
              opponentQuestionsLeft={opponentQuestionsLeft}
              questionLimit={questionLimit}
              isFinished={outcome.isFinished}
            />

            {/* Turn Status Banner OR Game Over / Match Finished Banner */}
            {outcome.isFinished ? (
              <div className="gamezone-game-over-banner">
                <div className="flex items-center justify-center gap-2">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-black tracking-widest border ${outcome.badgeClass}`}>
                    {outcome.title}
                  </span>
                </div>
                <h2 className={`mt-2 text-lg font-black tracking-tight ${outcome.textColor}`}>
                  {outcome.subtitle}
                </h2>
                <p className="gamezone-game-over-desc">
                  {gameState.endReason ?? (
                    outcome.resultType === 'win'
                      ? 'Congratulations on the victory!'
                      : outcome.resultType === 'loss'
                      ? `${opponent?.playerName || 'Opponent'} correctly guessed your secret.`
                      : 'Both players completed the match.'
                  )}
                </p>
              </div>
            ) : (
              <div
                className={`gamezone-turn-banner ${
                  !turnInfo.isMyTurn ? 'gamezone-turn-banner--opponent' : ''
                }`}
              >
                <div className="gamezone-turn-banner-text">{turnInfo.title}</div>
                {turnInfo.isBonus && (
                  <span className="gamezone-turn-banner-badge gamezone-turn-banner-badge--bonus">
                    Bonus Turn
                  </span>
                )}
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
            {outcome.isFinished ? (
              <div className="gamezone-bottom-bar">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#63d6ea] text-sm font-extrabold text-[#00363e] shadow-[0_4px_16px_rgba(99,214,234,0.2)] transition hover:opacity-90 active:scale-[0.99] sm:text-base"
                >
                  Go to Home
                </button>
              </div>
            ) : (
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
            )}
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
      {/* Non-closable Game Result Modal Dialog */}
      {outcome.isFinished && gameState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-result-dialog-title"
        >
          <div className="relative w-full max-w-95 rounded-2xl border border-[#bbc9cc] bg-white p-6 text-center shadow-xl flex flex-col items-center gap-4">
            {/* Outcome Icon */}
            <div
              className={`grid size-16 place-items-center rounded-full border text-3xl ${
                outcome.resultType === 'win'
                  ? 'bg-[#02c2d9]/15 border-[#006875]/40 text-[#006875] shadow-[0_0_24px_rgba(0,104,117,0.2)]'
                  : outcome.resultType === 'loss'
                    ? 'bg-[#ffdad6] border-[#ba1a1a]/40 text-[#ba1a1a]'
                    : 'bg-[#ffeccf] border-[#904d00]/40 text-[#904d00]'
              }`}
              aria-hidden="true"
            >
              {outcome.resultType === 'win' ? '🏆' : outcome.resultType === 'loss' ? '⚔️' : '🤝'}
            </div>

            {/* Outcome Header */}
            <div className="flex flex-col items-center gap-1.5">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-black tracking-widest border ${outcome.badgeClass}`}>
                {outcome.title}
              </span>
              <h2 id="game-result-dialog-title" className={`text-2xl font-black tracking-tight ${outcome.textColor}`}>
                {outcome.resultType === 'win' ? 'Victory!' : outcome.resultType === 'loss' ? 'Defeat' : 'Draw'}
              </h2>
              <p className="text-sm text-[#3c494c]">
                {outcome.subtitle}
              </p>
            </div>

            {/* Match Summary Details */}
            <div className="w-full rounded-xl border border-[#bbc9cc] bg-[#eff4f7] p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-[#6c797c]">
                <span>Category</span>
                <span className="font-semibold text-[#171d1e]">{effectiveCategoryName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6c797c]">Your Secret</span>
                <span className="font-semibold text-[#171d1e]">{mySecretName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6c797c]">{opponent?.playerName || 'Opponent'}'s Secret</span>
                <span className="font-semibold text-[#904d00]">
                  {opponent?.secret || 'Available in Review'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#bbc9cc] text-[#6c797c]">
                <span>Questions Asked</span>
                <span className="font-medium text-[#171d1e]">
                  You: {me?.questionsAsked ?? 0} • {opponent?.playerName || 'Opponent'}: {opponent?.questionsAsked ?? 0}
                </span>
              </div>

              {gameState.endReason && (
                <div className="pt-1 border-t border-[#bbc9cc] text-[#6c797c]">
                  <span>Reason: </span>
                  <span className="text-[#171d1e]">{gameState.endReason}</span>
                </div>
              )}
            </div>

            {/* Non-closable forced action buttons */}
            <div className="w-full flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleReviewMatch}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#006875] text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(0,104,117,0.2)] transition hover:bg-[#005a66] active:scale-[0.99] sm:text-base"
              >
                <span>Review Match</span>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleGoHome}
                className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[#bbc9cc] bg-[#eff4f7] text-sm font-bold text-[#171d1e] transition hover:bg-[#e9eff1] active:scale-[0.99]"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
