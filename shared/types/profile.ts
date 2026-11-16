export interface PlayerProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface RankProgression {
  name: string;
  points: number;
  nextRank: string | null;
  nextRankPoints: number | null;
  pointsToNextRank: number | null;
  progress: number;
}

export interface StreakInfo {
  type: 'win' | 'loss' | null;
  count: number;
}

export interface GameStatistics {
  gamesPlayed: number;
  winRate: number;
  currentStreak: StreakInfo;
  bestStreak: StreakInfo;
}

export interface MatchDistribution {
  wins: number;
  losses: number;
  draws: number;
}

export interface MatchRecord {
  wins: number;
  losses: number;
  draws: number;
  totalCompleted: number;
  winRate: number;
  distribution: MatchDistribution;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  iconKey: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

// Backward-compatible alias
export type CategoryPerformanceItem = CategoryPerformance;

export interface ProfileData {
  profile: PlayerProfile;
  rank: RankProgression;
  gameStatistics: GameStatistics;
  matchRecord: MatchRecord;
  categoryPerformance: CategoryPerformance[];
}

export interface GetProfileResponse {
  success: boolean;
  data: ProfileData;
  message?: string;
  error?: string;
}
