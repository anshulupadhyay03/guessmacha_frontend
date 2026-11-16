/**
 * Match progress steps and state calculation logic.
 * Extracted so it can be shared across MatchLobbyScreen, MatchesScreen, and other screens.
 */

export const MATCH_LOBBY_PROGRESS_STEPS = [
  'Waiting for Friend',
  'Choose Your Secret',
  'Opponent choosing secret',
  'Ready to Begin',
] as const;

export type MatchProgressStep = (typeof MATCH_LOBBY_PROGRESS_STEPS)[number];

/** Alias for backward compatibility */
export const progressSteps = MATCH_LOBBY_PROGRESS_STEPS;

export type MatchProgressKey =
  | 'waiting'
  | 'host_secret_selection'
  | 'opponent_secret_selection'
  | 'waiting_for_other_secret'
  | 'ready';

export interface MatchProgressOptions {
  status?: string;
  mySecretLocked?: boolean;
  isOpponent?: boolean;
}

export interface MatchProgressInfo {
  index: number;
  key: MatchProgressKey;
  label: string;
  buttonLabel: 'Choose Secret' | 'Start Game';
  buttonDisabled: boolean;
  steps: typeof MATCH_LOBBY_PROGRESS_STEPS;
  currentStepLabel: MatchProgressStep;
  isComplete: (stepIndex: number) => boolean;
  isCurrent: (stepIndex: number) => boolean;
}

/**
 * Calculates current match progress step index, status keys, and action labels
 * based on match status and whether the current player has locked their secret.
 */
export function getMatchProgress({
  status,
  mySecretLocked = false,
  isOpponent = false,
}: MatchProgressOptions): MatchProgressInfo {
  let index = 0;
  let key: MatchProgressKey = 'waiting';
  let label = 'Waiting for player';
  let buttonLabel: 'Choose Secret' | 'Start Game' = 'Start Game';
  let buttonDisabled = true;

  if (status === 'waiting') {
    index = 0;
    key = 'waiting';
    label = 'Waiting for player';
    buttonLabel = 'Choose Secret';
    buttonDisabled = true;
  } else if (status === 'secret_selection') {
    if (!mySecretLocked) {
      index = 1;
      key = isOpponent ? 'opponent_secret_selection' : 'host_secret_selection';
      label = isOpponent ? 'Your Secret Selection' : 'Host Secret Selection';
      buttonLabel = 'Choose Secret';
      buttonDisabled = false;
    } else {
      index = 2;
      key = 'waiting_for_other_secret';
      label = 'Waiting for opponent';
      buttonLabel = 'Start Game';
      buttonDisabled = true;
    }
  } else if (status === 'in_progress') {
    index = 3;
    key = 'ready';
    label = 'Ready to Begin';
    buttonLabel = 'Start Game';
    buttonDisabled = false;
  }

  return {
    index,
    key,
    label,
    buttonLabel,
    buttonDisabled,
    steps: MATCH_LOBBY_PROGRESS_STEPS,
    currentStepLabel: MATCH_LOBBY_PROGRESS_STEPS[index] ?? MATCH_LOBBY_PROGRESS_STEPS[0],
    isComplete: (stepIndex: number) => index > stepIndex,
    isCurrent: (stepIndex: number) => index === stepIndex,
  };
}
