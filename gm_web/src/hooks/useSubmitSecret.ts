import { useCallback, useState } from 'react';
import type { SubmitSecretResult } from '../../../shared/types/game';
import { gameService } from '../platform/api/gameApi';

interface UseSubmitSecretResult {
  submitSecret: (
    gameId: string,
    secretPuzzleId: string,
  ) => Promise<SubmitSecretResult | null>;
  data: SubmitSecretResult | null;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useSubmitSecret(): UseSubmitSecretResult {
  const [data, setData] = useState<SubmitSecretResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitSecret = useCallback(
    async (gameId: string, secretPuzzleId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await gameService.submitSecret(gameId, secretPuzzleId);
        setData(result);
        return result;
      } catch (caughtError) {
        const normalizedError =
          caughtError instanceof Error
            ? caughtError
            : new Error('Failed to confirm secret');

        setError(normalizedError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    submitSecret,
    data,
    loading,
    error,
    clearError,
  };
}

