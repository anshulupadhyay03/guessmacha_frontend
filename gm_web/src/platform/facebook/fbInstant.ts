import type { PlatformPlayer } from '../../types/fbinstant'

export function isFacebookInstantGames(): boolean {
  return import.meta.env.PROD && typeof FBInstant !== 'undefined'
}
export async function initializeFacebookInstant(): Promise<PlatformPlayer | null> {
  if (!isFacebookInstantGames()) {
    console.log('Running outside Facebook Instant Games')
    return null
  }

  try {
    await FBInstant.initializeAsync()

    console.log('FBInstant initialized')
    console.log('SDK Version:', FBInstant.getSDKVersion())
    console.log('Platform:', FBInstant.getPlatform())
    console.log('Locale:', FBInstant.getLocale())

    // This is the most important diagnostic for the current issue. Meta can
    // expose the FBInstant.player object while selectively disabling player
    // APIs for the current app/user/session.
    try {
      const supportedApis = FBInstant.getSupportedAPIs()
      console.log('Supported FBInstant APIs:', supportedApis)
      console.log('Player APIs supported:', {
        playerGetID: supportedApis.includes('playerGetID'),
        playerGetName: supportedApis.includes('playerGetName'),
        playerGetPhoto: supportedApis.includes('playerGetPhoto'),
        playerGetSignedPlayerInfoAsync: supportedApis.includes('playerGetSignedPlayerInfoAsync'),
      })
    } catch (error) {
      console.error('getSupportedAPIs failed:', error)
    }

    FBInstant.setLoadingProgress(100)

    console.log('Starting Facebook Instant Game...')
    await FBInstant.startGameAsync()
    console.log('Facebook Instant Game started')

    const player = FBInstant.player
    console.log('FBInstant player object:', player)

    let id: string | null = null
    let name: string | null = null
    let photo: string | null = null

    try {
      id = player.getID()
      console.log('Direct player ID:', id)
    } catch (error) {
      console.error('getID failed:', error)
    }

    try {
      name = player.getName()
      console.log('Direct player name:', name)
    } catch (error) {
      console.error('getName failed:', error)
    }

    try {
      photo = player.getPhoto()
      console.log('Direct player photo:', photo)
    } catch (error) {
      console.error('getPhoto failed:', error)
    }

    // The TypeScript SDK definition in this project does not expose
    // getSignedPlayerInfoAsync, although the runtime FBInstant player object
    // does expose it. Use a narrow local runtime type instead of changing the
    // global SDK declaration just for this diagnostic/authentication call.
    type SignedPlayerInfoRuntime = {
      getPlayerID(): string
      getSignature(): string
    }

    type PlayerWithSignedInfo = typeof player & {
      getSignedPlayerInfoAsync?: (requestPayload?: string) => Promise<SignedPlayerInfoRuntime>
    }

    const playerWithSignedInfo = player as PlayerWithSignedInfo

    if (typeof playerWithSignedInfo.getSignedPlayerInfoAsync === 'function') {
      try {
        const signedInfo = await playerWithSignedInfo.getSignedPlayerInfoAsync('guessmacha_player_bootstrap')
        console.log('Signed player info result:', {
          playerId: signedInfo.getPlayerID(),
          hasSignature: Boolean(signedInfo.getSignature()),
        })

        // Use the signed player ID as a diagnostic fallback if the direct
        // player API returned null.
        if (!id) {
          id = signedInfo.getPlayerID()
          console.log('Using signed player ID fallback:', id)
        }
      } catch (error) {
        console.error('getSignedPlayerInfoAsync failed:', error)
      }
    } else {
      console.warn('getSignedPlayerInfoAsync is not available at runtime')
    }

    const platformPlayer: PlatformPlayer = {
      id,
      name,
      photo,
    }

    console.log('Facebook player:', platformPlayer)

    return platformPlayer
  } catch (error) {
    console.error('Facebook Instant Games initialization failed:', error)
    return null
  }
}
