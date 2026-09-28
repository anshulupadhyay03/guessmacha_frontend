export interface HistoryMatchItem {
  gameId: string;
  result: 'Won' | 'won' | 'victory' | 'Lost' | 'lost' | 'defeat' | 'draw' | 'Draw' | string;
  playedAt: string;
  categoryId: string;
  categoryName: string;
  opponentId: string;
  opponentName: string;
  opponentImageUrl: string | null;
  questionCount: number;
  durationSeconds: number;
  playerQuestionCount: number;
  opponentQuestionCount: number;
  playerSecret?: string | null;
  opponentSecret?: string | null;
}

export type HistoryFilter = 'all' | 'wins' | 'losses' | 'draws';

export interface HistoryData {
  filter: string;
  hasMore: boolean;
  matches: HistoryMatchItem[];
  nextCursor: string | null;
}

export interface GetHistoryResponse {
  success: boolean;
  data: HistoryData;
  message?: string;
}

