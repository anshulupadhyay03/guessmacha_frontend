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
