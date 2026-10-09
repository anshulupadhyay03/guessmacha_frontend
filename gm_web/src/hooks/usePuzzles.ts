import { useCallback, useEffect, useState } from 'react';
import type { CategoryDetails, PuzzleItem } from '../../../shared/types/puzzle';
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

export function usePuzzles(categoryId?: string, gameId?: string): UsePuzzlesResult {
  const [category, setCategory] = useState<CategoryDetails | null>(() => {
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    return cached?.category ?? null;
  });
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>(() => {
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    return cached?.puzzles ?? [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!categoryId) return false;
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    return !cached;
  });
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(
    async (force = false) => {
      if (!categoryId) {
        setCategory(null);
        setPuzzles([]);
        setLoading(false);
        return;
      }

      // If not forcing a reload and we have valid cached puzzles, skip network request
      if (!force) {
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
        const data = await puzzleService.getPuzzles(categoryId);
        setCategory(data.category);
        setPuzzles(data.puzzles);
        saveGameCachedPuzzles(data.category, data.puzzles, gameId, categoryId);
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
    [categoryId, gameId],
  );

  useEffect(() => {
    // If secrets are already cached and present in state, do not trigger a network request
    const cached = loadGameCachedPuzzles(gameId, categoryId);
    if (cached && cached.puzzles.length > 0) {
      setCategory(cached.category);
      setPuzzles(cached.puzzles);
      setLoading(false);
      return;
    }

    void Promise.resolve().then(() => reload(false));
  }, [categoryId, gameId, reload]);

  return { category, puzzles, loading, error, reload };
}
