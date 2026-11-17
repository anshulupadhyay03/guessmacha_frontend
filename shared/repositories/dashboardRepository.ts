import type { DashboardData, DashboardRank } from '../types/dashboard';
import type { ApiClient } from '../api/client';

export interface DashboardRepository {
  getDashboard(): Promise<DashboardData>;
}

function isDashboardData(value: unknown): value is DashboardData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'stats' in value &&
    typeof (value as { stats: unknown }).stats === 'object' &&
    (value as { stats: unknown }).stats !== null
  );
}

function normalizeRank(rawRank: unknown): DashboardRank | undefined {
  if (typeof rawRank !== 'object' || rawRank === null) {
    return undefined;
  }
  const r = rawRank as Record<string, unknown>;
  return {
    name: typeof r.name === 'string' && r.name.trim() ? r.name.trim() : 'Beginner',
    points: Number(r.points ?? 0) || 0,
    nextRank: typeof r.nextRank === 'string' && r.nextRank.trim() ? r.nextRank.trim() : null,
    progress: Number(r.progress ?? 0) || 0,
    nextRankPoints:
      r.nextRankPoints !== undefined && r.nextRankPoints !== null
        ? Number(r.nextRankPoints) || 0
        : null,
    pointsToNextRank:
      r.pointsToNextRank !== undefined && r.pointsToNextRank !== null
        ? Number(r.pointsToNextRank) || 0
        : null,
  };
}

function normalizeDashboard(data: DashboardData): DashboardData {
  return {
    rank: normalizeRank(data.rank),
    stats: data.stats ?? { gamesPlayed: 0, winRate: 0, winStreak: 0 },
    recentMatches: data.recentMatches ?? [],
    activeMatches: data.activeMatches ?? [],
    popularCategories: data.popularCategories ?? [],
    comingSoon: data.comingSoon ?? [],
    configuration: data.configuration,
  };
}

function normalizeDashboardResponse(response: unknown): DashboardData {
  if (isDashboardData(response)) {
    return normalizeDashboard(response);
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isDashboardData((response as { data: unknown }).data)
  ) {
    const rawData = (response as { data: DashboardData }).data;
    const rank = rawData.rank ?? (response as { rank?: unknown }).rank;
    return normalizeDashboard({ ...rawData, rank: rank as DashboardRank | undefined });
  }

  const errorMessage =
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as { message: unknown }).message === 'string'
      ? (response as { message: string }).message
      : 'Unable to load dashboard';

  throw new Error(errorMessage);
}

export function createDashboardRepository(apiClient: ApiClient): DashboardRepository {
  return {
    async getDashboard(): Promise<DashboardData> {
      const response = await apiClient.get<unknown>('dashboard');
      return normalizeDashboardResponse(response);
    },
  };
}
