/**
 * Mock implementation of Facebook Instant Games SDK (FBInstant) API.
 * Injected when FBInstant is not present in the runtime environment.
 */
export function setupMockFbInstant(force = false): void {
  if (typeof window === 'undefined') {
    return;
  }

  // If already mocked, don't re-apply unless forced
  if ((window as unknown as { __IS_MOCK_FB_INSTANT__?: boolean }).__IS_MOCK_FB_INSTANT__ && !force) {
    return;
  }

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0';

  const shouldMock =
    force ||
    typeof window.FBInstant === 'undefined' ||
    import.meta.env.DEV ||
    isLocalhost;

  if (shouldMock) {
    (window as unknown as { __IS_MOCK_FB_INSTANT__?: boolean }).__IS_MOCK_FB_INSTANT__ = true;

    const fallbackAvatar =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23eff4f7'/%3E%3Ccircle cx='24' cy='18' r='9' fill='%23006875'/%3E%3Cpath d='M10 40c0-7.7 6.3-14 14-14s14 6.3 14 14' fill='%23006875'/%3E%3C/svg%3E";

    const mockSdk = {
      initializeAsync: function () {
        console.log('Mock FBInstant initialized');
        return Promise.resolve();
      },
      setLoadingProgress: function (progress: number) {
        console.log('Loading: ' + progress + '%');
      },
      startGameAsync: function () {
        return Promise.resolve();
      },
      player: {
        getID: function () {
          return 'test_player_123';
        },
        getName: function () {
          return 'Test Anshul';
        },
        getPhoto: function () {
          return fallbackAvatar;
        },
        getDataAsync: function () {
          return Promise.resolve({});
        },
        setDataAsync: function () {
          return Promise.resolve();
        },
        getConnectedPlayersAsync: function () {
          return Promise.resolve([]);
        },
        getSignedPlayerInfoAsync: function () {
          return Promise.resolve({
            getPlayerID: function () {
              return 'test_player_123';
            },
            getPlayerId: function () {
              return 'test_player_123';
            },
            getSignature: function () {
              return 'mock_signature';
            },
          });
        },
      },
      context: {
        getID: function () {
          return null;
        },
        getType: function () {
          return 'SOLO';
        },
      },
      getLocale: function () {
        return 'en_US';
      },
      getPlatform: function () {
        return 'WEB';
      },
      getSDKVersion: function () {
        return '8.0';
      },
      overlayViews: {
        createOverlayViewAsync: function (
          url: string,
          container: HTMLElement,
          style?: string,
          stylesheet?: string,
        ) {
          ensureOverlayStylesheet(stylesheet);

          if (style && container) {
            container.style.cssText += style;
          }

          return Promise.resolve({
            showAsync: function () {
              console.log('Mock overlay shown:', url);
              if (container) {
                container.style.display = 'flex';
                if (!container.hasChildNodes()) {
                  const playerPhoto =
                    window.FBInstant?.player?.getPhoto?.() || fallbackAvatar;
                  const playerName =
                    window.FBInstant?.player?.getName?.() || 'Test Anshul';

                  const card = document.createElement('div');
                  card.className = 'profileCard';
                  card.innerHTML = `
                    <div class="avatarRing">
                      <img
                        src="${playerPhoto}"
                        alt="${playerName}"
                        class="avatar"
                        onerror="this.src='${fallbackAvatar}'"
                      />
                    </div>
                    <div class="playerInfo">
                      <span class="playerName">${playerName}</span>
                    </div>
                  `;
                  container.appendChild(card);
                }
              }
              return Promise.resolve();
            },
            hideAsync: function () {
              if (container) {
                container.style.display = 'none';
              }
              return Promise.resolve();
            },
            destroyAsync: function () {
              if (container) {
                container.innerHTML = '';
              }
              return Promise.resolve();
            },
          });
        },
      },
      quit: function () {
        console.log('Game quit.');
      },
    };

    try {
      window.FBInstant = mockSdk;
    } catch {
      Object.defineProperty(window, 'FBInstant', {
        value: mockSdk,
        writable: true,
        configurable: true,
      });
    }

    console.log('Mock FBInstant SDK initialized');
  }
}

/**
 * Ensures the overlay CSS stylesheet is injected into the document.
 */
function ensureOverlayStylesheet(stylesheetPath?: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  const path = stylesheetPath || 'overlays/styles.css';
  const href = path.startsWith('/') ? path : `/${path}`;
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

// Automatically invoke if running in browser
if (typeof window !== 'undefined') {
  setupMockFbInstant();
}

/**
 * Convenience helper to render the mock profile overlay directly into a container.
 */
export async function showFacebookPlayerProfileOverlay(
  container: HTMLElement,
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  setupMockFbInstant();

  console.log('Attempting to show Facebook player profile overlay in container:', container);
  if (window.FBInstant?.overlayViews && container) {
    const overlay = await window.FBInstant.overlayViews.createOverlayViewAsync(
      'overlays/profile_card.xml',
      container,
      'width: 100%; height: 70px; border: none;',
      'overlays/styles.css',
    );
    await overlay.showAsync();
  }
}




