import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGameDetails } from '../hooks/useGameDetails'
import { useSubmitSecret } from '../hooks/useSubmitSecret'
import type { PuzzleItem } from '../features/chooseSecret/types'
import type {
  GameDetails,
  GetGameRequest,
  GetGameResponse,
  LobbyPlayer,
  LobbyCategory,
} from '../features/matchLobby/types'
import ChooseSecretModal from '../components/ChooseSecretModal'
import ConfirmSecretDialog from '../components/ConfirmSecretDialog'
import PlayerAvatar from '../components/PlayerAvatar'
import FacebookPlayerName from '../platform/facebook/FacebookPlayerName'
import CategoryIcon from '../components/CategoryIcon'

// Inline text style for the isMe profile-name overlay so your own name
// renders in lobby typography (16px bold #171d1e, single line). Mirrors
// public/overlays/matchlobby/match_lobby_player_name.css, which styles the
// FB-id custom overlay (overlays/player_name.xml) used for other players.
// margin:-8px offsets the overlay iframe's default 8px body margin so the
// name never gets clipped into a scroller (same trick as the CSS file's
// .playerNameContainer margin:-8px for the custom-overlay path).
const LOBBY_PLAYER_NAME_TEXT_STYLE =
  'font-family: Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #171d1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; margin: -8px; padding: 0;'
const LOBBY_PLAYER_NAME_CSS_PATH = 'overlays/matchlobby/match_lobby_player_name.css'

export type {
  GameDetails,
  GetGameRequest,
  GetGameResponse,
  LobbyPlayer,
  LobbyCategory,
}

interface MatchLobbyScreenProps {
  gameId: string
  roomCode: string
  onStartGame?: () => void
  onNavigateToGameZone?: () => void
}

function timeUntil(expiresAt?: string): string | null {
  if (!expiresAt) return null

  const milliseconds = new Date(expiresAt).getTime() - Date.now()

  if (milliseconds <= 0) return 'Expired'

  const totalMinutes = Math.ceil(milliseconds / 60_000)
  return `Expires in ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
}

function CheckIcon({ muted = false, active = false }: { muted?: boolean; active?: boolean }) {
  if (active) {
    return (
      <span className="grid size-5 place-items-center rounded-full border-2 border-[#006875]">
        <span className="size-2 animate-pulse rounded-full bg-[#006875]" />
      </span>
    )
  }

  return (
    <svg
      className={`size-5 shrink-0 ${muted ? 'text-[#bbc9cc]' : 'text-[#0b6b45]'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  )
}

