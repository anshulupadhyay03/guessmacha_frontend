import { useCallback, useEffect, useState } from 'react';
import { getMatches } from '../platform/api/gameApi';
import type { MatchItem } from '../features/matches/types';

interface UseMatchesResult {
  activeMatches: MatchItem[];
  expiredMatches: MatchItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useMatches(): UseMatchesResult {
  const [activeMatches, setActiveMatches] = useState<MatchItem[]>([]);
  const [expiredMatches, setExpiredMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMatches();
      setActiveMatches(data.activeMatches ?? []);
      setExpiredMatches(data.expiredMatches ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Unable to load matches'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return {
    activeMatches,
    expiredMatches,
    loading,
    error,
    refresh,
  };
}
