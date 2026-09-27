import { apiClient } from './gameApi';
import { createPuzzleRepository } from '../../../../shared/repositories/puzzleRepository';
import { createPuzzleService } from '../../../../shared/services/puzzleService';

const puzzleRepository = createPuzzleRepository(apiClient);
export const puzzleService = createPuzzleService(puzzleRepository);

