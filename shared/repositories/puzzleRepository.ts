import type { GetPuzzlesData } from '../types/puzzle';
import type { ApiClient } from '../api/client';

export interface PuzzleRepository {
  getPuzzles(categoryId: string): Promise<GetPuzzlesData>;
}

function isGetPuzzlesData(value: unknown): value is GetPuzzlesData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'category' in value &&
    'puzzles' in value &&
    Array.isArray((value as { puzzles: unknown }).puzzles)
  );
}

function normalizePuzzlesResponse(response: unknown): GetPuzzlesData {
  if (isGetPuzzlesData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isGetPuzzlesData(response.data)
  ) {
    return response.data;
  }

  throw new Error('Unable to load puzzles for category');
}

export function createPuzzleRepository(apiClient: ApiClient): PuzzleRepository {
  return {
    async getPuzzles(categoryId: string): Promise<GetPuzzlesData> {
      const response = await apiClient.get<unknown>('get_puzzles', { categoryId });
      return normalizePuzzlesResponse(response);
    },
  };
}

