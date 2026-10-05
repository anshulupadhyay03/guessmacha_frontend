import React, { useEffect, useRef, useState } from 'react';
import {
  isFacebookInstantGames,
  showFacebookProfilePictureOverlay,
} from './fbInstant';

export interface FacebookProfilePictureProps {
  fallbackImageUrl?: string | null;
  name?: string;
  className?: string;
  imageStyle?: string;
  iFrameStyle?: string;
  iconClassName?: string;
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

function FacebookProfilePicture({
  fallbackImageUrl,
  name = 'You',
  className = '',
  imageStyle = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; margin: 0; display: block;',
  iFrameStyle = 'overlays/shared_style.css',
  iconClassName = 'size-5',
}: FacebookProfilePictureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayActive, setOverlayActive] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const overlayRef = useRef<FBInstantOverlayView | null>(null);
  const mountedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isFacebookInstantGames()) {
      return;
    }

    const currentKey = `${imageStyle}::${iFrameStyle}`;
    // If overlay is already mounted for this exact configuration, do not re-validate or recreate
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
          const overlay = await showFacebookProfilePictureOverlay(
            container,
            imageStyle,
            iFrameStyle,
          );

          if (isMounted && overlay) {
            overlayRef.current = overlay;
            mountedKeyRef.current = currentKey;
            setOverlayActive(true);
          }
        } catch (err) {
          console.warn('Failed to mount profile picture overlay:', err);
        }
      }
    }

    void mountOverlay();

    return () => {
      isMounted = false;
    };
  }, [imageStyle, iFrameStyle]);

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

  return (
    <div className={`relative overflow-hidden ${className}`} aria-label={name}>
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden rounded-full flex items-center justify-center"
      />
      {!overlayActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {fallbackImageUrl && !fallbackError ? (
            <img
              src={fallbackImageUrl}
              alt={name}
              onError={() => setFallbackError(true)}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <DefaultAvatarIcon className={iconClassName} />
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(FacebookProfilePicture);

