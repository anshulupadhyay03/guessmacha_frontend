import type { CategoryDetails, PuzzleItem } from '../../features/chooseSecret/types';

export interface CachedGamePuzzles {
  categoryId?: string;
  category: CategoryDetails;
  puzzles: PuzzleItem[];
  updatedAt: number;
}

const STORAGE_PREFIX = 'guessmate:game:';
const CATEGORY_PREFIX = 'guessmate:category:';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Loads the Set of puzzle IDs marked as "less likely" for a specific game.
 */
export function loadGameLessLikelyIds(gameId: string): Set<string> {
  const storage = getStorage();
  if (!storage || !gameId) return new Set();

  try {
    const raw = storage.getItem(`${STORAGE_PREFIX}${gameId}:less_likely`);
    if (!raw) return new Set();

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((id): id is string => typeof id === 'string'));
    }
  } catch (err) {
    console.warn('[GameSecretsStorage] Failed to load less-likely secret IDs:', err);
  }
  return new Set();
}

/**
 * Persists the Set of puzzle IDs marked as "less likely" for a specific game.
 */
export function saveGameLessLikelyIds(gameId: string, ids: Set<string>): void {
  const storage = getStorage();
  if (!storage || !gameId) return;

  try {
    const key = `${STORAGE_PREFIX}${gameId}:less_likely`;
    if (ids.size === 0) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(Array.from(ids)));
    }
  } catch (err) {
    console.warn('[GameSecretsStorage] Failed to save less-likely secret IDs:', err);
  }
}

/**
 * Loads cached secrets (category and puzzle items) for a game or category.
 */
export function loadGameCachedPuzzles(
  gameId?: string,
  categoryId?: string,
): { category: CategoryDetails; puzzles: PuzzleItem[] } | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    // 1. Try game-scoped cache first
    if (gameId) {
      const raw = storage.getItem(`${STORAGE_PREFIX}${gameId}:puzzles`);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedGamePuzzles;
        if (
          parsed &&
          Array.isArray(parsed.puzzles) &&
          parsed.puzzles.length > 0 &&
          (!categoryId || parsed.categoryId === categoryId || parsed.category?.id === categoryId)
        ) {
          return { category: parsed.category, puzzles: parsed.puzzles };
        }
      }
    }

    // 2. Try category-level cache
    if (categoryId) {
      const raw = storage.getItem(`${CATEGORY_PREFIX}${categoryId}:puzzles`);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedGamePuzzles;
        if (parsed && Array.isArray(parsed.puzzles) && parsed.puzzles.length > 0) {
          return { category: parsed.category, puzzles: parsed.puzzles };
        }
      }
    }
  } catch (err) {
    console.warn('[GameSecretsStorage] Failed to read cached puzzles:', err);
  }

  return null;
}

/**
 * Persists secrets (category and puzzle items) for a game or category.
 */
export function saveGameCachedPuzzles(
  category: CategoryDetails,
  puzzles: PuzzleItem[],
  gameId?: string,
  categoryId?: string,
): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const effectiveCatId = categoryId || category.id;
    const payload: CachedGamePuzzles = {
      categoryId: effectiveCatId,
      category,
      puzzles,
      updatedAt: Date.now(),
    };
    const serialized = JSON.stringify(payload);

    if (gameId) {
      storage.setItem(`${STORAGE_PREFIX}${gameId}:puzzles`, serialized);
    }
    if (effectiveCatId) {
      storage.setItem(`${CATEGORY_PREFIX}${effectiveCatId}:puzzles`, serialized);
    }
  } catch (err) {
    console.warn('[GameSecretsStorage] Failed to cache puzzles:', err);
  }
}

/**
 * Resets/clears the secret filters (less likely IDs) and cached secrets for a finished game.
 */
export function clearGameSecretFiltersAndCache(gameId: string): void {
  const storage = getStorage();
  if (!storage || !gameId) return;

  try {
    storage.removeItem(`${STORAGE_PREFIX}${gameId}:less_likely`);
    storage.removeItem(`${STORAGE_PREFIX}${gameId}:puzzles`);
  } catch (err) {
    console.warn('[GameSecretsStorage] Failed to clear game secret filters and cache:', err);
  }
}
