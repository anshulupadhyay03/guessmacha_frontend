import type { DashboardComingSoonFeature } from './types';

/**
 * Fallback shown only when GET /dashboard omits `comingSoon`
 * (e.g. older edge-function deployment).
 * Mirrors the backend COMING_SOON_FEATURES constant.
 */
export const FALLBACK_COMING_SOON: DashboardComingSoonFeature[] = [
  {
    id: 'global_matchmaking',
    title: 'Global Matchmaking',
    description: 'Play against players from around the world.',
  },
  {
    id: 'ranked_games',
    title: 'Ranked Games',
    description: 'Compete, climb the leaderboard, and prove your skills.',
  },
  {
    id: 'daily_challenges',
    title: 'Daily Challenges',
    description: 'Take on a new challenge every day.',
  },
];
