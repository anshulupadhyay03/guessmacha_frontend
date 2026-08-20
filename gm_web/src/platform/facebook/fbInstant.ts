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
  if (!isFacebookInstantGames()) {
    console.log('Running outside Facebook Instant Games')
    return null
  }

  try {
    await FBInstant.initializeAsync()

    FBInstant.setLoadingProgress(50)
    FBInstant.setLoadingProgress(100)

    await FBInstant.startGameAsync()

    console.log('Facebook Instant Game initialized successfully')
    console.log('SDK Version:', FBInstant.getSDKVersion())
    console.log('Platform:', FBInstant.getPlatform())
    console.log('Locale:', FBInstant.getLocale())

    const player = FBInstant.player
    console.log('FBInstant player object:', player)

    let id = ''

    try {
      id = player.getID() || ''
      console.log('Direct player ID:', id)
    } catch (error) {
      console.error('getID failed:', error)
    }

    // SDK 8 does not expose player.getName() or player.getPhoto().
    // Do not call these removed APIs. The supported player identity API
    // gives us the player ID; signed player info is used separately for
    // backend authentication.
        // Facebook Instant Games exposes the current player's profile as
    // `player.name` and `player.photo` properties. These are properties,
    // not getName()/getPhoto() methods.
    const playerProfile = player as typeof player & {
      name?: string
      photo?: string
    }

    const platformPlayer: PlatformPlayer = {
      id,
      name: playerProfile.name || '',
      photo: playerProfile.photo || undefined,
    }

    console.log('Direct player name:', playerProfile.name)
    console.log('Direct player photo:', playerProfile.photo)

    return platformPlayer
  } catch (error) {
    console.error('Failed to initialize Instant Game:', error)
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
