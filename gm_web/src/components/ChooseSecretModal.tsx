import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent, PointerEvent, ReactNode } from 'react';
import { usePuzzles } from '../hooks/usePuzzles';
import {
  loadGameLessLikelyIds,
  saveGameLessLikelyIds,
} from '../platform/storage/gameSecretsStorage';
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

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ChooseSecretModalProps {
  isOpen: boolean;
  gameId?: string;
  categoryId?: string;
  categoryName?: string;
  title?: string;
  subtitle?: string;
  confirmButtonText?: string;
  helperText?: string;
  mode?: 'choose' | 'guess';
  lessLikelyIds?: Set<string>;
  onToggleLessLikely?: (puzzleId: string) => void;
  onClose: () => void;
  onConfirmSelection: (secret: PuzzleItem) => void;
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                              */
/* -------------------------------------------------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const SWIPE_LOCK_PX = 8; // movement needed before we decide horizontal vs vertical
const SWIPE_MAX_PX = 90; // how far the row can be dragged
const SWIPE_TRIGGER_PX = 45; // drag distance that commits the action

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

function Icon({ children, className = 'size-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const CloseIcon = () => (
  <Icon>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

const SearchIcon = () => (
  <Icon className="size-5">
    <circle cx="11" cy="11" r="7.5" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);

const ArrowDownIcon = () => (
  <Icon className="size-3.5">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Icon>
);

const ArrowUpIcon = () => (
  <Icon className="size-3.5">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);

const ChevronDownIcon = ({ className = 'size-4' }: { className?: string }) => (
  <Icon className={className}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/*  Swipe-right gesture (pointer events only: covers mouse, touch and pen)     */
/* -------------------------------------------------------------------------- */

function useSwipeRight(enabled: boolean, onTrigger: () => void) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const active = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const axis = useRef<'x' | 'y' | null>(null);
  const lastDx = useRef(0);
  const didSwipe = useRef(false);

  const reset = () => {
    active.current = false;
    axis.current = null;
    lastDx.current = 0;
    setOffsetX(0);
    setIsDragging(false);
  };

  const handlers: HTMLAttributes<HTMLElement> = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      active.current = true;
      origin.current = { x: e.clientX, y: e.clientY };
      axis.current = null;
      lastDx.current = 0;
      didSwipe.current = false;
      setIsDragging(true);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!active.current) return;
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;

      if (axis.current === null) {
        if (Math.abs(dx) < SWIPE_LOCK_PX && Math.abs(dy) < SWIPE_LOCK_PX) return;
        axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        // Only capture once we know it's a horizontal swipe, so plain taps still
        // reach the <label> / <button> underneath.
        if (axis.current === 'x') e.currentTarget.setPointerCapture(e.pointerId);
      }

      if (axis.current === 'x') {
        lastDx.current = dx;
        setOffsetX(Math.max(0, Math.min(dx, SWIPE_MAX_PX)));
      }
    },
    onPointerUp: () => {
      if (!active.current) return;
      if (axis.current === 'x') {
        didSwipe.current = true;
        if (lastDx.current > SWIPE_TRIGGER_PX) onTrigger();
      }
      reset();
    },
    onPointerCancel: reset,
    // A swipe must not also count as a tap on the option underneath.
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (didSwipe.current) {
        e.preventDefault();
        e.stopPropagation();
        didSwipe.current = false;
      }
    },
  };

  return { offsetX, isDragging, handlers: enabled ? handlers : {} };
}

/* -------------------------------------------------------------------------- */
/*  Option row                                                                 */
/* -------------------------------------------------------------------------- */

interface SecretOptionProps {
  puzzle: PuzzleItem;
  groupName: string;
  isSelected: boolean;
  isLessLikely: boolean;
  swipeable: boolean;
  onSelect: (id: string) => void;
  onToggleLessLikely?: (id: string) => void;
}

