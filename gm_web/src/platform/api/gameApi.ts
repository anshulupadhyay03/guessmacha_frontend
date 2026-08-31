import { createApiClient } from '../../../../shared/api/client';
import { createGameRepository } from '../../../../shared/repositories/gameRepository';
import { createGameService } from '../../../../shared/services/gameService';
import { authProvider } from '../supabase/authProvider';

const apiClient = createApiClient(authProvider);
const gameRepository = createGameRepository(apiClient);

export const gameService = createGameService(gameRepository);

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

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
  const accessToken = await authProvider.getAccessToken();

  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${FUNCTIONS_URL}/get_game?${new URLSearchParams({ gameId })}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const payload = await response.json().catch(() => null) as GetGameResponse | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to load the latest game status');
  }

  return payload.data;
}
