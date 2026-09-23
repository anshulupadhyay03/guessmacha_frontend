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

export interface JoinGameResponse {
  success: boolean;
  gameId?: string;
  roomCode?: string;
  message?: string;
}

