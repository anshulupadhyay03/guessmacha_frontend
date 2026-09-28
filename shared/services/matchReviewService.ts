import type { MatchReviewRepository } from '../repositories/matchReviewRepository';
import type { MatchReviewData } from '../types/matchReview';

export interface MatchReviewService {
  getMatchQuestions(gameId: string): Promise<MatchReviewData>;
}

export function createMatchReviewService(
  matchReviewRepository: MatchReviewRepository,
): MatchReviewService {
  return {
    async getMatchQuestions(gameId: string): Promise<MatchReviewData> {
      if (!gameId || !gameId.trim()) {
        throw new Error('Game ID is required to load review questions');
      }
      return matchReviewRepository.getMatchReviews(gameId.trim());
    },
  };
}