function SecretOption({
  puzzle,
  groupName,
  isSelected,
  isLessLikely,
  swipeable,
  onSelect,
  onToggleLessLikely,
}: SecretOptionProps) {
  const canSwipe = swipeable && Boolean(onToggleLessLikely);
  const { offsetX, isDragging, handlers } = useSwipeRight(canSwipe, () =>
    onToggleLessLikely?.(puzzle.id),
  );

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action revealed underneath while swiping */}
      {canSwipe && (
        <div
          aria-hidden="true"
          className={cx(
            'absolute inset-0 flex items-center gap-1.5 px-4 text-xs font-semibold transition-opacity duration-150',
            offsetX > 0 ? 'opacity-100' : 'opacity-0',
            isLessLikely
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-tertiary-container/30 text-on-tertiary-container',
          )}
        >
          {isLessLikely ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {isLessLikely ? 'Move to most likely' : 'Move to less likely'}
        </div>
      )}

      <div
        {...handlers}
        style={canSwipe ? { transform: `translateX(${offsetX}px)` } : undefined}
        className={cx(
          'relative flex items-center rounded-2xl border bg-surface-container-lowest',
          'has-focus-visible:ring-2 has-focus-visible:ring-primary/40',
          canSwipe && 'touch-pan-y select-none',
          canSwipe && !isDragging && 'transition-transform duration-200 ease-out motion-reduce:transition-none',
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant hover:border-outline hover:bg-surface-container-low',
          isLessLikely && !isSelected && 'bg-surface-container-low',
        )}
      >
        {/* Native radio = free keyboard support (arrow keys) and screen-reader semantics */}
        <label className="flex min-h-14 min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3">
          <input
            type="radio"
            name={groupName}
            value={puzzle.id}
            checked={isSelected}
            onChange={() => onSelect(puzzle.id)}
            className="sr-only"
          />
          <span
            className={cx(
              'min-w-0 flex-1 truncate text-base',
              isSelected ? 'font-semibold text-on-surface' : 'font-medium text-on-surface',
            )}
          >
            {puzzle.name}
          </span>
          <span
            aria-hidden="true"
            className={cx(
              'grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors',
              isSelected ? 'border-primary bg-primary' : 'border-outline bg-surface-container-lowest',
            )}
          >
            <span
              className={cx(
                'size-2 rounded-full bg-on-primary transition-transform motion-reduce:transition-none',
                isSelected ? 'scale-100' : 'scale-0',
              )}
            />
          </span>
        </label>

        {/* Pointer/keyboard alternative to the swipe gesture */}
        {canSwipe && (
          <button
            type="button"
            onClick={() => onToggleLessLikely?.(puzzle.id)}
            aria-label={`${isLessLikely ? 'Move to most likely' : 'Move to less likely'}: ${puzzle.name}`}
            className={cx(
              'mr-2 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              isLessLikely
                ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/70'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {isLessLikely ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {isLessLikely ? 'Restore' : 'Less likely'}
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section header (guess mode)                                                */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  label,
  count,
  hint,
  tone,
  collapsible = false,
  isExpanded = true,
  onToggle,
}: {
  label: string;
  count: number;
  hint?: string;
  tone: 'primary' | 'tertiary';
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  if (collapsible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-1 py-1.5 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cx('size-2 rounded-full', tone === 'primary' ? 'bg-primary' : 'bg-tertiary')}
          />
          <h3 className="text-sm font-semibold text-on-surface">{label}</h3>
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          <ChevronDownIcon
            className={cx(
              'size-4 transition-transform duration-200 motion-reduce:transition-none',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-1 pb-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cx('size-2 rounded-full', tone === 'primary' ? 'bg-primary' : 'bg-tertiary')}
        />
        <h3 className="text-sm font-semibold text-on-surface">{label}</h3>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant">
          {count}
        </span>
      </div>
      {hint && <span className="text-xs text-on-surface-variant">{hint}</span>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal                                                                      */
/* -------------------------------------------------------------------------- */

export default function ChooseSecretModal({
  isOpen,
  gameId,
  categoryId,
  categoryName,
  title,
  subtitle,
  confirmButtonText,
  helperText,
  mode = 'choose',
  lessLikelyIds: lessLikelyIdsProp,
  onToggleLessLikely: onToggleLessLikelyProp,
  onClose,
  onConfirmSelection,
}: ChooseSecretModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const searchId = useId();
  const groupName = useId();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [isLessLikelyExpanded, setIsLessLikelyExpanded] = useState(true);
  const { category, puzzles, loading, error, reload } = usePuzzles(categoryId, gameId);

  // Fallback internal storage for lessLikelyIds if parent does not control it directly
  const [internalLessLikelyIds, setInternalLessLikelyIds] = useState<Set<string>>(() =>
    gameId ? loadGameLessLikelyIds(gameId) : new Set(),
  );

  useEffect(() => {
    if (gameId && !lessLikelyIdsProp) {
      setInternalLessLikelyIds(loadGameLessLikelyIds(gameId));
    }
  }, [gameId, lessLikelyIdsProp]);

  const activeLessLikelyIds = lessLikelyIdsProp ?? internalLessLikelyIds;

  const handleToggleLessLikely = useCallback(
    (id: string) => {
      if (onToggleLessLikelyProp) {
        onToggleLessLikelyProp(id);
      } else if (gameId) {
        setInternalLessLikelyIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          saveGameLessLikelyIds(gameId, next);
          return next;
        });
      }
      setIsLessLikelyExpanded(true);
    },
    [onToggleLessLikelyProp, gameId],
  );

  /* Native <dialog>: focus trap, Escape, inert background and top layer for free. */
  useEffect(() => {
    if (!isOpen) return;
    setIsLessLikelyExpanded(true);
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  const filteredPuzzles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return puzzles;
    return puzzles.filter((p) => p.name.toLowerCase().includes(query));
  }, [puzzles, searchQuery]);

  const { mostLikelyPuzzles, lessLikelyPuzzles } = useMemo(() => {
    if (mode !== 'guess') {
      return { mostLikelyPuzzles: filteredPuzzles, lessLikelyPuzzles: [] as PuzzleItem[] };
    }
    const most: PuzzleItem[] = [];
    const less: PuzzleItem[] = [];
    filteredPuzzles.forEach((p) => (activeLessLikelyIds?.has(p.id) ? less : most).push(p));
    return { mostLikelyPuzzles: most, lessLikelyPuzzles: less };
  }, [filteredPuzzles, activeLessLikelyIds, mode]);

  const selectedPuzzle = useMemo(
    () => puzzles.find((p) => p.id === selectedPuzzleId) ?? null,
    [puzzles, selectedPuzzleId],
  );

  if (!isOpen) {
    return null;
  }

  const effectiveCategoryName = category?.name || categoryName || 'Category';
  const isGuess = mode === 'guess';
  const hasQuery = searchQuery.trim().length > 0;

  const renderOption = (puzzle: PuzzleItem, isLessLikely: boolean) => (
    <SecretOption
      key={puzzle.id}
      puzzle={puzzle}
      groupName={groupName}
      isSelected={puzzle.id === selectedPuzzleId}
      isLessLikely={isLessLikely}
      swipeable={isGuess}
      onSelect={setSelectedPuzzleId}
      onToggleLessLikely={handleToggleLessLikely}
    />
  );

  function handleConfirm() {
    if (selectedPuzzle) {
      onConfirmSelection(selectedPuzzle);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Escape: let the parent decide, don't close natively.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Click on the backdrop (the dialog element itself) closes.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cx(
        'm-0 mt-auto w-full max-w-lg overflow-hidden p-0 open:flex open:flex-col sm:m-auto',
        'max-h-[90dvh] rounded-t-3xl border border-outline-variant bg-surface-container-lowest text-on-surface shadow-2xl sm:rounded-3xl',
        'backdrop:bg-on-surface/40 backdrop:backdrop-blur-[2px]',
        'animate-in fade-in slide-in-from-bottom duration-200 motion-reduce:animate-none',
      )}
    >
      {/* Header */}
      <header className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div className="min-w-0">
          <h2 id={titleId} className="font-lobby-display text-2xl font-bold tracking-tight text-on-surface">
            {title ?? 'Choose Secret'}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {subtitle ?? 'Select an item for your opponent to deduce'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CloseIcon />
        </button>
      </header>

      {/* Toolbar: stays visible while the list scrolls */}
      <div className="shrink-0 space-y-3 px-5 pb-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold tracking-wider text-on-surface-variant uppercase">
              Category
            </p>
            <p className="truncate text-base font-semibold text-on-surface">{effectiveCategoryName}</p>
          </div>
          <span className="shrink-0 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
            {puzzles.length} available
          </span>
        </div>

        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Search {effectiveCategoryName}
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-on-surface-variant">
            <SearchIcon />
          </span>
          <input
            id={searchId}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${effectiveCategoryName.toLowerCase()}…`}
            // text-base (16px) prevents iOS Safari from zooming the page on focus
            className="h-11 w-full rounded-xl border border-transparent bg-surface-container-low pr-10 pl-11 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-1.5 my-auto grid size-8 cursor-pointer place-items-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <Icon className="size-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </Icon>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
        {loading && (
          <div role="status" aria-busy="true" className="space-y-2">
            <span className="sr-only">Loading secrets…</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-container-low" />
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-error/20 bg-error-container p-4 text-center text-on-error-container"
          >
            <p className="text-sm">{error.message}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-2 cursor-pointer text-sm font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredPuzzles.length === 0 && (
          <p role="status" className="py-12 text-center text-sm text-on-surface-variant">
            {hasQuery ? <>No results for “{searchQuery.trim()}”</> : 'Nothing to choose from yet.'}
          </p>
        )}

        {!loading && !error && filteredPuzzles.length > 0 && (
          <div role="radiogroup" aria-labelledby={titleId} className="space-y-5">
            {isGuess ? (
              <>
                <section className="space-y-2">
                  <SectionHeader
                    label="Most likely"
                    count={mostLikelyPuzzles.length}
                    hint="Swipe right to demote"
                    tone="primary"
                  />
                  {mostLikelyPuzzles.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-5 text-center text-sm text-on-surface-variant">
                      Everything is marked less likely. Swipe right on an item below to restore it.
                    </p>
                  ) : (
                    mostLikelyPuzzles.map((p) => renderOption(p, false))
                  )}
                </section>

                {lessLikelyPuzzles.length > 0 && (
                  <section className="space-y-2">
                    <SectionHeader
                      label="Less likely"
                      count={lessLikelyPuzzles.length}
                      tone="tertiary"
                      collapsible
                      isExpanded={isLessLikelyExpanded}
                      onToggle={() => setIsLessLikelyExpanded((prev) => !prev)}
                    />
                    {isLessLikelyExpanded && (
                      <div className="space-y-2">
                        <div className="px-1 text-right text-xs text-on-surface-variant">
                          Swipe right to restore
                        </div>
                        {lessLikelyPuzzles.map((p) => renderOption(p, true))}
                      </div>
                    )}
                  </section>
                )}
              </>
            ) : (
              <div className="space-y-2">{filteredPuzzles.map((p) => renderOption(p, false))}</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-outline-variant bg-surface-container-lowest px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <p aria-live="polite" className="mb-3 truncate text-sm text-on-surface-variant">
          {selectedPuzzle ? (
            <>
              Selected: <span className="font-semibold text-on-surface">{selectedPuzzle.name}</span>
            </>
          ) : (
            'Select one to continue'
          )}
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedPuzzle || loading}
          className="h-12 w-full cursor-pointer rounded-xl bg-primary text-base font-semibold text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-on-surface/12 disabled:text-on-surface/38"
        >
          {confirmButtonText ?? 'Confirm Secret'}
        </button>
        <p className="mt-2.5 text-center text-xs text-on-surface-variant">
          {helperText ?? 'You cannot change your secret once confirmed.'}
        </p>
      </footer>
    </dialog>
  );
}
