import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  isFacebookInstantGames,
  showFacebookProfileNameOverlay,
} from './fbInstant';
import { showCustomOverlay } from './mockFbInstant';

export interface FacebookPlayerNameProps {
  isMe?: boolean;
  initialData?: Record<string, unknown>;
  fallbackName?: string;
  className?: string;
  textClassName?: string;
  uppercase?: boolean;
  overlayPath?: string;
  overlayCassPath?: string;
  textStyle?: string;
  iFrameStyle?: string;
}

function FacebookPlayerName({
  isMe = false,
  initialData,
  fallbackName,
  className = '',
  textClassName = '',
  uppercase = false,
  overlayPath = 'overlays/player_name.xml',
  overlayCassPath = 'overlays/styles.css',
  textStyle = 'font-family: inherit; font-size: inherit; font-weight: inherit; color: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: inherit; margin: 0; padding: 0;',
  iFrameStyle = 'width: 100%; height: 100%; border: none; overflow: hidden; display: block; background: transparent; margin: 0; padding: 0;',
}: FacebookPlayerNameProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [overlayActive, setOverlayActive] = useState(false);
  const overlayRef = useRef<FBInstantOverlayView | null>(null);
  const mountedKeyRef = useRef<string | null>(null);

  const initialDataKey = useMemo(() => {
    return initialData ? JSON.stringify(initialData) : '';
  }, [initialData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isFacebookInstantGames()) {
      return;
    }

    // For opponent, initialData with playerId is required. For isMe, SDK provides current user's name directly.
    if (!isMe && (!initialData || !initialData.playerId)) {
      return;
    }

    const currentKey = `${isMe ? 'me' : 'opponent'}::${overlayPath}::${overlayCassPath}::${textStyle}::${iFrameStyle}::${initialDataKey}`;
    // If overlay is already mounted for this exact configuration and player, do not re-validate or recreate
    if (mountedKeyRef.current === currentKey && overlayRef.current) {
      return;
    }

    let isMounted = true;

    async function mountOverlay() {
      if (!container || !isFacebookInstantGames()) {
        return;
      }

      if (overlayRef.current) {
        if (overlayRef.current.destroyAsync) {
          void overlayRef.current.destroyAsync().catch(() => {});
        } else if (overlayRef.current.dismissAsync) {
          void overlayRef.current.dismissAsync().catch(() => {});
        }
        overlayRef.current = null;
        container.innerHTML = '';
      }

      if (typeof window !== 'undefined' && window.FBInstant?.overlayViews) {
        try {
          let overlay: FBInstantOverlayView | null = null;
          if (isMe) {
            overlay = await showFacebookProfileNameOverlay(
              container,
              textStyle,
              iFrameStyle,
              overlayCassPath,
            );
          } else {
            overlay = await showCustomOverlay(
              container,
              overlayPath,
              overlayCassPath,
              initialData,
            );
          }

          if (isMounted && overlay) {
            overlayRef.current = overlay;
            mountedKeyRef.current = currentKey;
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
    };
  }, [isMe, initialDataKey, overlayPath, overlayCassPath, textStyle, iFrameStyle, initialData]);

  // Clean up overlay only on unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        if (overlayRef.current.destroyAsync) {
          void overlayRef.current.destroyAsync().catch(() => {});
        } else if (overlayRef.current.dismissAsync) {
          void overlayRef.current.dismissAsync().catch(() => {});
        }
        overlayRef.current = null;
      }
    };
  }, []);

  const playerIdStr = typeof initialData?.playerId === 'string' ? initialData.playerId.trim() : '';

  // Clean fallback so raw numeric IDs don't flash in the UI
  const rawFallback =
    fallbackName && fallbackName !== playerIdStr && !/^\d{10,}$/.test(fallbackName)
      ? fallbackName
      : isMe
        ? 'You'
        : 'Opponent';

  const displayFallback = uppercase ? rawFallback.toUpperCase() : rawFallback;

  return (
    <span className={`inline-flex items-center align-middle overflow-hidden ${className}`}>
      <span
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${overlayActive ? 'inline-flex items-center' : 'hidden'}`}
        style={{ justifyContent: 'inherit' }}
      />
      {!overlayActive && (
        <span className={`truncate ${textClassName}`}>{displayFallback}</span>
      )}
    </span>
  );
}

export default React.memo(FacebookPlayerName);
