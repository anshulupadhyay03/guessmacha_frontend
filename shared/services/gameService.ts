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
import type { GameRepository } from '../repositories/gameRepository';

export interface GameService {
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

export function createGameService(
  gameRepository: GameRepository,
): GameService {
  return {
    async createGame(
      input: CreateGameRequest,
    ): Promise<CreateGameResponse> {
      return gameRepository.createGame(input);
    },

    async joinGame(roomCode: string): Promise<JoinGameData> {
      const normalizedCode = roomCode.trim().toUpperCase();
      if (!normalizedCode) {
        throw new Error('Please enter a room code to join a game.');
      }
      return gameRepository.joinGame(normalizedCode);
    },

    async getGame(gameId: string): Promise<GameDetails> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to get game details');
      }
      return gameRepository.getGame(gameId.trim());
    },

    async submitSecret(
      gameId: string,
      secretPuzzleId: string,
    ): Promise<SubmitSecretResult> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to submit a secret');
      }
      if (!secretPuzzleId || !secretPuzzleId.trim()) {
        throw new Error('Secret Puzzle ID is required');
      }
      return gameRepository.submitSecret(gameId.trim(), secretPuzzleId.trim());
    },

    async getGameState(gameId: string): Promise<GameStateData> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to get game state');
      }
      return gameRepository.getGameState(gameId.trim());
    },

    async askQuestion(
      gameId: string,
      questionText: string,
      clientRequestId?: string,
    ): Promise<AskQuestionResponse> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to submit a question');
      }
      if (!questionText || !questionText.trim()) {
        throw new Error('Question text cannot be empty');
      }
      return gameRepository.askQuestion(
        gameId.trim(),
        questionText.trim(),
        clientRequestId,
      );
    },

    async answerQuestion(
      gameId: string,
      answerText: string,
      clientRequestId?: string,
    ): Promise<AnswerQuestionResponse> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to submit an answer');
      }
      if (!answerText || !answerText.trim()) {
        throw new Error('Answer text cannot be empty');
      }
      return gameRepository.answerQuestion(
        gameId.trim(),
        answerText.trim(),
        clientRequestId,
      );
    },

    async guessSecret(
      gameId: string,
      guessedPuzzleId: string,
      clientRequestId?: string,
    ): Promise<GuessSecretData> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to guess the secret');
      }
      if (!guessedPuzzleId || !guessedPuzzleId.trim()) {
        throw new Error('Puzzle selection is required to make a guess');
      }
      return gameRepository.guessSecret(
        gameId.trim(),
        guessedPuzzleId.trim(),
        clientRequestId,
      );
    },

    async leaveGame(
      gameId: string,
      clientRequestId?: string,
    ): Promise<LeaveGameResponse> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to leave the game');
      }
      return gameRepository.leaveGame(gameId.trim(), clientRequestId);
    },
  };
}