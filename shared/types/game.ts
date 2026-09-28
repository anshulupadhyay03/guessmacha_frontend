export interface CreateGameRequest {
  categoryId: string;
  questionLimit?: number;
}

export interface CreateGameResponse {
  gameId: string;
  roomCode: string;
}

export interface JoinGameRequest {
  roomCode: string;
}

export interface JoinGameData {
  gameId: string;
  roomCode: string;
  hostId: string;
  categoryId: string;
  status: string;
}

export interface JoinGameResponse {
  success: boolean;
  data?: JoinGameData;
  message?: string;
}

export interface LobbyPlayer {
  playerId: string;
  secretLocked: boolean;
  playerName: string;
  playerImageUrl?: string | null;
}

export interface LobbyCategory {
  id: string;
  name: string;
  itemCount: number;
}

export interface GameDetails {
  gameId: string;
  roomCode: string;
  status: string;
  category: LobbyCategory;
  players: {
    count: number;
    host: LobbyPlayer;
    opponent: LobbyPlayer | null;
  };
  questionLimit: number;
  createdAt: string;
  expiresAt: string;
}

export interface GetGameRequest {
  gameId: string;
}

export interface GetGameResponse {
  success: boolean;
  data?: GameDetails;
  message?: string;
}

export interface SubmitSecretRequest {
  gameId: string;
  secretPuzzleId: string;
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