import { useState } from 'react';
import './MatchLobbyScreen.css';

interface MatchLobbyScreenProps {
  roomCode: string;
  onStartGame: () => void;
}

export default function MatchLobbyScreen({
  roomCode,
  onStartGame,
}: MatchLobbyScreenProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <section className="game-card match-lobby" aria-live="polite">
      <div className="brand-mark">GM</div>
      <p className="eyebrow">GAME CREATED</p>
      <h1>Match Lobby</h1>
      <p className="subtitle">Share this room code with your friend so they can join.</p>

      <div className="room-code-field">
        <output className="room-code" aria-label="Room code">{roomCode}</output>
        <button type="button" className="copy-button" onClick={() => void handleCopy()}>
          Copy code
        </button>
      </div>

      {copyStatus === 'copied' && <p className="copy-status">Room code copied.</p>}
      {copyStatus === 'error' && (
        <p className="error-message" role="alert">
          Couldn’t copy the room code. Please copy it manually.
        </p>
      )}

      <button type="button" className="primary-button lobby-start-button" onClick={onStartGame}>
        Start Game
      </button>
    </section>
  );
}