export default function MatchLobbyScreen({
  gameId,
  roomCode,
  onStartGame,
  onNavigateToGameZone,
}: MatchLobbyScreenProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const { game, loading, error, refresh } = useGameDetails(gameId)
  const { session } = useAuth()

  const [isChooseSecretOpen, setIsChooseSecretOpen] = useState(false)
  const [selectedSecret, setSelectedSecret] = useState<PuzzleItem | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const {
    submitSecret,
    loading: isSubmittingSecret,
    error: submitSecretHookError,
    clearError: clearSubmitSecretError,
  } = useSubmitSecret()
  const [localSubmitError, setLocalSubmitError] = useState<string | null>(null)
  const submitError = localSubmitError || (submitSecretHookError ? submitSecretHookError.message : null)

  const currentUserId = session?.user?.id
  const host = game?.players.host
  const opponent = game?.players.opponent
  const hostSecretLocked = host?.secretLocked ?? false
  const opponentSecretLocked = opponent?.secretLocked ?? false
  const status = game?.status ?? 'waiting'

  // NOTE: isOpponent / isHost describe the CURRENT USER's seat, not the card.
  // Each is true only when viewing your own card, so passing them as
  // PlayerAvatar's `isMe` routes correctly in both seats:
  //   - I'm the host:    host card -> profile overlay (isMe), opponent card -> FB-id overlay.
  //   - I'm the opponent: host card -> FB-id overlay, opponent card -> profile overlay (isMe).
  const isOpponent = Boolean(currentUserId && opponent?.playerId && currentUserId === opponent.playerId)
  const isHost = Boolean(currentUserId && host?.playerId && currentUserId === host.playerId)

  // Facebook-scoped IDs for the profile-picture overlays. Same convention as
  // GameZoneScreen: the backend-provided playerName carries the FB id consumed
  // by overlays/profile_pic.xml, while the auth-level playerId only identifies
  // which card belongs to the current user (rendered via the profile overlay).
  const hostPlayerName = host?.playerName
  const opponentPlayerName = opponent?.playerName
  const hostInitialData = useMemo(() => {
    if (isHost || !hostPlayerName) return undefined
    return { playerId: hostPlayerName }
  }, [isHost, hostPlayerName])
  const opponentInitialData = useMemo(() => {
    if (isOpponent || !opponentPlayerName) return undefined
    return { playerId: opponentPlayerName }
  }, [isOpponent, opponentPlayerName])
  const mySecretLocked = isOpponent ? opponentSecretLocked : hostSecretLocked
  const canChooseSecret = status === 'secret_selection' && !mySecretLocked

  const matchProgress = useMemo(() => {
    if (status === 'waiting') {
      return {
        index: 0,
        key: 'waiting',
        label: 'Waiting for player',
        buttonLabel: 'Choose Secret',
        buttonDisabled: true,
      }
    }

    if (status === 'secret_selection') {
      if (!mySecretLocked) {
        return {
          index: 1,
          key: isOpponent ? 'opponent_secret_selection' : 'host_secret_selection',
          label: isOpponent ? 'Your Secret Selection' : 'Host Secret Selection',
          buttonLabel: 'Choose Secret',
          buttonDisabled: false,
        }
      }

      return {
        index: 2,
        key: 'waiting_for_other_secret',
        label: 'Waiting for opponent',
        buttonLabel: 'Start Game',
        buttonDisabled: true,
      }
    }

    if (status === 'in_progress') {
      return {
        index: 3,
        key: 'ready',
        label: 'Ready to Begin',
        buttonLabel: 'Start Game',
        buttonDisabled: false,
      }
    }

    return {
      index: 0,
      key: 'waiting',
      label: 'Waiting for player',
      buttonLabel: 'Start Game',
      buttonDisabled: true,
    }
  }, [status, mySecretLocked, isOpponent])

  function handleMainAction() {
    if (matchProgress.buttonLabel === 'Choose Secret' && canChooseSecret) {
      setIsChooseSecretOpen(true)
      return
    }

    if (matchProgress.buttonLabel === 'Start Game' && !matchProgress.buttonDisabled) {
      if (onNavigateToGameZone) {
        onNavigateToGameZone()
      } else {
        onStartGame?.()
      }
    }
  }

  function handleSelectSecret(secret: PuzzleItem) {
    setSelectedSecret(secret)
    setLocalSubmitError(null)
    clearSubmitSecretError()
    setIsConfirmDialogOpen(true)
  }

  async function handleConfirmSecret() {
    if (!selectedSecret) return

    setLocalSubmitError(null)
    clearSubmitSecretError()

    const result = await submitSecret(gameId, selectedSecret.id)
    if (!result) return

    setIsConfirmDialogOpen(false)
    setIsChooseSecretOpen(false)

    if (result.gameStatus === 'in_progress' && result.waitingForOpponent === false) {
      if (onNavigateToGameZone) {
        onNavigateToGameZone()
      } else {
        onStartGame?.()
      }
    } else {
      await refresh()
    }
  }

  const progressSteps = [
    'Waiting for player',
    'Secret Selection',
    'Waiting for opponent',
    'Ready to Begin',
  ]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  async function handleShare() {
    if (!navigator.share) return handleCopy()

    try {
      await navigator.share({
        title: 'Join my GuessMate game',
        text: `Join my game with room code: ${roomCode}`,
      })
    } catch {
      // Dismissing the browser's native share dialog does not require feedback.
    }
  }

  return (
    <section className="min-h-full bg-[#f5fafc] font-lobby-body text-[#171d1e]" aria-live="polite">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="font-lobby-display text-[28px] leading-9 font-bold text-[#171d1e]">Match Lobby</h1>
          <p className="mt-2 text-base text-[#3c494c]">Invite a friend to join.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <article className="relative overflow-hidden rounded-2xl border border-[#bbc9cc] bg-white p-6 shadow-xs">
              <div className="relative flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center" aria-hidden="true">
                  <CategoryIcon
                    category={game?.category}
                    className="size-16 object-contain select-none pointer-events-none"
                  />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold tracking-[0.12em] text-[#006875] uppercase">
                    Selected category
                  </span>
                  <h2 className="mt-1 truncate text-xl font-semibold text-[#171d1e]">
                    {game?.category.name ?? 'Loading category…'}
                    {game && (
                      <span className="font-normal text-[#6c797c]"> · {game.category.itemCount} items</span>
                    )}
                  </h2>
                </div>
              </div>

              <hr className="relative my-6 border-[#bbc9cc]" />

              <div className="relative">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold tracking-[0.12em] text-[#006875] uppercase">
                    Match progress
                  </span>
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    disabled={loading}
                    aria-busy={loading}
                    aria-label="Refresh game status"
                    title="Refresh game status"
                    className="group -m-1.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#006875] transition-colors hover:bg-[#006875]/8 hover:text-[#004b55] active:bg-[#006875]/12 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875] motion-reduce:transition-none"
                  >
                    <svg
                      className={`size-5.5 fill-none stroke-current stroke-[2.25] transition-transform duration-300 motion-reduce:transition-none ${loading ? 'animate-spin' : 'group-hover:rotate-90'
                        }`}
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 text-base">
                  {progressSteps.map((step, index) => {
                    const isCurrent = matchProgress.index === index
                    const isComplete = matchProgress.index > index
                    const isReadyStep = index === progressSteps.length - 1

                    return (
                      <div
                        key={step}
                        className={`flex items-center gap-3 ${isCurrent ? 'font-bold text-[#006875]' : isComplete ? 'text-[#0b6b45]' : 'text-[#6c797c]'}`}
                      >
                        {isCurrent && !isReadyStep ? (
                          <CheckIcon active />
                        ) : isComplete || isReadyStep ? (
                          <CheckIcon />
                        ) : (
                          <CheckIcon muted />
                        )}
                        <span>{step}</span>
                      </div>
                    )
                  })}
                </div>

                {error && (
                  <p className="mt-3 text-sm leading-5 text-[#ba1a1a]" role="alert">
                    {error.message}
                  </p>
                )}
              </div>
            </article>
          </div>

          <div className="space-y-6 md:col-span-7">
            <article className="rounded-2xl border border-[#bbc9cc] bg-white p-6 shadow-xs">
              <span className="block text-xs font-semibold tracking-[0.12em] text-[#36656e] uppercase">
                Room code
              </span>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#bbc9cc] bg-[#eff4f7] p-3">
                <output className="min-w-0 truncate font-mono text-xl font-semibold tracking-[0.18em] text-[#006875]" aria-label="Room code">
                  {roomCode}
                </output>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="grid size-9 cursor-pointer place-items-center rounded-md text-[#006875] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875]"
                    onClick={() => void handleCopy()}
                    aria-label="Copy room code"
                    title="Copy code"
                  >
                    <svg className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-2]" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="grid size-9 cursor-pointer place-items-center rounded-md text-[#006875] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875]"
                    onClick={() => void handleShare()}
                    aria-label="Share room code"
                    title="Share"
                  >
                    <svg className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-2]" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
                    </svg>
                  </button>
                </div>
              </div>

              {copyStatus === 'copied' && (
                <p className="mt-3 text-center text-xs text-[#0b6b45]">Room code copied.</p>
              )}
              {copyStatus === 'error' && (
                <p className="mt-3 text-center text-xs text-[#ba1a1a]" role="alert">
                  Couldn’t copy the room code. Please copy it manually.
                </p>
              )}
              <p className="mt-3 text-center text-xs font-semibold text-[#3c494c]">
                {timeUntil(game?.expiresAt) ?? 'Checking expiry…'}
              </p>
            </article>

            <article className="rounded-2xl border border-[#bbc9cc] bg-white p-6 shadow-xs">
              <span className="block text-xs font-semibold tracking-[0.12em] text-[#36656e] uppercase">
                Players
              </span>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between rounded-xl border border-[#bbc9cc] bg-[#eff4f7]/50 p-3">
                  {/* flex-1 lets the name host grow into the row's free space.
                      Without it the name sizes to its (often shorter) fallback
                      text and the overlay name clips, e.g. "Anshul" -> "A.". */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <PlayerAvatar
                      isMe={isHost}
                      initialData={hostInitialData}
                      imageUrl={host?.playerImageUrl}
                      name={host?.playerName ?? 'Host'}
                      className="size-10 shrink-0 rounded-full bg-[#eff4f7] text-[#006875] ring-2 ring-[#bbc9cc]"
                      iconSize="size-5"
                      xmlPath="overlays/profile_pic.xml"
                      cssPath="overlays/profile_pic.css"
                    />
                    <div className="min-w-0 flex-1">
                      <FacebookPlayerName
                        isMe={isHost}
                        initialData={hostInitialData}
                        fallbackName={host?.playerName ?? 'Host'}
                        className="w-full h-6"
                        textClassName="truncate text-base font-bold text-[#171d1e]"
                        textStyle={LOBBY_PLAYER_NAME_TEXT_STYLE}
                        overlayPath="overlays/player_name.xml"
                        overlayCassPath={LOBBY_PLAYER_NAME_CSS_PATH}
                      />
                      <small className="text-xs text-[#0b6b45]">Host</small>
                    </div>
                  </div>
                  <CheckIcon muted={!hostSecretLocked} />
                </div>

                <div
                  className={`flex items-center justify-between rounded-xl border p-3 ${opponent ? 'border-[#bbc9cc] bg-[#eff4f7]/50' : 'border-dashed border-[#bbc9cc] bg-[#eff4f7]/20 opacity-60'
                    }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <PlayerAvatar
                      isMe={isOpponent}
                      initialData={opponentInitialData}
                      imageUrl={opponent?.playerImageUrl}
                      name={opponent?.playerName ?? 'Waiting for player'}
                      className="size-10 shrink-0 rounded-full bg-[#eff4f7] text-[#006875] ring-2 ring-[#bbc9cc]"
                      iconSize="size-5"
                      xmlPath="overlays/profile_pic.xml"
                      cssPath="overlays/profile_pic.css"
                    />
                    <div className="min-w-0 flex-1">
                      <FacebookPlayerName
                        isMe={isOpponent}
                        initialData={opponentInitialData}
                        fallbackName={opponent ? opponent.playerName : 'Waiting for player'}
                        className="w-full h-6"
                        textClassName={
                          opponent
                            ? 'truncate text-base font-bold text-[#171d1e]'
                            : 'truncate text-base italic text-[#6c797c]'
                        }
                        textStyle={LOBBY_PLAYER_NAME_TEXT_STYLE}
                        overlayPath="overlays/player_name.xml"
                        overlayCassPath={LOBBY_PLAYER_NAME_CSS_PATH}
                      />
                      <small className="text-xs text-[#6c797c]">Opponent</small>
                    </div>
                  </div>

                  {opponent ? (
                    <CheckIcon muted={!opponentSecretLocked} />
                  ) : (
                    <span className="size-2 animate-pulse rounded-full bg-[#006875]" />
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-[#bbc9cc] bg-white/95 px-4 pt-4 pb-2 backdrop-blur sm:-mx-6 sm:px-6">
          <button
            type="button"
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#006875] text-xl font-semibold text-white transition hover:bg-[#005a66] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875] shadow-[0_4px_14px_rgba(0,104,117,0.2)]"
            onClick={handleMainAction}
            disabled={matchProgress.buttonDisabled}
          >
            {matchProgress.buttonLabel}
          </button>
        </div>
      </div>

      <ChooseSecretModal
        isOpen={isChooseSecretOpen}
        categoryId={game?.category.id}
        categoryName={game?.category.name}
        onClose={() => setIsChooseSecretOpen(false)}
        onConfirmSelection={handleSelectSecret}
      />

      <ConfirmSecretDialog
        isOpen={isConfirmDialogOpen}
        secret={selectedSecret}
        isSubmitting={isSubmittingSecret}
        error={submitError}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => void handleConfirmSecret()}
      />
    </section>
  )
}
