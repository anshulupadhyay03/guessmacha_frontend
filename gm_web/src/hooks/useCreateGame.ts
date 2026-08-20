

import { useCallback, useState } from 'react';
import type {
  CreateGameResponse,
} from '../../../shared/types/game';
import { gameService } from '../platform/api/gameApi';

interface UseCreateGameResult {
  createGame: (categoryId: string) => Promise<CreateGameResponse | null>;
  data: CreateGameResponse | null;
  loading: boolean;
  error: Error | null;
}

export function useCreateGame(): UseCreateGameResult {
  const [data, setData] = useState<CreateGameResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createGame = useCallback(async (categoryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await gameService.createGame({ categoryId });
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