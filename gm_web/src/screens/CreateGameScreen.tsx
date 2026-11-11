import { useState } from 'react';
import CategoryIcon from '../components/CategoryIcon';
import type { CreateGameResponse } from '../features/dashboard/types';
import { useCategories } from '../hooks/useCategories';
import { useCreateGame } from '../hooks/useCreateGame';

interface CreateGameScreenProps {
  onBack: () => void;
  onGameCreated: (game: CreateGameResponse) => void;
}

const questionLimitOptions = [5, 7, 10, 12, 15];

export default function CreateGameScreen({
  onBack,
  onGameCreated,
}: CreateGameScreenProps) {
  const { categories, error, loading, reload } = useCategories();
  const { createGame, error: createError, loading: creating } = useCreateGame();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [questionLimit, setQuestionLimit] = useState(10);

  // Default to Countries (or first available category) if not yet explicitly selected
  const effectiveCategoryId =
    selectedCategoryId ??
    (categories.length > 0
      ? (categories.find((c) => c.name.toLowerCase() === 'countries') ?? categories[0]).id
      : null);

  async function handleConfirm() {
    if (!effectiveCategoryId || creating) {
      return;
    }

    const game = await createGame(effectiveCategoryId, questionLimit);

    if (game) {
      onGameCreated(game);
    }
  }

  return (
    <section className="flex min-h-full w-full flex-col bg-surface text-on-surface font-body-md text-body-md antialiased" aria-label="Create room screen">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-container-high/60 bg-surface/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <button
            type="button"
            aria-label="Go back"
            className="flex size-9 shrink-0 -ml-1 cursor-pointer items-center justify-center text-on-surface-variant transition-transform hover:text-on-surface active:scale-95"
            onClick={onBack}
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center px-2">
            <h1 className="truncate text-center font-title-md text-[17px] font-bold leading-tight tracking-tight text-on-surface">
              Pick a category
            </h1>
          </div>
          <div className="size-9 shrink-0 -mr-1" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-3 pb-6">
        {/* Horizontal Question Strip */}
        <div className="mb-3 flex flex-col rounded-xl border border-surface-container-high/50 bg-surface-container-low px-3.5 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
              Questions Per Player
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-label-sm text-[11px] font-semibold text-primary">
              {questionLimit} turns each
            </span>
          </div>

          {/* Segmented Horizontal Pills */}
          <div
            aria-label="Questions limit options"
            className="grid grid-cols-5 gap-1.5"
            role="radiogroup"
          >
            {questionLimitOptions.map((limit) => {
              const isSelected = questionLimit === limit;
              return (
                <button
                  key={limit}
                  type="button"
                  disabled={creating}
                  onClick={() => setQuestionLimit(limit)}
                  className={`flex h-9 cursor-pointer items-center justify-center rounded-lg font-title-md text-xs transition-all ${
                    isSelected
                      ? 'scale-[1.02] bg-primary font-bold text-on-primary shadow-sm shadow-primary/25'
                      : 'bg-surface-container-lowest font-semibold text-on-surface shadow-xs hover:bg-surface-container-high/40 active:scale-95'
                  }`}
                  aria-pressed={isSelected}
                >
                  {limit}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Header */}
        <div className="mb-2 flex items-center justify-between px-0.5">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Choose one Category
          </span>
          <span className="font-label-sm text-[11px] font-bold text-secondary">
            {categories.length} Available
          </span>
        </div>

        {/* Skeletons on loading */}
        {loading && (
          <div className="my-2 flex flex-col gap-2 animate-pulse" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-surface-container-lowest ring-1 ring-surface-container-high/60"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="my-3 rounded-xl border border-error/30 bg-error-container p-3 text-center text-on-error-container"
            role="alert"
          >
            <p className="font-body-md text-sm">Couldn’t load categories. Please try again.</p>
            <button
              type="button"
              className="mt-2 cursor-pointer bg-transparent font-title-md text-sm font-bold text-primary underline"
              onClick={() => void reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <p className="my-6 text-center font-body-md text-sm text-on-surface-variant">
            No categories are available right now.
          </p>
        )}

        {/* Category Cards Deck */}
        <div aria-label="Game topics" className="flex flex-col gap-2" role="radiogroup">
          {categories.map((category) => {
            const isSelected = effectiveCategoryId === category.id;

            return (
              <div
                key={category.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => {
                  if (!creating) {
                    setSelectedCategoryId(category.id);
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !creating) {
                    e.preventDefault();
                    setSelectedCategoryId(category.id);
                  }
                }}
                className={`category-card flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 shadow-xs transition-all bg-surface-container-lowest ${
                  isSelected
                    ? 'ring-1.5 ring-primary/30'
                    : 'ring-1 ring-surface-container-high/60 hover:ring-surface-container-high'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-container-high text-secondary'
                    }`}
                  >
                    <CategoryIcon
                      category={category}
                      className="size-5 object-contain select-none pointer-events-none"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-title-md text-[14px] font-bold leading-tight text-on-surface">
                      {category.name}
                    </span>
                    {category.description && (
                      <span className="truncate font-body-md text-[11px] leading-tight text-on-surface-variant">
                        {category.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`radio-indicator ml-2 flex size-5 shrink-0 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span className="size-2 rounded-full bg-surface-container-lowest" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <aside className="sticky bottom-0 z-40 w-full border-t border-surface-container-high/60 bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-xl flex-col gap-2 px-4 pt-2.5 pb-3">
          {creating && (
            <p className="text-center font-title-md text-xs font-semibold text-primary">
              Creating your room…
            </p>
          )}
          {createError && (
            <p
              className="rounded-lg border border-error/30 bg-error-container p-2 text-center font-body-md text-xs leading-4 text-on-error-container"
              role="alert"
            >
              {createError.message}
            </p>
          )}
          {/* Confirm Button */}
          <button
            type="button"
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#006875] font-title-md text-[15px] font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(0,104,117,0.2)] transition-all hover:bg-[#005a66] hover:shadow-[0_8px_24px_rgba(0,104,117,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            onClick={() => void handleConfirm()}
            disabled={!effectiveCategoryId || creating}
          >
            {creating ? 'Creating room…' : 'Confirm'}
          </button>
        </div>
      </aside>
    </section>
  );
}
