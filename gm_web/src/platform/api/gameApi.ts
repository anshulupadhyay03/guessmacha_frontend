import { createApiClient } from '../../../../shared/api/client';
import { createGameRepository } from '../../../../shared/repositories/gameRepository';
import { createGameService } from '../../../../shared/services/gameService';
import { authProvider } from '../supabase/authProvider';
import {
  BASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_FUNCTIONS_BASE_URL,
} from '../supabase/client';

// Re-export shared domain types for backward compatibility
export type {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameData,
  JoinGameResponse,
  GameDetails,
  GetGameRequest,
  GetGameResponse,
  LobbyPlayer,
  LobbyCategory,
  SubmitSecretRequest,
  SubmitSecretResult,
  SubmitSecretResponse,
} from '../../../../shared/types/game';

export type {
  PuzzleItem,
  CategoryDetails,
  GetPuzzlesRequest,
  GetPuzzlesResponse,
} from '../../../../shared/types/puzzle';

export type {
  MatchPlayer,
  MatchItem,
  GetMatchesData,
  GetMatchesResponse,
} from '../../../../shared/types/match';

export type {
  GameStatePlayer,
  GameStateQuestion,
  GameResultData,
  GameStateData,
  GetGameStateResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  AnswerQuestionRequest,
  AnswerQuestionResponse,
  GuessSecretRequest,
  GuessSecretData,
  RealtimeGuessNotification,
  GuessSecretResponse,
  LeaveGameRequest,
  LeaveGameResponse,
} from '../../../../shared/types/gameplay';

export type {
  HistoryMatchItem,
  HistoryFilter,
  HistoryData,
  GetHistoryResponse,
} from '../../../../shared/types/history';

export type {
  ReviewPlayer,
  ReviewQuestionItem,
  MatchReviewData,
  GetQuestionsResponse,
} from '../../../../shared/types/matchReview';

export const FUNCTIONS_URL = SUPABASE_FUNCTIONS_BASE_URL;
export { BASE_URL };

export const apiClient = createApiClient(authProvider, {
  baseUrl: BASE_URL,
  apiKey: SUPABASE_ANON_KEY,
});

const gameRepository = createGameRepository(apiClient);
export const gameService = createGameService(gameRepository);
