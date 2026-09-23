import { createApiClient } from '../../../../shared/api/client';
import { createGameRepository } from '../../../../shared/repositories/gameRepository';
import { createGameService } from '../../../../shared/services/gameService';
import { authProvider } from '../supabase/authProvider';
import {
  BASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_FUNCTIONS_BASE_URL,
} from '../supabase/client';

export const FUNCTIONS_URL = SUPABASE_FUNCTIONS_BASE_URL;
export { BASE_URL };

export const apiClient = createApiClient(authProvider, {
  baseUrl: BASE_URL,
  apiKey: SUPABASE_ANON_KEY,
});
const gameRepository = createGameRepository(apiClient);

export const gameService = createGameService(gameRepository);

export interface GameDetails {
  gameId: string;
  roomCode: string;
  status: string;
  category: {
    id: string;
    name: string;
    itemCount: number;
  };
  players: {
    count: number;
    host: {
      playerId: string;
      secretLocked: boolean;
      playerName: string;
      playerImageUrl?: string | null;
    };
    opponent: {
      playerId: string;
      secretLocked: boolean;
      playerName: string;
      playerImageUrl?: string | null;
    } | null;
  };
  questionLimit: number;
  createdAt: string;
  expiresAt: string;
}

interface GetGameResponse {
  success: boolean;
  data?: GameDetails;
  message?: string;
}

export async function getGame(gameId: string): Promise<GameDetails> {
  const payload = await apiClient.get<GetGameResponse>('get_game', { gameId });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to load the latest game status');
  }

  return payload.data;
}

export interface PuzzleItem {
  id: string;
  name: string;
}

export interface CategoryDetails {
  id: string;
  name: string;
  iconKey?: string;
}

export interface GetPuzzlesResponse {
  success: boolean;
  data?: {
    category: CategoryDetails;
    puzzles: PuzzleItem[];
  };
  message?: string;
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

export interface SubmitSecretResult {
  gameStatus: string;
  waitingForOpponent: boolean;
}

export interface SubmitSecretResponse {
  success: boolean;
  data?: SubmitSecretResult;
  message?: string;
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

