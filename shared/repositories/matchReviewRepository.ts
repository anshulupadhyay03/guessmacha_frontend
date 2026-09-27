import type { MatchReviewData } from '../types/matchReview';
import type { ApiClient } from '../api/client';

export interface MatchReviewRepository {
  getMatchQuestions(gameId: string): Promise<MatchReviewData>;
}

function isMatchReviewData(value: unknown): value is MatchReviewData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'gameId' in value &&
    'questions' in value &&
    Array.isArray((value as { questions: unknown }).questions)
  );
}

function normalizeMatchReviewResponse(response: unknown): MatchReviewData {
  if (isMatchReviewData(response)) {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    isMatchReviewData((response as { data: unknown }).data)
  ) {
    return (response as { data: MatchReviewData }).data;
  }

  const errorMessage =
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as { message: unknown }).message === 'string'
      ? (response as { message: string }).message
      : 'Failed to load match review questions';

  throw new Error(errorMessage);
}

export function createMatchReviewRepository(apiClient: ApiClient): MatchReviewRepository {
  return {
    async getMatchQuestions(gameId: string): Promise<MatchReviewData> {
      const response = await apiClient.get<unknown>('get_questions', { gameId });
      return normalizeMatchReviewResponse(response);
    },
  };
}

