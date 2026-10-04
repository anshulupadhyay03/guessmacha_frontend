import type { PlatformPlayer } from '../../types/fbinstant'
import { setupMockFbInstant } from './mockFbInstant'

// Initialize mock FBInstant if running in an environment without Facebook Instant Games SDK
setupMockFbInstant()

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
  setupMockFbInstant()

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
      'width: 100%; height: 70px; border: none; overflow: hidden;',
      cssPath,
    )

    await overlay.showAsync()
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook player profile overlay:', error)
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

  const pid = typeof initialData?.playerId === 'string' ? initialData.playerId.trim() : ''
  if (!pid) {
    return null
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      return null
    }

    const xmlPath = overlayPath
    const cssPath = overlayCassPath

    const overlay = await overlayViews.createOverlayViewAsync(
      xmlPath,
      container,
      'width: 100%; height: 100%; border: none; overflow: hidden;',
      cssPath,
      initialData,
    )

    await overlay.showAsync()
    container.querySelector('iframe')?.setAttribute('scrolling', 'no')
    return overlay
  } catch (error) {
    console.error('Failed to show Facebook player name overlay:', error)
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
