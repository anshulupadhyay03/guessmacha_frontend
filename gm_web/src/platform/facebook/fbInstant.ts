import type { PlatformPlayer } from '../../types/fbinstant'

export type FacebookSignedPlayerInfo = {
  playerId: string
  signature: string
}

export function isFacebookInstantGames(): boolean {
  return import.meta.env.PROD && typeof FBInstant !== 'undefined'
}

export async function getFacebookSignedPlayerInfo(): Promise<FacebookSignedPlayerInfo | null> {
  // Called only after initializeFacebookInstant() has completed.
  // No custom request payload is used because SDK 8 on the web client can
  // reject the passthrough message used by getSignedPlayerInfoAsync(payload).
  const player = FBInstant.player

  type SignedPlayerInfoRuntime = {
    getPlayerId(): string
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

    const playerId = signedInfo.getPlayerId()
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
  if (!isFacebookInstantGames()) {
    console.log('Running outside Facebook Instant Games')
    return null
  }

  try {
    await FBInstant.initializeAsync()

    FBInstant.setLoadingProgress(50)
    FBInstant.setLoadingProgress(100)

    await FBInstant.startGameAsync()

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
      name: '',
      photo: undefined,
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
): Promise<void> {
  if (!isFacebookInstantGames()) {
    console.warn('Facebook Instant Overlay Views are unavailable outside Instant Games')
    return
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      console.error('FBInstant.overlayViews is unavailable in this SDK/runtime')
      return
    }

    // Overlay XML/CSS files are Meta overlay assets, not normal Vite public files.
    // The paths must resolve inside the Instant Game bundle that Meta serves.
    const xmlPath = 'overlays/profile_card.xml'
    const cssPath = 'overlays/styles.css'

    console.log('Creating Facebook profile overlay:', { xmlPath, cssPath })

    const overlay = await overlayViews.createOverlayViewAsync(
      xmlPath,
      container,
      'width: 100%; height: 180px; border: none;',
      cssPath,
    )

    await overlay.showAsync()
  } catch (error) {
    console.error('Failed to show Facebook player profile overlay:', error)
  }
}

export async function showFacebookOpponentProfileOverlay(
  container: HTMLElement,
  opponentPlayerId: string,
): Promise<void> {
  if (!isFacebookInstantGames()) {
    console.warn('Facebook Instant Overlay Views are unavailable outside Instant Games')
    return
  }

  const playerId = opponentPlayerId.trim()

  if (!playerId) {
    console.warn('Cannot show opponent profile overlay without a player ID')
    return
  }

  try {
    const overlayViews = FBInstant.overlayViews
    if (!overlayViews) {
      console.error('FBInstant.overlayViews is unavailable in this SDK/runtime')
      return
    }

    const xmlPath = 'overlays/opponent_profile.xml'
    const cssPath = 'overlays/styles.css'

    console.log('Creating Facebook opponent profile overlay:', {
      xmlPath,
      cssPath,
      opponentPlayerId: playerId,
    })

    const overlay = await overlayViews.createOverlayViewAsync(
      xmlPath,
      container,
      'width: 100%; height: 180px; border: none;',
      cssPath,
    )

    await overlay.showAsync()
  } catch (error) {
    console.error('Failed to show Facebook opponent profile overlay:', error)
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
