import type { DashboardRepository } from '../repositories/dashboardRepository';
import type { DashboardData } from '../types/dashboard';

export interface DashboardService {
  getDashboard(): Promise<DashboardData>;
}

export function createDashboardService(
  dashboardRepository: DashboardRepository,
): DashboardService {
  return {
    async getDashboard(): Promise<DashboardData> {
      return dashboardRepository.getDashboard();
    },
  };
}
