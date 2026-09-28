import type { HistoryRepository } from '../repositories/historyRepository';
import type { HistoryData, HistoryFilter } from '../types/history';

export interface HistoryService {
  getHistory(
    filter?: HistoryFilter,
    limit?: number,
    cursor?: string | null,
  ): Promise<HistoryData>;
}

export function createHistoryService(
  historyRepository: HistoryRepository,
): HistoryService {
  return {
    async getHistory(
      filter: HistoryFilter = 'all',
      limit: number = 20,
      cursor?: string | null,
    ): Promise<HistoryData> {
      const sanitizedLimit = Math.max(1, Math.min(100, limit || 20));
      return historyRepository.getHistory(filter, sanitizedLimit, cursor);
    },
  };
}

