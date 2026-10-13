import React, { useEffect, useMemo, useRef, useState } from 'react';
import FacebookProfilePicture from '../platform/facebook/FacebookProfilePicture';
import { isFacebookInstantGames, showCustomOverlay } from '../platform/facebook/fbInstant';

export interface PlayerAvatarProps {
  initialData?: Record<string, unknown>;
  imageUrl?: string | null;
  name?: string;
  className?: string;
  iconSize?: string;
  isMe?: boolean;
  xmlPath?: string;
  cssPath?: string;
}

function DefaultAvatarIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlayerAvatar({
  initialData,
  imageUrl,
  name,
  className = '',
  iconSize = 'size-5',
  isMe = false,
  xmlPath = 'overlays/profile_pic.xml',
  cssPath = 'overlays/profile_pic.css',
}: PlayerAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayActive, setOverlayActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const overlayRef = useRef<FBInstantOverlayView | null>(null);
  const mountedKeyRef = useRef<string | null>(null);

  const initialDataKey = useMemo(() => {
    return initialData ? JSON.stringify(initialData) : '';
  }, [initialData]);

  const mountRunIdRef = useRef<number>(0);

  // A previously failed URL must not hide a newly provided one
  // (e.g. opponent joins late, or game data refreshes).
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  useEffect(() => {
    if (isMe || !isFacebookInstantGames() || !initialDataKey) {
      return;
    }

    const currentKey = `${xmlPath}::${cssPath}::${initialDataKey}`;
    // If overlay is already mounted for this exact configuration and player, do not re-create
    if (mountedKeyRef.current === currentKey && overlayRef.current) {
      return;
    }

    let isMounted = true;
    const currentRunId = ++mountRunIdRef.current;
    const container = containerRef.current;
    if (!container) return;

    async function mount() {
      if (!container || !isFacebookInstantGames()) {
        return;
      }

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
      container.replaceChildren();

      if (typeof window !== 'undefined' && window.FBInstant?.overlayViews) {
        try {
          const parsedData = initialData ? { ...initialData } : {};
          const overlay = await showCustomOverlay(
            container,
            xmlPath,
            cssPath,
            parsedData,
          );

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
            while (container.children.length > 1) {
              container.removeChild(container.children[0]);
            }
            overlayRef.current = overlay;
            mountedKeyRef.current = currentKey;
            setOverlayActive(true);
          }
        } catch (err) {
          console.warn('Failed to mount opponent profile picture overlay:', err);
        }
      }
    }

    void mount();

    return () => {
      isMounted = false;
      mountRunIdRef.current += 1;
      // Show the fallback again while the next player's overlay mounts,
      // otherwise the avatar flashes empty on player swaps.
      setOverlayActive(false);
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
  }, [initialDataKey, isMe, xmlPath, cssPath]);

  if (isMe) {
    return (
      <FacebookProfilePicture
        fallbackImageUrl={imageUrl}
        name={name}
        className={className}
        iconClassName={iconSize}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} aria-label={name || 'Player'}>
      {initialData && (
        <div
          ref={containerRef}
          className="w-full h-full overflow-hidden rounded-full flex items-center justify-center"
        />
      )}
      {!overlayActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={name || 'Player'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <DefaultAvatarIcon className={iconSize} />
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(PlayerAvatar);

