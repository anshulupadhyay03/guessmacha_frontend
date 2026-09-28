import type { MatchRepository } from '../repositories/matchRepository';
import type { GetMatchesData } from '../types/match';

export interface MatchService {
  getMatches(): Promise<GetMatchesData>;
}

export function createMatchService(
  matchRepository: MatchRepository,
): MatchService {
  return {
    async getMatches(): Promise<GetMatchesData> {
      return matchRepository.getMatches();
    },
  };
}

