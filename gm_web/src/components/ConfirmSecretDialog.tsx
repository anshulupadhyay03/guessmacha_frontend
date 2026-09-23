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
  if (!isOpen || !secret) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div className="w-full max-w-sm bg-[#16141a] border border-white/12 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Padlock Icon Badge */}
        <div className="size-16 rounded-full bg-[#00363e]/90 border border-[#63d6ea]/40 text-[#63d6ea] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,214,234,0.25)]">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Title */}
        <h3 id="confirm-dialog-title" className="font-lobby-display text-2xl font-bold text-white tracking-tight">
          Confirm Your Secret
        </h3>

        {/* Secret Display Box */}
        <div className="w-full bg-white/4 border border-white/10 rounded-xl py-5 px-6 my-4 flex items-center justify-center shadow-inner">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#63d6ea] tracking-wide break-words">
            {secret.name}
          </span>
        </div>

        {/* Disclaimer */}
        <p id="confirm-dialog-description" className="text-xs sm:text-sm text-[#c4c7d0] leading-relaxed mb-6 max-w-[280px]">
          Only you can see this choice. You won't be able to change it once confirmed.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-center text-xs text-[#ffd9d9]">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl border border-white/15 bg-transparent text-white font-bold hover:bg-white/8 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[#63d6ea] text-[#00363e] font-extrabold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(99,214,234,0.25)]"
          >
            {isSubmitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-[#00363e] border-t-transparent" />
                <span>Locking Secret…</span>
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

