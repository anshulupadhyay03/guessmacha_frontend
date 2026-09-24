export interface MatchPlayer {
  playerId: string;
  isHost: boolean;
  isSecretLocked: boolean;
  turnOrder: number;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface MatchItem {
  gameId: string;
  roomCode: string;
  categoryId: string;
  categoryName: string;
  categoryIconKey: string | null;
  status: 'waiting' | 'secret_selection' | 'in_progress' | 'completed' | string;
  matchStatus: 'active' | 'expired' | string;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  expiresAt: string | null;
  isHost: boolean;
  currentTurnPlayerId: string | null;
  winnerId: string | null;
  players: MatchPlayer[];
}

export interface GetMatchesData {
  activeMatches: MatchItem[];
  expiredMatches: MatchItem[];
}

export interface GetMatchesResponse {
  success: boolean;
  data?: GetMatchesData;
  message?: string;
}

