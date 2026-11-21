import { useState } from 'react';

export const TUTORIAL_SEEN_KEY = 'siftmates_how_to_play_prompt_dismissed';

interface FirstTimeTutorialPromptProps {
  onOpenTutorial: () => void;
}

export default function FirstTimeTutorialPrompt({
  onOpenTutorial,
}: FirstTimeTutorialPromptProps) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return !window.localStorage.getItem(TUTORIAL_SEEN_KEY);
    } catch {
      return false;
    }
  });

  function markDismissed() {
    try {
      window.localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setIsOpen(false);
  }

  function handleLearn() {
    markDismissed();
    onOpenTutorial();
  }

  function handleDismiss() {
    markDismissed();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-tutorial-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-[#bbc9cc] bg-white p-6 sm:p-7 text-center shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Play Icon Badge */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#02c2d9]/15 border border-[#006875]/20 text-[#006875] shadow-xs">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>

        {/* Eyebrow */}
        <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#006875]">
          New to Sift Mates?
        </span>

        {/* Title */}
        <h3
          id="first-time-tutorial-title"
          className="font-lobby-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#171d1e] mt-1 mb-2.5"
        >
          Master the Game
        </h3>

        {/* Description matching wireframe */}
        <p className="text-sm font-medium text-[#3c494c] leading-relaxed mb-6">
          Learn how to play this exciting guessing game before challenging friends!
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLearn}
            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#006875] text-sm font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(0,104,117,0.25)] transition hover:bg-[#005560] active:scale-[0.98]"
          >
            Learn How to Play
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-9 w-full cursor-pointer items-center justify-center rounded-lg text-xs font-bold text-[#6c797c] transition hover:text-[#171d1e] active:scale-95"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
