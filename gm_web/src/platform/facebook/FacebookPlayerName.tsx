import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  isFacebookInstantGames,
  showFacebookProfileNameOverlay,
  showCustomOverlay
} from './fbInstant';

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
  const mountRunIdRef = useRef<number>(0);

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
    // If overlay is already mounted for this exact configuration and player, do not re-create
    if (mountedKeyRef.current === currentKey && overlayRef.current) {
      return;
    }

    let isMounted = true;
    const currentRunId = ++mountRunIdRef.current;

    async function mountOverlay() {
      if (!container || !isFacebookInstantGames()) {
        return;
      }

      // 1. Immediately tear down any previous overlay
      if (overlayRef.current) {
        const prev = overlayRef.current;
        overlayRef.current = null;
        mountedKeyRef.current = null;
        if (prev.destroyAsync) {
          void prev.destroyAsync().catch(() => {});
        } else if (prev.dismissAsync) {
          void prev.dismissAsync().catch(() => {});
        }
      }

      // 2. Clear any children from container so no stale/duplicate iframes exist
      container.replaceChildren();

      if (typeof window !== 'undefined' && window.FBInstant?.overlayViews) {
        try {
          const parsedData = initialData ? { ...initialData } : undefined;
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
              parsedData,
            );
          }

          // 3. Stale-call check: if unmounted or another mount started while awaiting, destroy immediately!
          if (!isMounted || currentRunId !== mountRunIdRef.current) {
            if (overlay) {
              if (overlay.destroyAsync) {
                void overlay.destroyAsync().catch(() => {});
              } else if (overlay.dismissAsync) {
                void overlay.dismissAsync().catch(() => {});
              }
            }
            container.replaceChildren();
            return;
          }

          if (overlay) {
            // Safety: Ensure only one iframe child exists in the container
            while (container.children.length > 1) {
              container.removeChild(container.children[0]);
            }
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
      mountRunIdRef.current++;
      if (overlayRef.current) {
        const prev = overlayRef.current;
        overlayRef.current = null;
        mountedKeyRef.current = null;
        if (prev.destroyAsync) {
          void prev.destroyAsync().catch(() => {});
        } else if (prev.dismissAsync) {
          void prev.dismissAsync().catch(() => {});
        }
      }
      if (container) {
        container.replaceChildren();
      }
    };
  }, [isMe, initialDataKey, overlayPath, overlayCassPath, textStyle, iFrameStyle]);

  // Clean up overlay on unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        const prev = overlayRef.current;
        overlayRef.current = null;
        if (prev.destroyAsync) {
          void prev.destroyAsync().catch(() => {});
        } else if (prev.dismissAsync) {
          void prev.dismissAsync().catch(() => {});
        }
      }
      if (containerRef.current) {
        containerRef.current.replaceChildren();
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
  const isFullWidth = className.includes('w-full');
  const displayClass = isFullWidth ? 'flex' : 'inline-flex';

  return (
    // outer wrapper: add `relative`
    <span className={`relative inline-flex items-center align-middle overflow-hidden ${className}`}>
    <span className={`relative ${displayClass} items-center align-middle overflow-hidden ${className}`}>
      <span
        ref={containerRef}
        className={`absolute inset-0 w-full h-full overflow-hidden ${overlayActive ? 'flex items-center' : 'hidden'}`}
        className={`absolute inset-0 w-full h-full overflow-hidden ${overlayActive ? 'flex items-center justify-center' : 'hidden'}`}
        style={{ justifyContent: 'inherit' }}
      />
      {!overlayActive && (
        <span className={textClassName ? textClassName : 'truncate'}>{displayFallback}</span>
      )}
    </span>
  );
}

export default React.memo(FacebookPlayerName);
