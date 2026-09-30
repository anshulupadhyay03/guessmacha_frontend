import { useState } from 'react';
import type { Category } from '../../../shared/types/category';
import Chip from '../components/Chip';
import type { CreateGameResponse } from '../features/dashboard/types';
import { useCategories } from '../hooks/useCategories';
import { useCreateGame } from '../hooks/useCreateGame';

interface CreateGameScreenProps {
  onBack: () => void;
  onGameCreated: (game: CreateGameResponse) => void;
}

const categoryIcons: Record<string, string> = {
  animals: '🐯',
  cricket: '🏏',
  movies: '🎬',
  music: '🎵',
  sports: '🏆',
  geography: '🌍',
  history: '🏛️',
  food: '🍜',
  general: '✨',
};

const questionLimitOptions = [5, 7, 10, 12, 15];

function categoryIcon(category: Category): string {
  return categoryIcons[category.iconKey?.toLowerCase() ?? ''] ?? '🎯';
}

export default function CreateGameScreen({
  onBack,
  onGameCreated,
}: CreateGameScreenProps) {
  const { categories, error, loading, reload } = useCategories();
  const { createGame, error: createError, loading: creating } = useCreateGame();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [questionLimit, setQuestionLimit] = useState(10);

  async function handleConfirm() {
    if (!selectedCategoryId || creating) {
      return;
    }

    const game = await createGame(selectedCategoryId, questionLimit);

    if (game) {
      onGameCreated(game);
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-[640px] px-[22px] pt-3 pb-5 text-left text-[#171d1e]">
      <button type="button" className="absolute top-[18px] left-[22px] cursor-pointer rounded-[10px] border border-[#bbc9cc] bg-[#eff4f7] px-2.5 py-2 text-sm font-bold text-[#171d1e] transition hover:bg-[#e9eff1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875]" onClick={onBack}>
        ← Back
      </button>
      <p className="mt-2 text-center text-[0.7rem] font-bold tracking-[0.12em] text-[#36656e] uppercase">CREATE A ROOM</p>
      <h1 className="mt-3 mb-2 text-center text-[clamp(2rem,5vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.06em] text-[#171d1e]">Pick a category</h1>
      <p className="mx-auto mb-7 max-w-[420px] text-center text-[0.96rem] leading-6 text-[#3c494c]">Choose a topic for this round. Your friends will join with the room code.</p>

      {loading && <p className="my-6 text-center text-[#3c494c]">Loading categories…</p>}

      {error && (
        <div className="my-5 rounded-[14px] bg-[#ffdad6] border border-[#ba1a1a]/30 p-[14px] text-center text-[#93000a]" role="alert">
          <p>Couldn’t load categories. Please try again.</p>
          <button type="button" className="mt-2 cursor-pointer bg-transparent text-sm font-extrabold text-[#006875] underline" onClick={() => void reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="my-6 text-center text-[#3c494c]">No categories are available right now.</p>
      )}

      <div className="mt-4 mb-2">
        <label className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#36656e] uppercase">
          Questions Limit for each Player
        </label>
        <div
          role="radiogroup"
          aria-label="Questions Limit for each Player"
          className="flex flex-wrap items-center gap-2.5"
        >
          {questionLimitOptions.map((limit) => (
            <Chip
              key={limit}
              label={limit}
              selected={questionLimit === limit}
              onClick={() => setQuestionLimit(limit)}
              disabled={creating}
              ariaLabel={`${limit} questions`}
            />
          ))}
        </div>
      </div>

      <fieldset className="mt-5 grid min-w-0 gap-2.5 border-0 p-0 disabled:cursor-wait disabled:opacity-65" disabled={creating}>
        <legend className="sr-only">Available categories</legend>
        {categories.map((category) => (
          <label
            className={`flex min-h-[72px] w-full cursor-pointer items-center gap-[14px] rounded-2xl border bg-white px-[14px] py-3 text-left text-[#171d1e] shadow-xs transition hover:-translate-y-px hover:border-[#006875] hover:shadow-sm ${selectedCategoryId === category.id ? 'border-[#006875] shadow-[0_0_0_2px_rgba(0,104,117,0.2)]' : 'border-[#bbc9cc]'}`}
            key={category.id}
          >
            <input
              className="size-[18px] shrink-0 accent-[#006875] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#006875]/40"
              type="radio"
              name="category"
              value={category.id}
              checked={selectedCategoryId === category.id}
              onChange={() => setSelectedCategoryId(category.id)}
            />
            <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-[#02c2d9]/15 text-[23px]" aria-hidden="true">{categoryIcon(category)}</span>
            <span className="grid min-w-0 gap-[3px]">
              <strong className="text-base text-[#171d1e]">{category.name}</strong>
              {category.description && <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#3c494c]">{category.description}</small>}
            </span>
          </label>
        ))}
      </fieldset>

      {creating && <p className="my-6 text-center text-[#3c494c]">Creating your room…</p>}
      {createError && <p className="my-5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 p-[14px] text-sm leading-5 text-[#93000a]" role="alert">{createError.message}</p>}
      <button
        type="button"
        className="mt-6 w-full cursor-pointer rounded-xl bg-[#006875] px-[18px] py-4 text-[1.15rem] font-extrabold text-white shadow-[0_4px_14px_rgba(0,104,117,0.2)] transition hover:-translate-y-px hover:bg-[#005a66] hover:shadow-[0_8px_24px_rgba(0,104,117,0.25)] disabled:cursor-not-allowed disabled:opacity-55 disabled:transform-none"
        onClick={() => void handleConfirm()}
        disabled={!selectedCategoryId || creating}
      >
        {creating ? 'Creating room…' : 'Confirm'}
      </button>
    </section>
  );
}
