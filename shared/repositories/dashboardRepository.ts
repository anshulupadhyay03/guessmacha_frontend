import type { DashboardData } from '../types/dashboard';
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
    return normalizeDashboard((response as { data: DashboardData }).data);
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

function normalizeDashboard(data: DashboardData): DashboardData {
  return {
    stats: data.stats ?? { gamesPlayed: 0, winRate: 0, winStreak: 0 },
    recentMatches: data.recentMatches ?? [],
    activeMatches: data.activeMatches ?? [],
    popularCategories: data.popularCategories ?? [],
    comingSoon: data.comingSoon ?? [],
  };
}

export function createDashboardRepository(apiClient: ApiClient): DashboardRepository {
  return {
    async getDashboard(): Promise<DashboardData> {
      const response = await apiClient.get<unknown>('dashboard');
      return normalizeDashboardResponse(response);
    },
  };
}
