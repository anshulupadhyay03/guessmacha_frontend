import type { GetMatchesData } from '../types/match';
import type { ApiClient } from '../api/client';

export interface MatchRepository {
  getMatches(): Promise<GetMatchesData>;
}

function isGetMatchesData(value: unknown): value is GetMatchesData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'activeMatches' in value &&
    Array.isArray((value as { activeMatches: unknown }).activeMatches) &&
    'expiredMatches' in value &&
    Array.isArray((value as { expiredMatches: unknown }).expiredMatches)
  );
}

function normalizeMatchesResponse(response: unknown): GetMatchesData {
  if (isGetMatchesData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isGetMatchesData((response as { data: unknown }).data)
  ) {
    return (response as { data: GetMatchesData }).data;
  }

  const errorMessage =
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as { message: unknown }).message === 'string'
      ? (response as { message: string }).message
      : 'Unable to load matches';

  throw new Error(errorMessage);
}

export function createMatchRepository(apiClient: ApiClient): MatchRepository {
  return {
    async getMatches(): Promise<GetMatchesData> {
      const response = await apiClient.get<unknown>('get_matches');
      return normalizeMatchesResponse(response);
    },
  };
}

