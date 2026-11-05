import type { GetPuzzlesData, GetPuzzlesRequest } from '../types/puzzle';
import type { ApiClient } from '../api/client';

export interface PuzzleRepository {
  getPuzzles(request: GetPuzzlesRequest | string): Promise<GetPuzzlesData>;
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

  throw new Error('Unable to load puzzles');
}

export function createPuzzleRepository(apiClient: ApiClient): PuzzleRepository {
  return {
    async getPuzzles(request: GetPuzzlesRequest | string): Promise<GetPuzzlesData> {
      const params: Record<string, string> = {};
      if (typeof request === 'string') {
        params.categoryId = request;
      } else if (request.gameId) {
        params.gameId = request.gameId;
      } else if (request.categoryId) {
        params.categoryId = request.categoryId;
      }

      const response = await apiClient.get<unknown>('get_puzzles', params);
      return normalizePuzzlesResponse(response);
    },
  };
}

