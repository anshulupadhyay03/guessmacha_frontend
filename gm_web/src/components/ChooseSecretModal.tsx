import { useMemo, useState } from 'react';
import { usePuzzles } from '../hooks/usePuzzles';
import type {
  PuzzleItem,
  CategoryDetails,
  GetPuzzlesRequest,
  GetPuzzlesResponse,
  SubmitSecretRequest,
  SubmitSecretResult,
  SubmitSecretResponse,
} from '../features/chooseSecret/types';

export type {
  PuzzleItem,
  CategoryDetails,
  GetPuzzlesRequest,
  GetPuzzlesResponse,
  SubmitSecretRequest,
  SubmitSecretResult,
  SubmitSecretResponse,
};

interface ChooseSecretModalProps {
  isOpen: boolean;
  categoryId?: string;
  categoryName?: string;
  title?: string;
  subtitle?: string;
  confirmButtonText?: string;
  helperText?: string;
  onClose: () => void;
  onConfirmSelection: (secret: PuzzleItem) => void;
}

export default function ChooseSecretModal({
  isOpen,
  categoryId,
  categoryName,
  title,
  subtitle,
  confirmButtonText,
  helperText,
  onClose,
  onConfirmSelection,
}: ChooseSecretModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const { category, puzzles, loading, error, reload } = usePuzzles(categoryId);

  const filteredPuzzles = useMemo(() => {
    if (!searchQuery.trim()) {
      return puzzles;
    }
    const query = searchQuery.toLowerCase();
    return puzzles.filter((p) => p.name.toLowerCase().includes(query));
  }, [puzzles, searchQuery]);

  const selectedPuzzle = useMemo(() => {
    return puzzles.find((p) => p.id === selectedPuzzleId) ?? null;
  }, [puzzles, selectedPuzzleId]);

  if (!isOpen) {
    return null;
  }

  const effectiveCategoryName = category?.name || categoryName || 'Category';

  function handleConfirm() {
    if (selectedPuzzle) {
      onConfirmSelection(selectedPuzzle);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="choose-secret-title"
    >
      <div className="w-full max-w-lg bg-white border border-[#bbc9cc] rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#171d1e] shadow-xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Drag handle pill on mobile */}
        <div className="w-12 h-1 bg-[#bbc9cc] rounded-full mx-auto mt-2.5 mb-1.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-2">
          <div>
            <h2 id="choose-secret-title" className="font-lobby-display text-2xl font-bold text-[#171d1e]">
              {title ?? 'Choose Secret'}
            </h2>
            <p className="text-sm text-[#3c494c] mt-0.5">
              {subtitle ?? 'Select an item for your opponent to deduce'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full bg-[#eff4f7] border border-[#bbc9cc] text-[#171d1e] hover:bg-[#e9eff1] flex items-center justify-center transition cursor-pointer"
            aria-label="Close choose secret modal"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
          {/* Category Info Card */}
          <div className="bg-[#eff4f7] border border-[#bbc9cc] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#02c2d9]/15 border border-[#006875]/30 text-[#006875] flex items-center justify-center text-lg">
                🌍
              </div>
              <div>
                <span className="block text-[11px] font-bold tracking-wider uppercase text-[#006875]">
                  CATEGORY
                </span>
                <strong className="text-base font-bold text-[#171d1e]">
                  {effectiveCategoryName}
                </strong>
              </div>
            </div>

            <span className="px-3 py-1 bg-white border border-[#bbc9cc] rounded-full text-xs font-semibold text-[#3c494c]">
              {puzzles.length} available
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6c797c]">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${effectiveCategoryName.toLowerCase()} or clues...`}
              className="w-full bg-white border border-[#bbc9cc] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171d1e] placeholder-[#6c797c] focus:outline-none focus:border-[#006875] transition"
            />
          </div>

          {/* Puzzle List State Messages */}
          {loading && (
            <div className="py-12 text-center text-[#3c494c]">
              <div className="inline-block size-6 animate-spin rounded-full border-2 border-[#006875] border-t-transparent mb-2" />
              <p className="text-sm">Loading secrets…</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl text-center text-[#93000a]">
              <p className="text-sm">{error.message}</p>
              <button
                type="button"
                onClick={() => void reload()}
                className="mt-2 text-xs font-bold text-[#006875] underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredPuzzles.length === 0 && (
            <div className="py-10 text-center text-[#6c797c]">
              <p className="text-sm">No items found matching "{searchQuery}"</p>
            </div>
          )}

          {/* Puzzle Items List */}
          {!loading && !error && filteredPuzzles.length > 0 && (
            <div className="space-y-2">
              {filteredPuzzles.map((puzzle) => {
                const isSelected = puzzle.id === selectedPuzzleId;
                return (
                  <button
                    key={puzzle.id}
                    type="button"
                    onClick={() => setSelectedPuzzleId(puzzle.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#eff4f7] border-2 border-[#006875] text-[#006875] font-bold shadow-[0_0_12px_rgba(0,104,117,0.15)]'
                        : 'bg-white border-[#bbc9cc] text-[#171d1e] hover:border-[#006875]/50 hover:bg-[#eff4f7]'
                    }`}
                  >
                    <span className="text-base truncate">{puzzle.name}</span>
                    <span className="shrink-0 ml-3 flex items-center justify-center size-5">
                      {isSelected ? (
                        <span className="size-5 rounded-full border-2 border-[#006875] bg-[#02c2d9]/15 flex items-center justify-center">
                          <span className="size-2 rounded-full bg-[#006875] block" />
                        </span>
                      ) : (
                        <span className="size-5 rounded-full border-2 border-[#bbc9cc] bg-white block" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 pt-3 pb-6 border-t border-[#bbc9cc] bg-white">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPuzzle || loading}
            className="w-full h-13 rounded-xl bg-[#006875] text-white font-extrabold text-base sm:text-lg transition hover:bg-[#005a66] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_14px_rgba(0,104,117,0.2)]"
          >
            {confirmButtonText ?? 'Confirm Secret'}
          </button>
          <p className="text-xs text-[#6c797c] text-center mt-2.5">
            {helperText ?? 'You cannot change your secret once confirmed.'}
          </p>
        </div>
      </div>
    </div>
  );
}

