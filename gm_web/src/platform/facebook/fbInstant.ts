import type { PlatformPlayer } from '../../types/fbinstant'
import { isMockFbInstantEnabled, setupMockFbInstant } from './mockFbInstant'

// Initialize mock FBInstant only if explicitly enabled via environment configuration
if (isMockFbInstantEnabled()) {
  setupMockFbInstant()
}

export type FacebookSignedPlayerInfo = {
  playerId: string
  signature: string
}

export function isFacebookInstantGames(): boolean {
  return typeof FBInstant !== 'undefined'
}

export async function getFacebookSignedPlayerInfo(): Promise<FacebookSignedPlayerInfo | null> {
  // Called only after initializeFacebookInstant() has completed.
  const player = FBInstant.player

  type SignedPlayerInfoRuntime = {
    getPlayerID(): string
    getSignature(): string
  }

  type PlayerWithSignedInfo = typeof player & {
    getSignedPlayerInfoAsync?: (
      requestPayload?: string,
    ) => Promise<SignedPlayerInfoRuntime>
  }

  const playerWithSignedInfo = player as PlayerWithSignedInfo

  if (typeof playerWithSignedInfo.getSignedPlayerInfoAsync !== 'function') {
    console.warn('getSignedPlayerInfoAsync is not available at runtime')
    return null
  }

  try {
    const signedInfo = await playerWithSignedInfo.getSignedPlayerInfoAsync()

    const playerId = signedInfo.getPlayerID()
    const signature = signedInfo.getSignature()

    if (!playerId || !signature) {
      console.warn('Facebook signed player info is incomplete')
      return null
    }

    return {
      playerId,
      signature,
    }
  } catch (error) {
    console.error('getSignedPlayerInfoAsync failed:', error)
    return null
  }
}

export async function initializeFacebookInstant(): Promise<PlatformPlayer | null> {
  if (isMockFbInstantEnabled()) {
    setupMockFbInstant()
  }

  if (!isFacebookInstantGames()) {
    console.log('Running outside Facebook Instant Games')
    return null
  }

  try {
    console.log('Initializing Facebook Instant Games...')

    const initTimeout = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              'FBInstant.initializeAsync timed out (running outside Facebook iframe)',
            ),
          ),
        4000,
      ),
    )
    await Promise.race([FBInstant.initializeAsync(), initTimeout])

    FBInstant.setLoadingProgress(50)
    FBInstant.setLoadingProgress(100)

    const startTimeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('FBInstant.startGameAsync timed out')),
        4000,
      ),
    )
    await Promise.race([FBInstant.startGameAsync(), startTimeout])

    /*    console.log('Facebook Instant Game initialized successfully')
       console.log('SDK Version:', FBInstant.getSDKVersion())
       console.log('Platform:', FBInstant.getPlatform())
       console.log('Locale:', FBInstant.getLocale()) */

    const player = FBInstant.player

    let id = ''

    try {
      id = player.getID() || ''
      console.log('Direct player ID:', id)
    } catch (error) {
      console.error('getID failed:', error)
    }

    // Zero Permissions: Meta does NOT expose the current player's name or
    // profile-photo URL to game JavaScript. Those values are resolved by Meta
    // only when an Overlay View is rendered inside Meta's controlled iframe.
    // Therefore, never read player.name/player.photo and never send them to
    // the Supabase backend as if they were directly available to the game.
    const platformPlayer: PlatformPlayer = {
      id,
      name: (typeof player.getName === 'function' ? player.getName() : '') || '',
      photo: (typeof player.getPhoto === 'function' ? player.getPhoto() : undefined),
    }

    console.log('Platform player identity:', platformPlayer)
    console.log(
      'Player profile display: use FBInstant Overlay Views (Meta-rendered name/photo)',
    )

    return platformPlayer
  } catch (error) {
    console.error('Failed to initialize Instant Game:', error)
    return null
  }
}

export async function showFacebookPlayerProfileOverlay(
  container: HTMLElement,
): Promise<FBInstantOverlayView | null> {
  if (!isFacebookInstantGames()) {
    console.warn('Facebook Instant Overlay Views are unavailable outside Instant Games')
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      console.error('FBInstant.overlayViews is unavailable in this SDK/runtime')
      return null
    }

    const xmlPath = 'overlays/profile_card.xml'
    const cssPath = 'overlays/styles.css'

    console.log('Creating Facebook profile overlay:', { xmlPath, cssPath })

    const overlay = await overlayViews.createOverlayViewAsync(
      xmlPath,
      container,
      'width: 100%; height: 100%; border: none; overflow: hidden;',
      cssPath,
    )

    await overlay.showAsync()
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook player profile overlay:', error)
    return null
  }
}

function normalizeOverlayPath(path: string): string {
  if (!path) return ''
  let p = path.trim()
  const overlayIdx = p.indexOf('overlays/')
  if (overlayIdx !== -1) {
    return p.slice(overlayIdx)
  }
  p = p.replace(/^\/+/, '')
  if (p.startsWith('public/')) {
    p = p.slice('public/'.length)
  }
  return p
}

