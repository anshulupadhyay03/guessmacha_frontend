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
  JoinGameData,
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

import type {
  MatchPlayer,
  MatchItem,
  GetMatchesData,
  GetMatchesResponse,
} from '../../features/matches/types';

import type {
  GameStatePlayer,
  GameStateQuestion,
  GameStateData,
  GetGameStateResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  AnswerQuestionRequest,
  AnswerQuestionResponse,
  GuessSecretRequest,
  GuessSecretData,
  GuessSecretResponse,
  LeaveGameRequest,
  LeaveGameResponse,
} from '../../features/gameZone/types';

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
  JoinGameData,
  JoinGameResponse,
  PuzzleItem,
  CategoryDetails,
  GetPuzzlesRequest,
  GetPuzzlesResponse,
  SubmitSecretRequest,
  SubmitSecretResult,
  SubmitSecretResponse,
  MatchPlayer,
  MatchItem,
  GetMatchesData,
  GetMatchesResponse,
  GameStatePlayer,
  GameStateQuestion,
  GameStateData,
  GetGameStateResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  AnswerQuestionRequest,
  AnswerQuestionResponse,
  GuessSecretRequest,
  GuessSecretData,
  GuessSecretResponse,
  LeaveGameRequest,
  LeaveGameResponse,
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

export async function getMatches(): Promise<GetMatchesData> {
  const payload = await apiClient.get<GetMatchesResponse>('get_matches');

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to load matches');
  }

  return payload.data;
}

export async function getGameState(gameId: string): Promise<GameStateData> {
  const payload = await apiClient.get<GetGameStateResponse>('game_state', { gameId });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Unable to load game state');
  }

  return payload.data;
}

export async function askQuestion(
  gameId: string,
  questionText: string,
  clientRequestId?: string,
): Promise<AskQuestionResponse> {
  const payload = await apiClient.post<AskQuestionResponse>('ask_question', {
    gameId,
    questionText,
    clientRequestId: clientRequestId ?? crypto.randomUUID(),
  });

  if (!payload?.success) {
    throw new Error(payload?.message ?? 'Failed to submit question');
  }

  return payload;
}

export async function answerQuestion(
  gameId: string,
  answerText: string,
  clientRequestId?: string,
): Promise<AnswerQuestionResponse> {
  const payload = await apiClient.post<AnswerQuestionResponse>('answer_question', {
    gameId,
    answerText,
    clientRequestId: clientRequestId ?? crypto.randomUUID(),
  });

  if (!payload?.success) {
    throw new Error(payload?.message ?? 'Failed to submit answer');
  }

  return payload;
}

export async function guessSecret(
  gameId: string,
  guessedPuzzleId: string,
  clientRequestId?: string,
): Promise<GuessSecretData> {
  const payload = await apiClient.post<GuessSecretResponse>('guess_secret', {
    gameId,
    guessedPuzzleId,
    clientRequestId: clientRequestId ?? crypto.randomUUID(),
  });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Failed to guess secret');
  }

  return payload.data;
}

export async function leaveGame(
  gameId: string,
  clientRequestId?: string,
): Promise<LeaveGameResponse> {
  const payload = await apiClient.post<LeaveGameResponse>('leave_game', {
    gameId,
    clientRequestId: clientRequestId ?? crypto.randomUUID(),
  });

  return payload;
}

export async function joinGame(roomCode: string): Promise<JoinGameData> {
  const payload = await apiClient.post<JoinGameResponse>('join_game', {
    roomCode,
  });

  if (!payload?.success || !payload.data) {
    throw new Error(payload?.message ?? 'Failed to join game');
  }

  return payload.data;
}
