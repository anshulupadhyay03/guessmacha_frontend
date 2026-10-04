import { useEffect, useRef, useState } from 'react';
import {
  isFacebookInstantGames,
  showFacebookOpponentProfileOverlay,
} from './fbInstant';

interface FacebookOpponentProfileProps {
  opponentId: string;
  fallbackName?: string;
  fallbackImageUrl?: string | null;
  className?: string;
}

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23eff4f7'/%3E%3Ccircle cx='24' cy='18' r='9' fill='%23006875'/%3E%3Cpath d='M10 40c0-7.7 6.3-14 14-14s14 6.3 14 14' fill='%23006875'/%3E%3C/svg%3E";

export default function FacebookOpponentProfile({
  opponentId,
  fallbackName = 'Opponent',
  fallbackImageUrl,
  className = '',
}: FacebookOpponentProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayActive, setOverlayActive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let currentOverlay: FBInstantOverlayView | null = null;
    const container = containerRef.current;

    async function mountOverlay() {
      if (!container || !opponentId || !isFacebookInstantGames()) {
        return;
      }

      if (typeof window !== 'undefined' && window.FBInstant?.overlayViews) {
        try {
          console.log('Attempting to show Facebook opponent profile overlay for opponentId:', opponentId);
          currentOverlay = await showFacebookOpponentProfileOverlay(container, opponentId);

          if (isMounted && currentOverlay) {
            setOverlayActive(true);
          }
        } catch (err) {
          console.warn('Failed to mount Facebook opponent overlay:', err);
        }
      }
    }

    void mountOverlay();

    return () => {
      isMounted = false;
      if (currentOverlay?.destroyAsync) {
        void currentOverlay.destroyAsync().catch(() => {});
      } else if (container) {
        container.innerHTML = '';
      }
    };
  }, [opponentId, fallbackName, fallbackImageUrl]);

  return (
    <div className={`inline-flex items-center shrink-0 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className={`h-11 w-33.75 sm:w-42.5 overflow-hidden ${overlayActive ? 'inline-flex items-center' : 'hidden'}`}
      />
      {!overlayActive && (
        <div className="profileCard opponentProfileCard">
          <img
            src={fallbackImageUrl || DEFAULT_AVATAR}
            alt={fallbackName}
            className="avatar"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <span className="playerName">{fallbackName}</span>
        </div>
      )}
    </div>
  );
}
