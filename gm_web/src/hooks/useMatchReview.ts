import { useCallback, useEffect, useState } from 'react';
import type { ReviewQuestionItem } from '../features/matchReview/types';
import { getMatchQuestions } from '../platform/api/gameApi';

export function useMatchReview(gameId: string) {
  const [questions, setQuestions] = useState<ReviewQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchQuestions(gameId);
      const sorted = (data.questions || []).sort(
        (a, b) => a.questionNumber - b.questionNumber,
      );
      setQuestions(sorted);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Unable to load match review questions'),
      );
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!gameId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getMatchQuestions(gameId);
        if (!cancelled) {
          const sorted = (data.questions || []).sort(
            (a, b) => a.questionNumber - b.questionNumber,
          );
          setQuestions(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error('Unable to load match review questions'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void Promise.resolve().then(load);

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return {
    questions,
    loading,
    error,
    refresh: fetchQuestions,
  };
}

