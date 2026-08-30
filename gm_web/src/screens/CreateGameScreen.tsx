import { useState } from 'react';
import './CreateGameScreen.css';
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
    <section className="game-card category-card">
      <button type="button" className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="brand-mark">GM</div>
      <p className="eyebrow">CREATE A ROOM</p>
      <h1>Pick a category</h1>
      <p className="subtitle">Choose a topic for this round. Your friends will join with the room code.</p>

      {loading && <p className="category-status">Loading categories…</p>}

      {error && (
        <div className="category-error" role="alert">
          <p>Couldn’t load categories. Please try again.</p>
          <button type="button" className="retry-button" onClick={() => void reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="category-status">No categories are available right now.</p>
      )}

      <fieldset className="category-grid" disabled={creating}>
        <legend className="visually-hidden">Available categories</legend>
        {categories.map((category) => (
          <label
            className={`category-option${selectedCategoryId === category.id ? ' category-option--selected' : ''}`}
            key={category.id}
          >
            <input
              className="category-radio"
              type="radio"
              name="category"
              value={category.id}
              checked={selectedCategoryId === category.id}
              onChange={() => setSelectedCategoryId(category.id)}
            />
            <span className="category-icon" aria-hidden="true">{categoryIcon(category)}</span>
            <span className="category-copy">
              <strong>{category.name}</strong>
              {category.description && <small>{category.description}</small>}
            </span>
          </label>
        ))}
      </fieldset>

      {creating && <p className="category-status">Creating your room…</p>}
      {createError && <p className="error-message" role="alert">{createError.message}</p>}
      <button
        type="button"
        className="primary-button confirm-button"
        onClick={() => void handleConfirm()}
        disabled={!selectedCategoryId || creating}
      >
        {creating ? 'Creating room…' : 'Confirm'}
      </button>
    </section>
  );
}
