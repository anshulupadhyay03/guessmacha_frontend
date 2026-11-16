import type { DashboardActiveMatch } from './types';

export interface ActiveMatchPresentation {
  title: string;
  titleClassName: string;
  isAction: boolean;
}

/**
 * Strategy registry (Open/Closed Principle): each game status resolves
 * to its own presentation strategy. Adding a new status means adding one
 * registry entry — existing strategies stay untouched.
 */
export type ActiveMatchPresentationStrategy = (
  match: DashboardActiveMatch,
) => ActiveMatchPresentation;

const WAITING_STRATEGY: ActiveMatchPresentationStrategy = () => ({
  title: 'Waiting for Player',
  titleClassName: 'text-[#171d1e]',
  isAction: false,
});

const SECRET_SELECTION_STRATEGY: ActiveMatchPresentationStrategy = (match) =>
  match.isMyTurn
    ? {
        title: 'Choose Secret',
        titleClassName: 'text-[#006875]',
        isAction: true,
      }
    : {
        title: 'Waiting for Opponent',
        titleClassName: 'text-[#171d1e]',
        isAction: false,
      };

const IN_PROGRESS_STRATEGY: ActiveMatchPresentationStrategy = (match) =>
  match.isMyTurn
    ? {
        title: 'Match In Progress',
        titleClassName: 'text-[#006875]',
        isAction: true,
      }
    : {
        title: 'Match In Progress',
        titleClassName: 'text-[#171d1e]',
        isAction: false,
      };

const DEFAULT_STRATEGY: ActiveMatchPresentationStrategy = (match) => ({
  title: 'Active Match',
  titleClassName: 'text-[#171d1e]',
  isAction: match.isMyTurn,
});

export const activeMatchPresentationRegistry: Record<
  string,
  ActiveMatchPresentationStrategy
> = {
  waiting: WAITING_STRATEGY,
  secret_selection: SECRET_SELECTION_STRATEGY,
  in_progress: IN_PROGRESS_STRATEGY,
};

export function getActiveMatchPresentation(
  match: DashboardActiveMatch,
): ActiveMatchPresentation {
  const strategy =
    activeMatchPresentationRegistry[match.status] ?? DEFAULT_STRATEGY;
  return strategy(match);
}
