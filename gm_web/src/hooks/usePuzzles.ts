import { useCallback, useEffect, useState } from 'react';
import {
  getPuzzles,
  type CategoryDetails,
  type PuzzleItem,
} from '../platform/api/gameApi';

interface UsePuzzlesResult {
  category: CategoryDetails | null;
  puzzles: PuzzleItem[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function usePuzzles(categoryId?: string): UsePuzzlesResult {
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(categoryId));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!categoryId) {
      setCategory(null);
      setPuzzles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPuzzles(categoryId);
      setCategory(data.category);
      setPuzzles(data.puzzles);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Failed to load secrets'),
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  return { category, puzzles, loading, error, reload };
}

