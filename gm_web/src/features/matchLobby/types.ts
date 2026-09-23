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

