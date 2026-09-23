import { createApiClient } from '../../../../shared/api/client';
import { createGameRepository } from '../../../../shared/repositories/gameRepository';
import { createGameService } from '../../../../shared/services/gameService';
import { authProvider } from '../supabase/authProvider';
import {
  BASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_FUNCTIONS_BASE_URL,
} from '../supabase/client';

import type {
  GameDetails,
  GetGameRequest,
  GetGameResponse,
  LobbyPlayer,
  LobbyCategory,
} from '../../features/matchLobby/types';

import type {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
} from '../../features/dashboard/types';

import type {
  PuzzleItem,
  CategoryDetails,
  GetPuzzlesRequest,
  GetPuzzlesResponse,
  SubmitSecretRequest,
  SubmitSecretResult,
  SubmitSecretResponse,
} from '../../features/chooseSecret/types';

// Re-export feature request and response types for backward compatibility
export type {
  GameDetails,
  GetGameRequest,
  GetGameResponse,
  LobbyPlayer,
  LobbyCategory,
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
  PuzzleItem,
  CategoryDetails,
  GetPuzzlesRequest,
  GetPuzzlesResponse,
  SubmitSecretRequest,
  SubmitSecretResult,
  SubmitSecretResponse,
};

export const FUNCTIONS_URL = SUPABASE_FUNCTIONS_BASE_URL;
export { BASE_URL };

export const apiClient = createApiClient(authProvider, {
  baseUrl: BASE_URL,
  apiKey: SUPABASE_ANON_KEY,
});
const gameRepository = createGameRepository(apiClient);

export const gameService = createGameService(gameRepository);

export async function getGame(gameId: string): Promise<GameDetails> {
  const payload = await apiClient.get<GetGameResponse>('get_game', { gameId });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to load the latest game status');
  }

  return payload.data;
}

export async function getPuzzles(
  categoryId: string,
): Promise<{ category: CategoryDetails; puzzles: PuzzleItem[] }> {
  const payload = await apiClient.get<GetPuzzlesResponse>('get_puzzles', {
    categoryId,
  });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to load puzzles for category');
  }

  return payload.data;
}

export async function submitSecret(
  gameId: string,
  secretPuzzleId: string,
): Promise<SubmitSecretResult> {
  const payload = await apiClient.post<SubmitSecretResponse>('submit_secret', {
    gameId,
    secretPuzzleId,
  });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to submit secret');
  }

  return payload.data;
}
