import type { Category } from '../types/category';

interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  icon_key: string | null;
}

interface CategoryQueryResult {
  data: CategoryRow[] | null;
  error: { message: string } | null;
}

interface CategoriesQuery {
  select(columns: string): {
    eq(column: string, value: boolean): {
      order(column: string, options: { ascending: boolean }): PromiseLike<CategoryQueryResult>;
    };
  };
}

export interface CategoryDataSource {
  from(table: 'categories'): CategoriesQuery;
}

export interface CategoryRepository {
  getActiveCategories(): Promise<Category[]>;
}

export function createCategoryRepository(
  dataSource: CategoryDataSource,
): CategoryRepository {
  return {
    async getActiveCategories(): Promise<Category[]> {
      const { data, error } = await dataSource
        .from('categories')
        .select('id, name, description, icon_key')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        iconKey: category.icon_key,
      }));
    },
  };
}
