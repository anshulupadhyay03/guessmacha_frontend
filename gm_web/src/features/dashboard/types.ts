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
