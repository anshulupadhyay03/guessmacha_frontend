import type {
  CreateGameRequest,
  CreateGameResponse,
  GameDetails,
  JoinGameData,
  SubmitSecretResult,
} from '../types/game';
import type {
  GameStateData,
  AskQuestionResponse,
  AnswerQuestionResponse,
  GuessSecretData,
  LeaveGameResponse,
} from '../types/gameplay';
import type { ApiClient } from '../api/client';

export interface GameRepository {
  createGame(input: CreateGameRequest): Promise<CreateGameResponse>;
  joinGame(roomCode: string): Promise<JoinGameData>;
  getGame(gameId: string): Promise<GameDetails>;
  submitSecret(gameId: string, secretPuzzleId: string): Promise<SubmitSecretResult>;
  getGameState(gameId: string): Promise<GameStateData>;
  askQuestion(
    gameId: string,
    questionText: string,
    clientRequestId?: string,
  ): Promise<AskQuestionResponse>;
  answerQuestion(
    gameId: string,
    answerText: string,
    clientRequestId?: string,
  ): Promise<AnswerQuestionResponse>;
  guessSecret(
    gameId: string,
    guessedPuzzleId: string,
    clientRequestId?: string,
  ): Promise<GuessSecretData>;
  leaveGame(gameId: string, clientRequestId?: string): Promise<LeaveGameResponse>;
}

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

function isJoinGameData(value: unknown): value is JoinGameData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gameId' in value &&
    typeof value.gameId === 'string' &&
    'roomCode' in value &&
    typeof value.roomCode === 'string'
  );
}

function normalizeJoinGameResponse(response: unknown): JoinGameData {
  if (isJoinGameData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isJoinGameData(response.data)
  ) {
    return response.data;
  }

  throw new Error('Join game returned an invalid game or room code');
}

function isGameDetails(value: unknown): value is GameDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gameId' in value &&
    typeof value.gameId === 'string' &&
    'roomCode' in value &&
    typeof value.roomCode === 'string' &&
    'players' in value
  );
}

function normalizeGameDetailsResponse(response: unknown): GameDetails {
  if (isGameDetails(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isGameDetails(response.data)
  ) {
    return response.data;
  }

  throw new Error('Get game returned an invalid game status');
}

function isSubmitSecretResult(value: unknown): value is SubmitSecretResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gameStatus' in value &&
    typeof value.gameStatus === 'string'
  );
}

function normalizeSubmitSecretResponse(response: unknown): SubmitSecretResult {
  if (isSubmitSecretResult(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isSubmitSecretResult(response.data)
  ) {
    return response.data;
  }

  throw new Error('Submit secret returned an invalid result');
}

function isGameStateData(value: unknown): value is GameStateData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gameId' in value &&
    typeof (value as { gameId: unknown }).gameId === 'string' &&
    'players' in value
  );
}

function normalizeGameStateResponse(response: unknown): GameStateData {
  if (isGameStateData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isGameStateData((response as { data: unknown }).data)
  ) {
    return (response as { data: GameStateData }).data;
  }

  const errorMessage =
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as { message: unknown }).message === 'string'
      ? (response as { message: string }).message
      : 'Unable to load game state';

  throw new Error(errorMessage);
}

function normalizeAskQuestionResponse(response: unknown): AskQuestionResponse {
  if (
    typeof response === 'object' &&
    response !== null &&
    (response as { success?: boolean }).success === false
  ) {
    const message =
      typeof (response as { message?: unknown }).message === 'string'
        ? (response as { message: string }).message
        : 'Failed to submit question';
    throw new Error(message);
  }
  return response as AskQuestionResponse;
}

function normalizeAnswerQuestionResponse(response: unknown): AnswerQuestionResponse {
  if (
    typeof response === 'object' &&
    response !== null &&
    (response as { success?: boolean }).success === false
  ) {
    const message =
      typeof (response as { message?: unknown }).message === 'string'
        ? (response as { message: string }).message
        : 'Failed to submit answer';
    throw new Error(message);
  }
  return response as AnswerQuestionResponse;
}

function isGuessSecretData(value: unknown): value is GuessSecretData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'is_correct' in value &&
    typeof (value as { is_correct: unknown }).is_correct === 'boolean'
  );
}

function normalizeGuessSecretResponse(response: unknown): GuessSecretData {
  if (isGuessSecretData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isGuessSecretData((response as { data: unknown }).data)
  ) {
    return (response as { data: GuessSecretData }).data;
  }

  const errorMessage =
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as { message: unknown }).message === 'string'
      ? (response as { message: string }).message
      : 'Failed to guess secret';

  throw new Error(errorMessage);
}

export function createGameRepository(apiClient: ApiClient): GameRepository {
  return {
    async createGame(
      input: CreateGameRequest,
    ): Promise<CreateGameResponse> {
      const response = await apiClient.post<unknown>('create_game', input);
      return normalizeCreateGameResponse(response);
    },

    async joinGame(roomCode: string): Promise<JoinGameData> {
      const response = await apiClient.post<unknown>('join_game', { roomCode });
      return normalizeJoinGameResponse(response);
    },

    async getGame(gameId: string): Promise<GameDetails> {
      const response = await apiClient.get<unknown>('get_game', { gameId });
      return normalizeGameDetailsResponse(response);
    },

    async submitSecret(
      gameId: string,
      secretPuzzleId: string,
    ): Promise<SubmitSecretResult> {
      const response = await apiClient.post<unknown>('submit_secret', {
        gameId,
        secretPuzzleId,
      });
      return normalizeSubmitSecretResponse(response);
    },

    async getGameState(gameId: string): Promise<GameStateData> {
      const response = await apiClient.get<unknown>('game_state', { gameId });
      return normalizeGameStateResponse(response);
    },

    async askQuestion(
      gameId: string,
      questionText: string,
      clientRequestId?: string,
    ): Promise<AskQuestionResponse> {
      const response = await apiClient.post<unknown>('ask_question', {
        gameId,
        questionText,
        clientRequestId: clientRequestId ?? generateRequestId(),
      });
      return normalizeAskQuestionResponse(response);
    },

    async answerQuestion(
      gameId: string,
      answerText: string,
      clientRequestId?: string,
    ): Promise<AnswerQuestionResponse> {
      const response = await apiClient.post<unknown>('answer_question', {
        gameId,
        answerText,
        clientRequestId: clientRequestId ?? generateRequestId(),
      });
      return normalizeAnswerQuestionResponse(response);
    },

    async guessSecret(
      gameId: string,
      guessedPuzzleId: string,
      clientRequestId?: string,
    ): Promise<GuessSecretData> {
      const response = await apiClient.post<unknown>('guess_secret', {
        gameId,
        guessedPuzzleId,
        clientRequestId: clientRequestId ?? generateRequestId(),
      });
      return normalizeGuessSecretResponse(response);
    },

    async leaveGame(
      gameId: string,
      clientRequestId?: string,
    ): Promise<LeaveGameResponse> {
      const response = await apiClient.post<LeaveGameResponse>('leave_game', {
        gameId,
        clientRequestId: clientRequestId ?? generateRequestId(),
      });
      return response ?? { success: true };
    },
  };
}
