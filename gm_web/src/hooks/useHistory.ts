import { useCallback, useEffect, useState } from 'react';
import type { HistoryFilter, HistoryMatchItem } from '../features/history/types';
import { getHistory } from '../platform/api/gameApi';

export function useHistory(filter: HistoryFilter = 'all') {
  const [matches, setMatches] = useState<HistoryMatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(filter, 20, null);
      setMatches(data.matches || []);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch history'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getHistory(filter, 20, null);
        if (!cancelled) {
          setMatches(data.matches || []);
          setHasMore(data.hasMore);
          setNextCursor(data.nextCursor);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch history'));
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
  }, [filter]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || loadingMore || !nextCursor) {
      return;
    }

    setLoadingMore(true);
    try {
      const data = await getHistory(filter, 20, nextCursor);
      setMatches((prev) => {
        const existingIds = new Set(prev.map((m) => m.gameId));
        const newMatches = (data.matches || []).filter((m) => !existingIds.has(m.gameId));
        return [...prev, ...newMatches];
      });
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Failed to load more history:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [filter, hasMore, loading, loadingMore, nextCursor]);

  return {
    matches,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh: fetchMatches,
  };
}

