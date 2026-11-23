import type { DashboardRepository } from '../repositories/dashboardRepository';
import type { DashboardActiveMatch, DashboardData } from '../types/dashboard';

export interface DashboardService {
  getDashboard(): Promise<DashboardData>;
}

export function createDashboardService(
  dashboardRepository: DashboardRepository,
): DashboardService {
  return {
    async getDashboard(): Promise<DashboardData> {
      const dashboard = await dashboardRepository.getDashboard();

      return {
        ...dashboard,
        activeMatches: filterActiveMatches(
          dashboard.activeMatches,
          dashboard.configuration.waitingGameExpirationMinutes,
        ),
      };
    },
  };
}

function filterActiveMatches(
  matches: DashboardActiveMatch[],
  expirationMinutes: number,
): DashboardActiveMatch[] {
  const now = Date.now();
  const expirationMs = expirationMinutes * 60 * 1000;

  return matches.filter((match) => {
    // Expiration applies only to waiting games.
    if (match.status !== 'waiting') {
      return true;
    }

    const createdAtMs = new Date(match.createdAt).getTime();

    // Keep the match if its creation date is invalid.
    if (!Number.isFinite(createdAtMs)) {
      return true;
    }

    const expiresAtMs = createdAtMs + expirationMs;

    return now < expiresAtMs;
  });
}
