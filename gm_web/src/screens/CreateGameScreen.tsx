import { useState } from 'react';
import './CreateGameScreen.css';
import type { Category } from '../../../shared/types/category';
import { useCategories } from '../hooks/useCategories';
import { useCreateGame } from '../hooks/useCreateGame';

interface CreateGameScreenProps {
  onBack: () => void;
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

export default function CreateGameScreen({ onBack }: CreateGameScreenProps) {
  const { categories, error, loading, reload } = useCategories();
  const { createGame, data: game, error: createError, loading: creating } =
    useCreateGame();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  async function handleCategorySelect(categoryId: string) {
    if (creating) {
      return;
    }

    setSelectedCategoryId(categoryId);
    await createGame(categoryId);
  }

  if (game) {
    return (
      <section className="game-card category-card" aria-live="polite">
        <div className="brand-mark">GM</div>
        <p className="eyebrow">ROOM CREATED</p>
        <h1>Your game is ready</h1>
        <p className="subtitle">Share this room code with your friends to start playing.</p>
        <output className="room-code" aria-label="Room code">{game.roomCode}</output>
        <button type="button" className="primary-button" onClick={onBack}>
          Back to home
        </button>
      </section>
    );
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

      <div className="category-grid" aria-label="Available categories">
        {categories.map((category) => (
          <button
            type="button"
            className="category-option"
            key={category.id}
            onClick={() => void handleCategorySelect(category.id)}
            disabled={creating}
            aria-pressed={selectedCategoryId === category.id}
          >
            <span className="category-icon" aria-hidden="true">{categoryIcon(category)}</span>
            <span className="category-copy">
              <strong>{category.name}</strong>
              {category.description && <small>{category.description}</small>}
            </span>
            <span className="category-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>

      {creating && <p className="category-status">Creating your room…</p>}
      {createError && <p className="error-message" role="alert">{createError.message}</p>}
    </section>
  );
}
