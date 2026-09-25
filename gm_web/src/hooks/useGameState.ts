import { useCallback, useEffect, useRef, useState } from 'react';
import {
  answerQuestion,
  askQuestion,
  getGameState,
  guessSecret,
  leaveGame,
} from '../platform/api/gameApi';
import { supabase } from '../platform/supabase/client';
import type {
  GameStateData,
  GameStateQuestion,
  GuessSecretData,
} from '../features/gameZone/types';

interface UseGameStateResult {
  gameState: GameStateData | null;
  questions: GameStateQuestion[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  submitQuestion: (text: string, clientRequestId?: string) => Promise<void>;
  submitAnswer: (text: string, clientRequestId?: string) => Promise<void>;
  submitGuess: (puzzleId: string, clientRequestId?: string) => Promise<GuessSecretData>;
  exitGame: (clientRequestId?: string) => Promise<void>;
}

export function generateClientRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useGameState(gameId: string): UseGameStateResult {
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [questions, setQuestions] = useState<GameStateQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);

  // Merge newly received question(s) into current history list
  const mergeQuestions = useCallback(
    (currentQuestions: GameStateQuestion[], incoming?: GameStateQuestion | null, list?: GameStateQuestion[]) => {
      const updated = [...currentQuestions];

      // If backend gave a full array of questions
      if (list && Array.isArray(list) && list.length > 0) {
        list.forEach((inQ) => {
          const index = updated.findIndex((q) => q.id === inQ.id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...inQ };
          } else {
            updated.push(inQ);
          }
        });
      }

      // If backend gave a single current question
      if (incoming && incoming.id) {
        const index = updated.findIndex((q) => q.id === incoming.id);
        if (index >= 0) {
          updated[index] = { ...updated[index], ...incoming };
        } else {
          updated.push(incoming);
        }
      }

      return updated;
    },
    [],
  );

  const fetchState = useCallback(async (isInitial = false) => {
    if (!gameId) return;

    if (isInitial) {
      setLoading(true);
    }

    try {
      const data = await getGameState(gameId);
      if (!isMountedRef.current) return;

      setGameState(data);
      setQuestions((prev) => mergeQuestions(prev, data.question, data.questions));
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to load game state'));
    } finally {
      if (isMountedRef.current && isInitial) {
        setLoading(false);
      }
    }
  }, [gameId, mergeQuestions]);

  const refresh = useCallback(async () => {
    await fetchState(false);
  }, [fetchState]);

  // Initial load & Supabase Realtime Subscription
  useEffect(() => {
    if (!gameId) return;

    isMountedRef.current = true;

    // 1. Initial authoritative load
    void Promise.resolve().then(() => fetchState(true));

    // 2. Debounced state refresh when Realtime notifies of changes
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleRealtimeChange = () => {
      if (!isMountedRef.current) return;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        if (isMountedRef.current) {
          void fetchState(false);
        }
      }, 100);
    };

    // 3. Supabase Realtime channel subscription across game-related tables
    const channel = supabase
  .channel(`game:${gameId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'games',
    },
    (payload) => {
      console.log('[Game Realtime] games event:', payload);
      handleRealtimeChange();
    },
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'game_players',
    },
    (payload) => {
      console.log('[Game Realtime] game_players event:', payload);
      handleRealtimeChange();
    },
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'questions',
    },
    (payload) => {
      console.log('[Game Realtime] questions event:', payload);
      handleRealtimeChange();
    },
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'guesses',
    },
    (payload) => {
      console.log('[Game Realtime] guesses event:', payload);
      handleRealtimeChange();
    },
  )
  .subscribe((status) => {
  console.log('[Game Realtime] subscription status:', status);
});

   /*  const channel = supabase
  .channel(`game:${gameId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'games',
    },
    (payload) => {
      console.log('[Game Realtime TEST] games event:', payload);
      handleRealtimeChange();
    },
  )
  .subscribe((status) => {
    console.log('[Game Realtime TEST] subscription status:', status);
  }); */

    // 4. Cleanup when leaving the Game Zone
    return () => {
      isMountedRef.current = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      void supabase.removeChannel(channel);
    };
  }, [gameId, fetchState]);

  const submitQuestion = useCallback(
    async (text: string, clientRequestId?: string) => {
      const reqId = clientRequestId ?? generateClientRequestId();
      const res = await askQuestion(gameId, text, reqId);

      if (res.data) {
        const newQ: GameStateQuestion = {
          id: res.data.question_id || res.data.questionId || generateClientRequestId(),
          questionText: res.data.question_text || res.data.questionText || text,
          askedByPlayerId: res.data.asked_by_player_id || res.data.askedByPlayerId || gameState?.players?.me?.playerId || '',
          answeredByPlayerId: res.data.answered_by_player_id || res.data.answeredByPlayerId || null,
          answerText: null,
        };
        setQuestions((prev) => mergeQuestions(prev, newQ));
      }

      await refresh();
    },
    [gameId, gameState?.players?.me?.playerId, mergeQuestions, refresh],
  );

  const submitAnswer = useCallback(
    async (text: string, clientRequestId?: string) => {
      const reqId = clientRequestId ?? generateClientRequestId();
      const res = await answerQuestion(gameId, text, reqId);

      if (res.data) {
        const updatedQ: Partial<GameStateQuestion> = {
          id: res.data.questionId,
          answerText: res.data.answerText ?? text,
          answeredByPlayerId: res.data.answeredByPlayerId ?? gameState?.players?.me?.playerId,
        };
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === updatedQ.id
              ? { ...q, answerText: updatedQ.answerText, answeredByPlayerId: updatedQ.answeredByPlayerId }
              : q,
          ),
        );
      }

      await refresh();
    },
    [gameId, gameState?.players?.me?.playerId, refresh],
  );

  const submitGuess = useCallback(
    async (puzzleId: string, clientRequestId?: string) => {
      const reqId = clientRequestId ?? generateClientRequestId();
      const result = await guessSecret(gameId, puzzleId, reqId);
      await refresh();
      return result;
    },
    [gameId, refresh],
  );

  const exitGame = useCallback(
    async (clientRequestId?: string) => {
      const reqId = clientRequestId ?? generateClientRequestId();
      await leaveGame(gameId, reqId);
    },
    [gameId],
  );

  return {
    gameState,
    questions,
    loading,
    error,
    refresh,
    submitQuestion,
    submitAnswer,
    submitGuess,
    exitGame,
  };
}
