import type { DashboardActiveMatch } from './types';
import type { MatchItem } from '../matches/types';

/**
 * Maps a slim dashboard active match to the full MatchItem used by
 * App-level navigation (Matches screen / lobby / game zone).
 * SRP: this module owns only the mapping concern.
 */
export function mapActiveMatchToMatchItem(
  active: DashboardActiveMatch,
): MatchItem {
  return {
    gameId: active.gameId,
    roomCode: active.roomCode,
    categoryId: active.categoryId,
    categoryName: active.categoryName,
    categoryIconKey: active.iconKey ?? null,
    status: active.status,
    matchStatus: 'active',
    createdAt: active.updatedAt,
    updatedAt: active.updatedAt,
    startedAt: active.status === 'in_progress' ? active.updatedAt : null,
    expiresAt: null,
    isHost: false,
    currentTurnPlayerId: null,
    winnerId: null,
    players: [],
  };
}

/** @deprecated Use {@link mapActiveMatchToMatchItem}. */
export const toMatchItem = mapActiveMatchToMatchItem;
