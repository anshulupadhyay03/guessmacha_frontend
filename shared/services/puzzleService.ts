import type { PuzzleRepository } from '../repositories/puzzleRepository';
import type { GetPuzzlesData } from '../types/puzzle';

export interface PuzzleService {
  getPuzzles(categoryId: string): Promise<GetPuzzlesData>;
}

export function createPuzzleService(
  puzzleRepository: PuzzleRepository,
): PuzzleService {
  return {
    async getPuzzles(categoryId: string): Promise<GetPuzzlesData> {
      if (!categoryId || !categoryId.trim()) {
        throw new Error('Category ID is required to load puzzles');
      }
      return puzzleRepository.getPuzzles(categoryId.trim());
    },
  };
}

