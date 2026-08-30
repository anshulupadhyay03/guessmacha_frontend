import { useState } from 'react';
import type { Category } from '../../../shared/types/category';
import type { CreateGameResponse } from '../../../shared/types/game';
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

  async function handleConfirm() {
    if (!selectedCategoryId || creating) {
      return;
    }

    const game = await createGame(selectedCategoryId);

    if (game) {
      onGameCreated(game);
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-[640px] px-[22px] pt-3 pb-5 text-left text-[#f5f7fb]">
      <button type="button" className="absolute top-[18px] left-[22px] cursor-pointer rounded-[10px] bg-white/4 px-2.5 py-2 text-sm font-bold text-[#edf3ff] transition hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" onClick={onBack}>
        ← Back
      </button>
      <p className="mt-2 text-center text-[0.7rem] font-bold tracking-[0.12em] text-[#9db7d8] uppercase">CREATE A ROOM</p>
      <h1 className="mt-3 mb-2 text-center text-[clamp(2rem,5vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.06em]">Pick a category</h1>
      <p className="mx-auto mb-7 max-w-[420px] text-center text-[0.96rem] leading-6 text-[#c5cad4]">Choose a topic for this round. Your friends will join with the room code.</p>

      {loading && <p className="my-6 text-center text-[#ccd5e3]">Loading categories…</p>}

      {error && (
        <div className="my-5 rounded-[14px] bg-red-500/15 p-[14px] text-center text-[#ffd9d9]" role="alert">
          <p>Couldn’t load categories. Please try again.</p>
          <button type="button" className="mt-2 cursor-pointer bg-transparent text-sm font-extrabold text-inherit underline" onClick={() => void reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="my-6 text-center text-[#ccd5e3]">No categories are available right now.</p>
      )}

      <fieldset className="mt-5 grid min-w-0 gap-2.5 border-0 p-0 disabled:cursor-wait disabled:opacity-65" disabled={creating}>
        <legend className="sr-only">Available categories</legend>
        {categories.map((category) => (
          <label
            className={`flex min-h-[72px] w-full cursor-pointer items-center gap-[14px] rounded-2xl border bg-white/3 px-[14px] py-3 text-left text-[#edf4ff] transition hover:-translate-y-px hover:border-[#7fe4dc]/35 hover:shadow-[0_6px_18px_rgba(31,35,48,0.18)] ${selectedCategoryId === category.id ? 'border-[#7fe4dc]/65 shadow-[0_0_0_2px_rgba(127,228,220,0.18)]' : 'border-white/8'}`}
            key={category.id}
          >
            <input
              className="size-[18px] shrink-0 accent-[#7fe4dc] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#7fe4dc]/40"
              type="radio"
              name="category"
              value={category.id}
              checked={selectedCategoryId === category.id}
              onChange={() => setSelectedCategoryId(category.id)}
            />
            <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-[#c4cbd4]/12 text-[23px]" aria-hidden="true">{categoryIcon(category)}</span>
            <span className="grid min-w-0 gap-[3px]">
              <strong className="text-base text-[#f5f7fb]">{category.name}</strong>
              {category.description && <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#b7bfcc]">{category.description}</small>}
            </span>
          </label>
        ))}
      </fieldset>

      {creating && <p className="my-6 text-center text-[#ccd5e3]">Creating your room…</p>}
      {createError && <p className="my-5 rounded-xl bg-red-500/15 p-[14px] text-sm leading-5 text-[#ffd9d9]" role="alert">{createError.message}</p>}
      <button
        type="button"
        className="mt-6 w-full cursor-pointer rounded-xl bg-gradient-to-br from-[#7fe4dc] to-[#6cccff] px-[18px] py-4 text-[1.15rem] font-extrabold text-[#0f1723] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(111,211,225,0.2)] disabled:cursor-not-allowed disabled:opacity-55 disabled:transform-none"
        onClick={() => void handleConfirm()}
        disabled={!selectedCategoryId || creating}
      >
        {creating ? 'Creating room…' : 'Confirm'}
      </button>
    </section>
  );
}
