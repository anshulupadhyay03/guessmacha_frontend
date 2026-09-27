import type { HistoryData, HistoryFilter } from '../types/history';
import type { ApiClient } from '../api/client';

export interface HistoryRepository {
  getHistory(
    filter?: HistoryFilter,
    limit?: number,
    cursor?: string | null,
  ): Promise<HistoryData>;
}

function isHistoryData(value: unknown): value is HistoryData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'matches' in value &&
    Array.isArray((value as { matches: unknown }).matches) &&
    'hasMore' in value &&
    typeof (value as { hasMore: unknown }).hasMore === 'boolean'
  );
}

function normalizeHistoryResponse(response: unknown): HistoryData {
  if (isHistoryData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isHistoryData((response as { data: unknown }).data)
  ) {
    return (response as { data: HistoryData }).data;
  }

  const errorMessage =
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as { message: unknown }).message === 'string'
      ? (response as { message: string }).message
      : 'Failed to load match history';

  throw new Error(errorMessage);
}

export function createHistoryRepository(apiClient: ApiClient): HistoryRepository {
  return {
    async getHistory(
      filter: HistoryFilter = 'all',
      limit: number = 20,
      cursor?: string | null,
    ): Promise<HistoryData> {
      const params: Record<string, string | number> = {
        limit,
        filter,
      };
      if (cursor) {
        params.cursor = cursor;
      }
      const response = await apiClient.get<unknown>('history', params);
      return normalizeHistoryResponse(response);
    },
  };
}

