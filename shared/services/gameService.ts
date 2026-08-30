

import type {
  CreateGameRequest,
  CreateGameResponse,
} from '../types/game';
import type { GameRepository } from '../repositories/gameRepository';

export interface GameService {
  createGame(input: CreateGameRequest): Promise<CreateGameResponse>;
}

export function createGameService(
  gameRepository: GameRepository,
): GameService {
  return {
    async createGame(
      input: CreateGameRequest,
    ): Promise<CreateGameResponse> {
      return gameRepository.createGame(input);
    },
  };
}