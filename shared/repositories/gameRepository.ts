import type {
  CreateGameRequest,
  CreateGameResponse,
} from '../types/game';
import type { ApiClient } from '../api/client';

export interface GameRepository {
  createGame(input: CreateGameRequest): Promise<CreateGameResponse>;
}

function isCreateGameResponse(value: unknown): value is CreateGameResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gameId' in value &&
    typeof value.gameId === 'string' &&
    'roomCode' in value &&
    typeof value.roomCode === 'string'
  );
}

function normalizeCreateGameResponse(response: unknown): CreateGameResponse {
  if (isCreateGameResponse(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isCreateGameResponse(response.data)
  ) {
    return response.data;
  }

  throw new Error('Create game returned an invalid game or room code');
}

export function createGameRepository(apiClient: ApiClient): GameRepository {
  return {
    async createGame(
      input: CreateGameRequest,
    ): Promise<CreateGameResponse> {
      const response = await apiClient.post<unknown>('create_game', input);

      // Supabase Edge Functions may return the payload directly or in a
      // `data` envelope, depending on how the function serializes its result.
      return normalizeCreateGameResponse(response);
    },
  };
}
