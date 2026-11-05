import { useCallback, useEffect, useState } from 'react';
import type {
  CategoryDetails,
  GetPuzzlesRequest,
  PuzzleItem,
} from '../../../shared/types/puzzle';
import { puzzleService } from '../platform/api/puzzleApi';
import {
  loadGameCachedPuzzles,
  saveGameCachedPuzzles,
} from '../platform/storage/gameSecretsStorage';

interface UsePuzzlesResult {
  category: CategoryDetails | null;
  puzzles: PuzzleItem[];
  loading: boolean;
  error: Error | null;
  reload: (force?: boolean) => Promise<void>;
}

export function usePuzzles(
  categoryId?: string,
  gameId?: string,
  shouldCache = true,
): UsePuzzlesResult {
  const [category, setCategory] = useState<CategoryDetails | null>(() => {
    if (!shouldCache) return null;
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    return cached?.category ?? null;
  });
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>(() => {
    if (!shouldCache) return [];
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    return cached?.puzzles ?? [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!gameId && !categoryId) return false;
    if (!shouldCache) return true;
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    return !cached;
  });
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(
    async (force = false) => {
      if (!gameId && !categoryId) {
        setCategory(null);
        setPuzzles([]);
        setLoading(false);
        return;
      }

      // If not forcing a reload and caching is enabled and we have valid cached puzzles, skip network request
      if (!force && shouldCache) {
        const cached = loadGameCachedPuzzles(gameId, categoryId);
        if (cached && cached.puzzles.length > 0) {
          setCategory(cached.category);
          setPuzzles(cached.puzzles);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const request: GetPuzzlesRequest = gameId
          ? { gameId }
          : { categoryId: categoryId! };
        const data = await puzzleService.getPuzzles(request);
        setCategory(data.category);
        setPuzzles(data.puzzles);
        if (shouldCache) {
          saveGameCachedPuzzles(data.category, data.puzzles, gameId, categoryId);
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error('Failed to load secrets'),
        );
      } finally {
        setLoading(false);
      }
    },
    [categoryId, gameId, shouldCache],
  );

  useEffect(() => {
    void Promise.resolve().then(() => reload(false));
  }, [reload]);

  return { category, puzzles, loading, error, reload };
}
