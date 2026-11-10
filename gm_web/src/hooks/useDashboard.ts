import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '../platform/api/dashboardApi';
import type { DashboardData } from '../features/dashboard/types';

interface UseDashboardResult {
  dashboard: DashboardData | null;
  activeMatches: DashboardData['activeMatches'];
  popularCategories: DashboardData['popularCategories'];
  comingSoon: DashboardData['comingSoon'];
  stats: DashboardData['stats'];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const EMPTY_STATS = { gamesPlayed: 0, winRate: 0, winStreak: 0 };

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Unable to load dashboard'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return {
    dashboard,
    activeMatches: dashboard?.activeMatches ?? [],
    popularCategories: dashboard?.popularCategories ?? [],
    comingSoon: dashboard?.comingSoon ?? [],
    stats: dashboard?.stats ?? EMPTY_STATS,
    loading,
    error,
    refresh,
  };
}
