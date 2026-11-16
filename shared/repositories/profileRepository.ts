import type { ProfileData, CategoryPerformance } from '../types/profile';
import type { ApiClient } from '../api/client';

export interface ProfileRepository {
  getProfile(): Promise<ProfileData>;
}

function sanitizeCategoryPerformance(raw: unknown): CategoryPerformance[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const cat = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    return {
      categoryId: typeof cat.categoryId === 'string' ? cat.categoryId : '',
      categoryName: typeof cat.categoryName === 'string' && cat.categoryName.trim() ? cat.categoryName : 'Unknown Category',
      iconKey: typeof cat.iconKey === 'string' && cat.iconKey.trim() ? cat.iconKey : 'default',
      matchesPlayed: Number(cat.matchesPlayed ?? 0) || 0,
      wins: Number(cat.wins ?? 0) || 0,
      losses: Number(cat.losses ?? 0) || 0,
      draws: Number(cat.draws ?? 0) || 0,
      winRate: Number(cat.winRate ?? 0) || 0,
    };
  });
}

function sanitizeProfileData(raw: Record<string, unknown>): ProfileData {
  const profileRaw = typeof raw.profile === 'object' && raw.profile !== null ? (raw.profile as Record<string, unknown>) : {};
  const rankRaw = typeof raw.rank === 'object' && raw.rank !== null ? (raw.rank as Record<string, unknown>) : {};
  const statsRaw = typeof raw.gameStatistics === 'object' && raw.gameStatistics !== null ? (raw.gameStatistics as Record<string, unknown>) : {};
  const matchRaw = typeof raw.matchRecord === 'object' && raw.matchRecord !== null ? (raw.matchRecord as Record<string, unknown>) : {};
  const distRaw = typeof matchRaw.distribution === 'object' && matchRaw.distribution !== null ? (matchRaw.distribution as Record<string, unknown>) : {};
  const currentStreakRaw = typeof statsRaw.currentStreak === 'object' && statsRaw.currentStreak !== null ? (statsRaw.currentStreak as Record<string, unknown>) : {};
  const bestStreakRaw = typeof statsRaw.bestStreak === 'object' && statsRaw.bestStreak !== null ? (statsRaw.bestStreak as Record<string, unknown>) : {};

  return {
    profile: {
      id: typeof profileRaw.id === 'string' ? profileRaw.id : '',
      displayName: typeof profileRaw.displayName === 'string' && profileRaw.displayName.trim() ? profileRaw.displayName : 'Player',
      avatarUrl: typeof profileRaw.avatarUrl === 'string' && profileRaw.avatarUrl.trim() ? profileRaw.avatarUrl : null,
    },
    rank: {
      name: typeof rankRaw.name === 'string' && rankRaw.name.trim() ? rankRaw.name : 'Beginner',
      points: Number(rankRaw.points ?? 0) || 0,
      nextRank: typeof rankRaw.nextRank === 'string' && rankRaw.nextRank.trim() ? rankRaw.nextRank : null,
      nextRankPoints: rankRaw.nextRankPoints !== undefined && rankRaw.nextRankPoints !== null ? Number(rankRaw.nextRankPoints) || 0 : null,
      pointsToNextRank: rankRaw.pointsToNextRank !== undefined && rankRaw.pointsToNextRank !== null ? Number(rankRaw.pointsToNextRank) || 0 : null,
      progress: Number(rankRaw.progress ?? 0) || 0,
    },
    gameStatistics: {
      gamesPlayed: Number(statsRaw.gamesPlayed ?? 0) || 0,
      winRate: Number(statsRaw.winRate ?? 0) || 0,
      currentStreak: {
        type: currentStreakRaw.type === 'win' || currentStreakRaw.type === 'loss' ? currentStreakRaw.type : null,
        count: Number(currentStreakRaw.count ?? 0) || 0,
      },
      bestStreak: {
        type: bestStreakRaw.type === 'win' || bestStreakRaw.type === 'loss' ? bestStreakRaw.type : null,
        count: Number(bestStreakRaw.count ?? 0) || 0,
      },
    },
    matchRecord: {
      wins: Number(matchRaw.wins ?? 0) || 0,
      losses: Number(matchRaw.losses ?? 0) || 0,
      draws: Number(matchRaw.draws ?? 0) || 0,
      totalCompleted: Number(matchRaw.totalCompleted ?? 0) || 0,
      winRate: Number(matchRaw.winRate ?? 0) || 0,
      distribution: {
        wins: Number(distRaw.wins ?? 0) || 0,
        losses: Number(distRaw.losses ?? 0) || 0,
        draws: Number(distRaw.draws ?? 0) || 0,
      },
    },
    categoryPerformance: sanitizeCategoryPerformance(raw.categoryPerformance),
  };
}

function normalizeProfileResponse(response: unknown): ProfileData {
  if (typeof response === 'object' && response !== null) {
    const resObj = response as Record<string, unknown>;

    // Handle explicit failure payloads
    if (resObj.success === false) {
      const errorMsg =
        typeof resObj.message === 'string' && resObj.message.trim()
          ? resObj.message
          : typeof resObj.error === 'string' && resObj.error.trim()
          ? resObj.error
          : 'Failed to load player profile';
      throw new Error(errorMsg);
    }

    // Check if profile data is wrapped in data
    if ('data' in resObj && typeof resObj.data === 'object' && resObj.data !== null) {
      return sanitizeProfileData(resObj.data as Record<string, unknown>);
    }

    // Check if profile data is at root level
    if ('profile' in resObj || 'rank' in resObj || 'gameStatistics' in resObj) {
      return sanitizeProfileData(resObj);
    }

    if (typeof resObj.message === 'string' && resObj.message.trim()) {
      throw new Error(resObj.message);
    }

    if (typeof resObj.error === 'string' && resObj.error.trim()) {
      throw new Error(resObj.error);
    }
  }

  throw new Error('Failed to load player profile: Invalid response from server');
}

export function createProfileRepository(apiClient: ApiClient): ProfileRepository {
  return {
    async getProfile(): Promise<ProfileData> {
      const response = await apiClient.get<unknown>('get_profile');
      return normalizeProfileResponse(response);
    },
  };
}
