import { apiClient } from './gameApi';
import { createDashboardRepository } from '../../../../shared/repositories/dashboardRepository';
import { createDashboardService } from '../../../../shared/services/dashboardService';

const dashboardRepository = createDashboardRepository(apiClient);
export const dashboardService = createDashboardService(dashboardRepository);
