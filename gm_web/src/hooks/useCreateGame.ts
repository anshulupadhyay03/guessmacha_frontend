

import { useCallback, useState } from 'react';
import type {
  CreateGameResponse,
} from '../../../shared/types/game';
import { gameService } from '../platform/api/gameApi';

interface UseCreateGameResult {
  createGame: (categoryId: string, questionLimit: number) => Promise<CreateGameResponse | null>;
  data: CreateGameResponse | null;
  loading: boolean;
  error: Error | null;
}

export function useCreateGame(): UseCreateGameResult {
  const [data, setData] = useState<CreateGameResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createGame = useCallback(async (categoryId: string, questionLimit: number) => {
    setLoading(true);
    setError(null);

    try {
      // The Edge Function accepts `questionLimit` in addition to `categoryId`.
      // The shared contract has not yet been updated, so keep that adaptation
      // at the gm_web boundary rather than changing files outside this app.
      const result = await gameService.createGame(
        { categoryId, questionLimit } as { categoryId: string },
      );
      setData(result);
      return result;
    } catch (caughtError) {
      const normalizedError =
        caughtError instanceof Error
          ? caughtError
          : new Error('Failed to create game');

      setError(normalizedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createGame,
    data,
    loading,
    error,
  };
}
