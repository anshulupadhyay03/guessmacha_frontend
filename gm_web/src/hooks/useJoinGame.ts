import { useCallback, useState } from 'react';
import type { JoinGameData } from '../../../shared/types/game';
import { gameService } from '../platform/api/gameApi';

interface UseJoinGameResult {
  joinGame: (roomCode: string) => Promise<JoinGameData | null>;
  data: JoinGameData | null;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useJoinGame(): UseJoinGameResult {
  const [data, setData] = useState<JoinGameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const joinGame = useCallback(async (roomCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await gameService.joinGame(roomCode);
      setData(result);
      return result;
    } catch (caughtError) {
      const normalizedError =
        caughtError instanceof Error
          ? caughtError
          : new Error('Unable to join room. Please check the code and try again.');

      setError(normalizedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    joinGame,
    data,
    loading,
    error,
    clearError,
  };
}

