import { useEffect, useRef } from 'react';
import type { PuzzleItem } from '../features/chooseSecret/types';

interface ConfirmSecretDialogProps {
  isOpen: boolean;
  secret: PuzzleItem | null;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmSecretDialog({
  isOpen,
  secret,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: ConfirmSecretDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen || !secret) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
      previouslyFocused?.focus?.();
    };
  }, [isOpen, secret]);

  if (!isOpen || !secret) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(e) => {
        e.preventDefault();
        if (!isSubmitting) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm overflow-hidden p-0 rounded-2xl border border-[#bbc9cc] bg-white text-[#171d1e] shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-xs open:flex open:flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="w-full p-6 flex flex-col items-center text-center">
        {/* Padlock Icon Badge */}
        <div className="size-16 rounded-full bg-[#02c2d9]/15 border border-[#006875]/30 text-[#006875] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,104,117,0.15)]">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Title */}
        <h3 id="confirm-dialog-title" className="font-lobby-display text-2xl font-bold text-[#171d1e] tracking-tight">
          Confirm Your Secret
        </h3>

        {/* Secret Display Box */}
        <div className="w-full bg-[#eff4f7] border border-[#bbc9cc] rounded-xl py-5 px-6 my-4 flex items-center justify-center shadow-inner">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#006875] tracking-wide break-words">
            {secret.name}
          </span>
        </div>

        {/* Disclaimer */}
        <p id="confirm-dialog-description" className="text-xs sm:text-sm text-[#3c494c] leading-relaxed mb-6 max-w-70">
          Only you can see this choice. You won't be able to change it once confirmed.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl text-center text-xs text-[#93000a]">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl border border-[#bbc9cc] bg-[#eff4f7] text-[#171d1e] font-bold hover:bg-[#e9eff1] transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[#006875] text-white font-extrabold hover:bg-[#005a66] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(0,104,117,0.2)]"
          >
            {isSubmitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Locking Secret…</span>
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}

