import type {
  CreateGameRequest,
  CreateGameResponse,
} from '../types/game';
import type { ApiClient } from '../api/client';

export interface GameRepository {
  createGame(input: CreateGameRequest): Promise<CreateGameResponse>;
}

export function createGameRepository(apiClient: ApiClient): GameRepository {
  return {
    async createGame(
      input: CreateGameRequest,
    ): Promise<CreateGameResponse> {
      return apiClient.post<CreateGameResponse>('create_game', input);
    },
  };
}
