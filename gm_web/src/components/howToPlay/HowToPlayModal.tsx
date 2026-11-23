import { useCallback, useEffect, useState } from 'react';
import { HOW_TO_PLAY_STEPS } from './howToPlaySteps';
import {
  CloseIcon,
  LightbulbIcon,
} from './HowToPlayIcons';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export default function HowToPlayModal({
  isOpen,
  onClose,
  initialStep = 1,
}: HowToPlayModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(() =>
    Math.max(0, Math.min(initialStep - 1, HOW_TO_PLAY_STEPS.length - 1)),
  );

  const handleClose = useCallback(() => {
    setCurrentStepIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentStepIndex((prev) =>
          prev < HOW_TO_PLAY_STEPS.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) {
    return null;
  }

  const step = HOW_TO_PLAY_STEPS[currentStepIndex];
  const totalSteps = HOW_TO_PLAY_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  function handleNext() {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#bbc9cc] bg-[#f5fafc] text-[#171d1e] shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="relative flex shrink-0 flex-col items-center border-b border-[#bbc9cc]/50 bg-white px-5 pt-4 pb-3 text-center sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 grid size-8 cursor-pointer place-items-center rounded-full text-[#6c797c] transition hover:bg-[#eff4f7] hover:text-[#171d1e] active:scale-95"
            aria-label="Close tutorial"
            title="Close"
          >
            <CloseIcon className="size-4" />
          </button>

          {/* SIFT MATES Eyebrow */}
          <span className="inline-block rounded-full bg-[#006875]/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.14em] text-[#006875] uppercase">
            Sift Mates
          </span>

          <h2
            id="how-to-play-title"
            className="font-lobby-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#171d1e] mt-1"
          >
            How to Play
          </h2>

          <p className="text-xs font-semibold text-[#36656e] tracking-tight">
            Think Smart • Ask Wisely • Guess Right
          </p>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {/* Step Pill & Step Number */}
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold tracking-wider text-[#006875] shadow-2xs border border-[#bbc9cc]/60">
              STEP {step.step} OF {totalSteps}
            </span>
            <span className="text-xs font-semibold text-[#6c797c]">
              {step.tagline}
            </span>
          </div>

          {/* Step Title & Subtitle */}
          <div className="mb-4">
            <h3 className="font-lobby-display text-lg sm:text-xl font-extrabold text-[#171d1e] tracking-tight">
              {step.title}
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-[#3c494c]">
              {step.subtitle}
            </p>
          </div>

          {/* Bulleted Points / Rules */}
          <div className="space-y-2.5 mb-4">
            {step.points.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-[#bbc9cc]/40 bg-white p-3 shadow-2xs text-left"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#02c2d9]/20 text-[11px] font-bold text-[#006875]">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {pt.title && (
                    <strong className="block text-xs font-bold text-[#171d1e] mb-0.5">
                      {pt.title}
                    </strong>
                  )}
                  <p className="text-xs sm:text-[13px] text-[#3c494c] leading-relaxed">
                    {pt.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          {step.proTip && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#d97706]/30 bg-[#ffdcc2]/30 p-3 text-left">
              <span className="mt-0.5 shrink-0 text-[#d97706]" aria-hidden="true">
                <LightbulbIcon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#904d00]">
                  Pro Tip
                </span>
                <p className="text-xs sm:text-[12.5px] font-medium text-[#683600] leading-snug mt-0.5">
                  {step.proTip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="shrink-0 border-t border-[#bbc9cc]/50 bg-white px-5 pt-3 pb-3.5 sm:px-6">
          {/* Step Indicator (1 / 8 & Progress Dots) */}
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#3c494c]">
              {step.step} / {totalSteps}
            </span>

            {/* Clickable Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Tutorial steps">
              {HOW_TO_PLAY_STEPS.map((_, index) => {
                const isActive = index === currentStepIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentStepIndex(index)}
                    aria-label={`Go to step ${index + 1}`}
                    aria-selected={isActive}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'w-6 bg-[#006875]'
                        : 'w-2 bg-[#dee3e5] hover:bg-[#bbc9cc]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#bbc9cc] bg-[#eff4f7] text-xs sm:text-sm font-bold text-[#171d1e] shadow-2xs transition hover:bg-[#e9eff1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#eff4f7]"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-[#006875] text-xs sm:text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,104,117,0.25)] transition hover:bg-[#005560] active:scale-[0.98]"
            >
              {isLastStep ? 'Ready to Play!' : 'Next'}
            </button>
          </div>

          {/* Skip Link */}
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer text-xs font-semibold text-[#6c797c] transition hover:text-[#171d1e] hover:underline"
            >
              {isLastStep ? 'Close Guide' : 'Skip Tutorial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
