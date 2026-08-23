import { useCallback, useEffect, useState } from 'react';
import type { Category } from '../../../shared/types/category';
import { categoryService } from '../platform/api/categoryApi';

interface UseCategoriesResult {
  categories: Category[];
  error: Error | null;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCategories(await categoryService.getActiveCategories());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Unable to load categories'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { categories, error, loading, reload };
}
