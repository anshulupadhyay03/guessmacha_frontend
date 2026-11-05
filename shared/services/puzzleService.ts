import type { PuzzleRepository } from '../repositories/puzzleRepository';
import type { GetPuzzlesData, GetPuzzlesRequest } from '../types/puzzle';

export interface PuzzleService {
  getPuzzles(request: GetPuzzlesRequest | string): Promise<GetPuzzlesData>;
}

export function createPuzzleService(
  puzzleRepository: PuzzleRepository,
): PuzzleService {
  return {
    async getPuzzles(request: GetPuzzlesRequest | string): Promise<GetPuzzlesData> {
      if (typeof request === 'string') {
        const trimmed = request.trim();
        if (!trimmed) {
          throw new Error('Category ID is required to load puzzles');
        }
        return puzzleRepository.getPuzzles(trimmed);
      }

      if (request.gameId && request.gameId.trim()) {
        return puzzleRepository.getPuzzles({ gameId: request.gameId.trim() });
      }

      if (request.categoryId && request.categoryId.trim()) {
        return puzzleRepository.getPuzzles({ categoryId: request.categoryId.trim() });
      }

      throw new Error('Game ID or Category ID is required to load puzzles');
    },
  };
}

