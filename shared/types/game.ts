export interface CreateGameRequest {
  categoryId: string;
}

export interface CreateGameResponse {
  gameId: string;
  roomCode: string;
}