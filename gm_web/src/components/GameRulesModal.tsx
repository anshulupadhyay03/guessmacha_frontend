import { useEffect } from 'react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameRulesModal({ isOpen, onClose }: GameRulesModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-rules-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#bbc9cc] bg-[#f5fafc] text-[#171d1e] shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[#bbc9cc]/60 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
          <div className="min-w-0 pr-3">
            <h2
              id="game-rules-title"
              className="font-lobby-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#171d1e]"
            >
              Game Rules
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#36656e] tracking-tight">
              Everything you need to know to win!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#6c797c] transition hover:bg-[#eff4f7] hover:text-[#171d1e] active:scale-95"
            aria-label="Close game rules"
            title="Close"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content (6 Sections) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Section 1: Objective of the Game */}
          <section className="rounded-2xl border border-[#bbc9cc]/60 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">🎯</span>
              <h3 className="font-lobby-display text-base sm:text-lg font-bold text-[#171d1e]">
                1. Objective of the Game
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#006875] mb-2.5">
              Identify your opponent’s secret before they identify yours.
            </p>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#3c494c] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Each player selects a secret from the chosen category.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Your secret remains completely hidden from your opponent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Use strategic questions and the answers you receive to narrow down the possibilities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>The first player to correctly identify their opponent’s secret gets the advantage!</span>
              </li>
            </ul>
          </section>

          {/* Section 2: Asking Questions */}
          <section className="rounded-2xl border border-[#bbc9cc]/60 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">❓</span>
              <h3 className="font-lobby-display text-base sm:text-lg font-bold text-[#171d1e]">
                2. Asking Questions
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#006875] mb-2.5">
              Players take turns asking questions to uncover their opponent’s secret.
            </p>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#3c494c] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>The host gets the first opportunity to ask a question.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>All questions must be answerable with a simple <strong>YES</strong> or <strong>NO</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Your opponent must answer honestly using the Yes or No buttons.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Once a question is answered, the turn passes to the other player.</span>
              </li>
            </ul>
            <div className="mt-3 rounded-xl border border-[#006875]/20 bg-[#eff4f7] p-2.5 text-xs font-semibold text-[#006875]">
              💡 Remember: Ask strategic questions that help eliminate multiple possibilities at once!
            </div>
          </section>

          {/* Section 3: Narrow Down the Possibilities */}
          <section className="rounded-2xl border border-[#bbc9cc]/60 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">🔍</span>
              <h3 className="font-lobby-display text-base sm:text-lg font-bold text-[#171d1e]">
                3. Narrow Down the Possibilities
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#006875] mb-2.5">
              Use the information you gather to identify your opponent’s secret.
            </p>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#3c494c] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Review the answers received from your opponent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Use the <strong>Guess Secret</strong> feature to view all available possibilities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Select the <strong>Less Likely</strong> option to eliminate secrets you believe are ruled out.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>You can attempt a guess whenever you feel confident!</span>
              </li>
            </ul>
            <div className="mt-3 rounded-xl border border-[#d97706]/25 bg-[#ffdcc2]/30 p-2.5 text-xs font-semibold text-[#904d00]">
              💡 Tip: Don’t rush! Every answer provides a crucial clue.
            </div>
          </section>

          {/* Section 4: Guessing the Secret */}
          <section className="rounded-2xl border border-[#bbc9cc]/60 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">🏆</span>
              <h3 className="font-lobby-display text-base sm:text-lg font-bold text-[#171d1e]">
                4. Guessing the Secret
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#006875] mb-2">
              Think you’ve figured out your opponent’s secret?
            </p>
            <p className="text-xs sm:text-[13px] text-[#3c494c] leading-relaxed mb-3">
              Tap <strong>Guess Secret</strong>, select the puzzle you believe is correct, and confirm your selection.
            </p>

            {/* If Correct vs If Incorrect Sub-cards */}
            <div className="space-y-2.5">
              {/* Correct */}
              <div className="rounded-xl border border-[#0b6b45]/30 bg-[#e6f4ea] p-3 text-xs sm:text-[13px] text-[#0d532d]">
                <div className="font-bold flex items-center gap-1.5 text-[#0b6b45] mb-1">
                  <span>✅</span>
                  <span>If your guess is correct:</span>
                </div>
                <ul className="space-y-1 pl-4 list-disc">
                  <li>Your opponent gets one final opportunity to guess your secret.</li>
                  <li>If your opponent guesses correctly, the match ends in a <strong>DRAW</strong>.</li>
                  <li>If your opponent guesses incorrectly, <strong>YOU WIN!</strong></li>
                </ul>
              </div>

              {/* Incorrect */}
              <div className="rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-3 text-xs sm:text-[13px] text-[#781212]">
                <div className="font-bold flex items-center gap-1.5 text-[#ba1a1a] mb-1">
                  <span>❌</span>
                  <span>If your guess is incorrect:</span>
                </div>
                <ul className="space-y-1 pl-4 list-disc">
                  <li>Your opponent receives <strong>two consecutive questions</strong>.</li>
                  <li>You must answer both questions before normal turn-taking resumes.</li>
                </ul>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#ba1a1a]/25 bg-[#ffdad6]/30 p-2.5 text-xs font-semibold text-[#93000a]">
              ⚠️ Remember: An incorrect guess gives your opponent a significant advantage!
            </div>
          </section>

          {/* Section 5: Question Limits */}
          <section className="rounded-2xl border border-[#bbc9cc]/60 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">⏳</span>
              <h3 className="font-lobby-display text-base sm:text-lg font-bold text-[#171d1e]">
                5. Question Limits
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#006875] mb-2.5">
              Every match has a predefined question limit selected by the host.
            </p>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#3c494c] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>You can see your remaining questions in the player information section at the top of the Game Zone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Each player can ask questions up to their allocated limit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>Once both players exhaust their question limits, each gets one final opportunity to guess their opponent’s secret.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006875] mt-1">•</span>
                <span>No additional questions can be asked after the limit is exhausted.</span>
              </li>
            </ul>
            <div className="mt-3 rounded-xl border border-[#006875]/20 bg-[#eff4f7] p-2.5 text-xs font-semibold text-[#006875]">
              ⏳ Use your questions wisely!
            </div>
          </section>

          {/* Section 6: Winning the Match */}
          <section className="rounded-2xl border border-[#bbc9cc]/60 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">🥇</span>
              <h3 className="font-lobby-display text-base sm:text-lg font-bold text-[#171d1e]">
                6. Winning the Match
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#006875] mb-3">
              The match outcome depends on how accurately you identify your opponent’s secret.
            </p>

            <div className="space-y-2">
              {/* Outcome 1: Victory */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#0b6b45]/25 bg-[#e6f4ea] p-3 text-xs sm:text-sm">
                <span className="font-medium text-[#171d1e]">
                  You guess correctly & opponent guesses incorrectly
                </span>
                <span className="shrink-0 rounded-full bg-[#0b6b45] px-2.5 py-0.5 text-xs font-extrabold text-white">
                  You Win
                </span>
              </div>

              {/* Outcome 2: Draw (both correct) */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#bbc9cc]/60 bg-[#eff4f7] p-3 text-xs sm:text-sm">
                <span className="font-medium text-[#171d1e]">
                  Both players correctly guess each other’s secrets
                </span>
                <span className="shrink-0 rounded-full bg-[#36656e] px-2.5 py-0.5 text-xs font-extrabold text-white">
                  Draw
                </span>
              </div>

              {/* Outcome 3: Draw (both exhausted) */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#bbc9cc]/60 bg-[#eff4f7] p-3 text-xs sm:text-sm">
                <span className="font-medium text-[#171d1e]">
                  Both players exhaust questions and neither guesses correctly
                </span>
                <span className="shrink-0 rounded-full bg-[#36656e] px-2.5 py-0.5 text-xs font-extrabold text-white">
                  Draw
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-[#bbc9cc]/60 bg-white/95 px-5 py-3.5 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#006875] text-sm font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(0,104,117,0.25)] transition hover:bg-[#005560] active:scale-[0.98]"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