export async function showCustomOverlay(
  container: HTMLElement,
  xmlPath: string,
  cssPath: string,
  initialData: Record<string, unknown> = {},
): Promise<FBInstantOverlayView | null> {
  if (!isFacebookInstantGames()) {
    console.warn('Facebook Instant Overlay Views are unavailable outside Instant Games')
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      console.error('FBInstant.overlayViews is unavailable in this SDK/runtime')
      return null
    }

    const cleanXmlPath = normalizeOverlayPath(xmlPath)
    const cleanCssPath = normalizeOverlayPath(cssPath)

    const overlay = await overlayViews.createOverlayViewAsync(
      cleanXmlPath,
      container,
      'width: 100%; height: 100%; border: none; overflow: hidden; background: transparent; margin: 0; padding: 0;',
      cleanCssPath,
      initialData,
    )

    await overlay.showAsync()
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook custom overlay:', error)
    return null
  }
}

export async function showFacebookOpponentProfileOverlay(
  container: HTMLElement,
  opponentPlayerId: string,
): Promise<FBInstantOverlayView | null> {
  if (!isFacebookInstantGames()) {
    console.warn('Facebook Instant Overlay Views are unavailable outside Instant Games')
    return null
  }

  const playerId = opponentPlayerId.trim()

  if (!playerId) {
    console.warn('Cannot show opponent profile overlay without a player ID')
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      console.error('FBInstant.overlayViews is unavailable in this SDK/runtime')
      return null
    }

    const xmlPath = `overlays/opponent_profile.xml`
    const cssPath = 'overlays/styles.css'

    console.log('Creating Facebook opponent profile overlay:', {
      xmlPath,
      cssPath,
      opponentPlayerId: playerId,
    })

    const overlay = await overlayViews.createOverlayViewAsync(
      xmlPath,
      container,
      'width: 100%; height: 100%; border: none; overflow: hidden;',
      cssPath,
      { opponentPlayerId: playerId }
    )

    await overlay.showAsync()
    return overlay
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook opponent profile overlay:', error)
    return null
  }
}

export async function showFacebookPlayerNameOverlay(
  container: HTMLElement,
  initialData?: Record<string, unknown>,
  overlayPath: string = '',
  overlayCassPath: string = '',
): Promise<FBInstantOverlayView | null> {
  if (!isFacebookInstantGames()) {
    return null
  }

  if (!initialData || !initialData.playerId) {
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      return null
    }

    const xmlPath = overlayPath || 'overlays/player_name.xml'
    const cssPath = overlayCassPath || 'overlays/styles.css'

    const cleanXmlPath = normalizeOverlayPath(xmlPath)
    const cleanCssPath = normalizeOverlayPath(cssPath)

    const overlay = await overlayViews.createOverlayViewAsync(
      cleanXmlPath,
      container,
      'width: 100%; height: 100%; border: none; overflow: hidden; background: transparent;',
      cleanCssPath,
      initialData,
    )

    await overlay.showAsync()
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook player name overlay:', error)
    return null
  }
}

export async function showFacebookProfileNameOverlay(
  container: HTMLElement,
  textStyle: string = 'font-family: inherit; font-size: inherit; font-weight: inherit; color: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: inherit; margin: 0; padding: 0;',
  iFrameStyle: string = 'width: 100%; height: 100%; border: none; overflow: hidden; display: block; background: transparent; margin: 0; padding: 0;',
  pathToCss?: string,
): Promise<FBInstantOverlayView | null> {
  if (!isFacebookInstantGames()) {
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews || typeof overlayViews.createProfileNameOverlayViewAsync !== 'function') {
      console.warn('createProfileNameOverlayViewAsync is unavailable in this SDK/runtime')
      return null
    }

    const cleanCssPath = pathToCss ? normalizeOverlayPath(pathToCss) : undefined

    console.log('Creating Facebook profile name overlay:', { cleanCssPath, textStyle })

    const overlay = await overlayViews.createProfileNameOverlayViewAsync(
      container,
      textStyle,
      iFrameStyle,
      cleanCssPath,
    )

    await overlay.showAsync()
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook profile name overlay:', error)
    return null
  }
}

export async function showFacebookProfilePictureOverlay(
  container: HTMLElement,
  imageStyle: string = 'position: fixed; top: 0; left: 0;width: 100%; height: 100%; border-radius: 50%; object-fit: cover; margin: 0; display: block;',
  iFrameStyle: string = 'width: 100%; height: 100%; border: none; overflow: hidden; display: block; background: transparent; margin: 0; padding: 0;',
): Promise<FBInstantOverlayView | null> {
  if (!isFacebookInstantGames()) {
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews || typeof overlayViews.createProfilePictureOverlayViewAsync !== 'function') {
      console.warn('createProfilePictureOverlayViewAsync is unavailable in this SDK/runtime')
      return null
    }

    console.log('Creating Facebook profile picture overlay')

    const overlay = await overlayViews.createProfilePictureOverlayViewAsync(
      container,
      imageStyle,
      iFrameStyle,
    )

    await overlay.showAsync()
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook profile picture overlay:', error)
    return null
  }
}

