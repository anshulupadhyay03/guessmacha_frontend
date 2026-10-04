import { useEffect, useRef, useState } from 'react';
import {
  isFacebookInstantGames,
  showFacebookPlayerNameOverlay,
} from './fbInstant';

interface FacebookPlayerNameProps {
  initialData?: Record<string, unknown>;
  fallbackName?: string;
  className?: string;
  textClassName?: string;
  uppercase?: boolean;
  overlayPath?: string;
  overlayCassPath?: string;
}

export default function FacebookPlayerName({
  initialData,
  fallbackName = 'Opponent',
  className = '',
  textClassName = '',
  uppercase = false,
  overlayPath = '',
  overlayCassPath = '',
}: FacebookPlayerNameProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [overlayActive, setOverlayActive] = useState(false);

  const cleanPlayerId = typeof initialData?.playerId === 'string' ? initialData.playerId.trim() : '';

  useEffect(() => {
    let isMounted = true;
    let currentOverlay: FBInstantOverlayView | null = null;
    const container = containerRef.current;

    async function mountOverlay() {
      if (!container || !cleanPlayerId || !isFacebookInstantGames()) {
        return;
      }

      if (typeof window !== 'undefined' && window.FBInstant?.overlayViews) {
        try {
          currentOverlay = await showFacebookPlayerNameOverlay(container, initialData, overlayPath , overlayCassPath);

          if (isMounted && currentOverlay) {
            setOverlayActive(true);
          }
        } catch (err) {
          console.warn('Failed to mount player name overlay:', err);
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
  }, [cleanPlayerId]);

  // Clean fallback so raw numeric IDs don't flash in the UI
  const rawFallback =
    fallbackName && fallbackName !== cleanPlayerId && !/^\d{10,}$/.test(fallbackName)
      ? fallbackName
      : 'Opponent';

  const displayFallback = uppercase ? rawFallback.toUpperCase() : rawFallback;

  return (
    <span className={`inline-flex items-center align-middle overflow-hidden ${className}`}>
      <span
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${overlayActive ? 'inline-flex items-center' : 'hidden'}`}
      />
     {!overlayActive && (
        <span className={`truncate ${textClassName}`}>{displayFallback}</span>
      )}
    </span>
  );
}

