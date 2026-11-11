import { useMemo } from 'react';
import {
  getMatchProgress,
  type MatchProgressInfo,
  type MatchProgressOptions,
} from '../features/matchLobby/progress';

export function useMatchProgress(options: MatchProgressOptions): MatchProgressInfo {
  const { status, mySecretLocked, isOpponent } = options;

  return useMemo(
    () => getMatchProgress({ status, mySecretLocked, isOpponent }),
    [status, mySecretLocked, isOpponent],
  );
}

export {
  MATCH_LOBBY_PROGRESS_STEPS,
  progressSteps,
  getMatchProgress,
} from '../features/matchLobby/progress';
export type {
  MatchProgressInfo,
  MatchProgressOptions,
  MatchProgressStep,
  MatchProgressKey,
} from '../features/matchLobby/progress';
