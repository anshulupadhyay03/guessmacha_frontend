import { apiClient } from './gameApi';
import { createHistoryRepository } from '../../../../shared/repositories/historyRepository';
import { createHistoryService } from '../../../../shared/services/historyService';

const historyRepository = createHistoryRepository(apiClient);
export const historyService = createHistoryService(historyRepository);

