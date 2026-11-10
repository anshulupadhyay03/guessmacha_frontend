export interface DashboardStats {
  gamesPlayed: number;
  winRate: number;
  winStreak: number;
}

export interface DashboardActiveMatch {
  gameId: string;
  roomCode: string;
  categoryId: string;
  categoryName: string;
  iconKey?: string | null;
  status: 'waiting' | 'secret_selection' | 'in_progress' | 'completed' | string;
  opponentId: string | null;
  opponentName: string | null;
  isMyTurn: boolean;
  updatedAt: string;
}

export interface DashboardRecentMatch {
  gameId: string;
  categoryId: string;
  categoryName: string;
  opponentId: string | null;
  opponentName: string | null;
  result: 'won' | 'lost' | string;
  playedAt: string;
}

export interface DashboardPopularCategory {
  categoryId: string;
  categoryName: string;
  iconKey?: string | null;
  gamesPlayed: number;
}

export interface DashboardComingSoonFeature {
  id: string;
  title: string;
  description: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentMatches: DashboardRecentMatch[];
  activeMatches: DashboardActiveMatch[];
  popularCategories: DashboardPopularCategory[];
  comingSoon: DashboardComingSoonFeature[];
}

export interface GetDashboardResponse {
  success: boolean;
  data?: DashboardData;
  message?: string;
}