export function getFacebookGameRoomCode(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const params = new URLSearchParams(window.location.search)
  const candidates = [
    params.get('room'),
    params.get('roomCode'),
    params.get('gameCode'),
  ]

  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value) {
      return value.toUpperCase()
    }
  }

  return null
}

/**
 * Triggers haptic vibration feedback using the Facebook Instant Games SDK,
 * with graceful fallback to navigator.vibrate on mobile web.
 *
 * Adheres to Facebook Instant Games best practices:
 * - Fire-and-forget: does not block game execution
 * - Silent error handling: catches exceptions without disrupting gameplay
 * - Hardware fallback: supports HTML5 Vibration API when not running in FBInstant
 */
export function triggerHapticFeedback(): void {
  try {
    if (typeof window !== 'undefined' && window.FBInstant?.performHapticFeedbackAsync) {
      window.FBInstant.performHapticFeedbackAsync().catch((err) => {
        // Haptic feedback is non-critical, catch silently per FB documentation
        console.warn('[Haptics] FBInstant haptic feedback failed or unsupported:', err);
      });
      return;
    }

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(40);
    }
  } catch (error) {
    // Best practice: Always catch and handle errors silently
    console.warn('[Haptics] Haptic feedback execution failed:', error);
  }
}

/**
 * Checks whether haptic feedback is supported on the current device and platform.
 */
export function isHapticFeedbackSupported(): boolean {
  try {
    if (typeof window !== 'undefined' && window.FBInstant?.getSupportedAPIs) {
      return window.FBInstant.getSupportedAPIs().includes('performHapticFeedbackAsync');
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export interface ShareFacebookGameOptions {
  roomCode: string;
  categoryName?: string;
}

export interface InviteFacebookGameOptions {
  roomCode: string;
  categoryName?: string;
}

/**
 * Triggers native Facebook Instant Games player invitation dialog using FBInstant.inviteAsync().
 */
export async function inviteFacebookGameAsync(
  options: InviteFacebookGameOptions | string,
): Promise<boolean> {
  if (!isFacebookInstantGames()) {
    console.warn('inviteFacebookGameAsync called outside Facebook Instant Games');
    return false;
  }

  try {
    const roomCode = typeof options === 'string' ? options : options.roomCode;
    const inviteAsync = FBInstant?.inviteAsync;

    if (typeof inviteAsync !== 'function') {
      console.warn('FBInstant.inviteAsync is not available in this SDK/runtime');
      return false;
    }

    await inviteAsync({
      imageOverlayPath: 'overlays/matchlobby/share_card.xml',
      pathToCSS: 'overlays/matchlobby/match_lobby_share_card.css',
      text: {
        default: 'Come play with me!'
      },
      data: { roomCode: roomCode },
      cta: 'Play Now',
      dialogTitle: 'Invite Friends',
      initialData: { roomCode },
    });
    return true;
  } catch (error) {
    console.error('FBInstant.inviteAsync failed:', error);
    return false;
  }
}

/**
 * Triggers native Facebook Instant Games social share dialog using FBInstant.shareAsync().
 * Refer to Zero Permissions custom updates, invites, and shares documentation.
 */
export async function shareFacebookGameAsync(
  options: ShareFacebookGameOptions,
): Promise<boolean> {
  if (!isFacebookInstantGames()) {
    console.warn('shareFacebookGameAsync called outside Facebook Instant Games');
    return false;
  }

  try {
    const { roomCode, categoryName } = options;
    const shareAsync = FBInstant?.shareAsync;

    if (typeof shareAsync !== 'function') {
      console.warn('FBInstant.shareAsync is not available in this SDK/runtime');
      return false;
    }

    const categoryText = categoryName ? ` (${categoryName})` : '';
    const shareText = `{{FBInstant.player.name}} invited you to play GuessMate${categoryText}! Join with Room Code: ${roomCode}`;

    const payload = {
      imageOverlayPath: 'overlays/matchlobby/share_card.xml',
      pathToCSS: 'overlays/matchlobby/match_lobby_share_card.css',
      initialData: { roomCode, categoryName: categoryName || '' },
      text: shareText,
      data: { roomCode },
      shareDestination: ['GROUP', 'COPY_LINK', 'MESSENGER'],
      switchContext: false,
    };

    try {
      await shareAsync(payload);
      return true;
    } catch (overlayError) {
      console.warn(
        'FBInstant.shareAsync with overlay failed, retrying without overlay:',
        overlayError,
      );
      await shareAsync({
        text: shareText,
        data: { roomCode },
        shareDestination: ['NEWSFEED', 'GROUP', 'COPY_LINK', 'MESSENGER'],
        switchContext: false,
      });
      return true;
    }
  } catch (error) {
    console.error('FBInstant.shareAsync failed:', error);
    return false;
  }
}

