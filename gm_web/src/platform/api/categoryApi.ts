import {
  createCategoryRepository,
  type CategoryDataSource,
} from '../../../../shared/repositories/categoryRepository';
import { createCategoryService } from '../../../../shared/services/categoryService';
import { supabase } from '../supabase/client';

// The repository only relies on the small query surface declared by
// CategoryDataSource; this avoids leaking Supabase types into shared code.
const categoryRepository = createCategoryRepository(
  supabase as unknown as CategoryDataSource,
);

export const categoryService = createCategoryService(categoryRepository);
