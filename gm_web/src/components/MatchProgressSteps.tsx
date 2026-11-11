import { MATCH_LOBBY_PROGRESS_STEPS } from '../features/matchLobby/progress';

export function CheckIcon({
  muted = false,
  active = false,
}: {
  muted?: boolean;
  active?: boolean;
}) {
  if (active) {
    return (
      <span className="grid size-5 place-items-center rounded-full border-2 border-[#006875]">
        <span className="size-2 animate-pulse rounded-full bg-[#006875]" />
      </span>
    );
  }

  return (
    <svg
      className={`size-5 shrink-0 ${muted ? 'text-[#bbc9cc]' : 'text-[#0b6b45]'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  );
}

export interface MatchProgressStepsProps {
  currentIndex: number;
  steps?: readonly string[];
  className?: string;
}

export default function MatchProgressSteps({
  currentIndex,
  steps = MATCH_LOBBY_PROGRESS_STEPS,
  className = 'space-y-3 text-base',
}: MatchProgressStepsProps) {
  return (
    <div className={className}>
      {steps.map((step, index) => {
        const isCurrent = currentIndex === index;
        const isComplete = currentIndex > index;
        const isReadyStep = index === steps.length - 1;

        return (
          <div
            key={step}
            className={`flex items-center gap-3 ${
              isCurrent
                ? 'font-bold text-[#006875]'
                : isComplete
                  ? 'text-[#0b6b45]'
                  : 'text-[#6c797c]'
            }`}
          >
            {isCurrent && !isReadyStep ? (
              <CheckIcon active />
            ) : isComplete || isReadyStep ? (
              <CheckIcon />
            ) : (
              <CheckIcon muted />
            )}
            <span>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
