import { useMemo, useState } from 'react';
import { usePuzzles } from '../hooks/usePuzzles';
import type { PuzzleItem } from '../platform/api/gameApi';

interface ChooseSecretModalProps {
  isOpen: boolean;
  categoryId?: string;
  categoryName?: string;
  onClose: () => void;
  onConfirmSelection: (secret: PuzzleItem) => void;
}

export default function ChooseSecretModal({
  isOpen,
  categoryId,
  categoryName,
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="choose-secret-title"
    >
      <div className="w-full max-w-lg bg-[#141218] border border-white/12 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#f4f1f7] shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Drag handle pill on mobile */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-2">
          <div>
            <h2 id="choose-secret-title" className="font-lobby-display text-2xl font-bold text-white">
              Choose Secret
            </h2>
            <p className="text-sm text-[#c4c7d0] mt-0.5">
              Select an item for your opponent to deduce
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full bg-white/6 border border-white/12 text-[#c2c6d6] hover:bg-white/10 hover:text-white flex items-center justify-center transition cursor-pointer"
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
          <div className="bg-white/4 border border-white/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#00363e]/80 border border-[#63d6ea]/40 text-[#63d6ea] flex items-center justify-center text-lg">
                🌍
              </div>
              <div>
                <span className="block text-[11px] font-bold tracking-wider uppercase text-[#63d6ea]">
                  CATEGORY
                </span>
                <strong className="text-base font-bold text-white">
                  {effectiveCategoryName}
                </strong>
              </div>
            </div>

            <span className="px-3 py-1 bg-white/6 border border-white/10 rounded-full text-xs font-semibold text-[#c4c7d0]">
              {puzzles.length} available
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9db7d8]">
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
              className="w-full bg-white/4 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#9ea8b8] focus:outline-none focus:border-[#63d6ea] transition"
            />
          </div>

          {/* Puzzle List State Messages */}
          {loading && (
            <div className="py-12 text-center text-[#c4c7d0]">
              <div className="inline-block size-6 animate-spin rounded-full border-2 border-[#63d6ea] border-t-transparent mb-2" />
              <p className="text-sm">Loading secrets…</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-center text-[#ffd9d9]">
              <p className="text-sm">{error.message}</p>
              <button
                type="button"
                onClick={() => void reload()}
                className="mt-2 text-xs font-bold text-[#63d6ea] underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredPuzzles.length === 0 && (
            <div className="py-10 text-center text-[#9ea8b8]">
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
                        ? 'bg-[#13282c] border-2 border-[#63d6ea] text-[#63d6ea] font-bold shadow-[0_0_12px_rgba(99,214,234,0.15)]'
                        : 'bg-white/4 border-white/8 text-[#f4f1f7] hover:border-white/20 hover:bg-white/6'
                    }`}
                  >
                    <span className="text-base truncate">{puzzle.name}</span>
                    <span className="shrink-0 ml-3 flex items-center justify-center size-5">
                      {isSelected ? (
                        <span className="size-5 rounded-full border-2 border-[#63d6ea] bg-[#63d6ea]/15 flex items-center justify-center">
                          <span className="size-2 rounded-full bg-[#63d6ea] block" />
                        </span>
                      ) : (
                        <span className="size-5 rounded-full border-2 border-white/35 bg-white/5 block" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 pt-3 pb-6 border-t border-white/10 bg-[#141218]">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPuzzle || loading}
            className="w-full h-13 rounded-xl bg-[#63d6ea] text-[#00363e] font-extrabold text-base sm:text-lg transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_16px_rgba(99,214,234,0.2)]"
          >
            Confirm Secret
          </button>
          <p className="text-xs text-[#c4c7d0] text-center mt-2.5">
            You cannot change your secret once confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}

