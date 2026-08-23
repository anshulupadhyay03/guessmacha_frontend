import type { CategoryRepository } from '../repositories/categoryRepository';
import type { Category } from '../types/category';

export interface CategoryService {
  getActiveCategories(): Promise<Category[]>;
}

export function createCategoryService(
  categoryRepository: CategoryRepository,
): CategoryService {
  return {
    getActiveCategories(): Promise<Category[]> {
      return categoryRepository.getActiveCategories();
    },
  };
}
