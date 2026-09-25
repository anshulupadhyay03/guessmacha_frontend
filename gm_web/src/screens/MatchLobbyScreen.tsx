import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGameDetails } from '../hooks/useGameDetails'
import { submitSecret } from '../platform/api/gameApi'
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
      <span className="grid size-5 place-items-center rounded-full border-2 border-[#f59e0b]">
        <span className="size-2 animate-pulse rounded-full bg-[#f59e0b]" />
      </span>
    )
  }

  return (
    <svg
      className={`size-5 shrink-0 ${muted ? 'text-white/20' : 'text-[#10b981]'}`}
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

function PlayerAvatar({
  playerName,
  playerImageUrl,
}: {
  playerName: string
  playerImageUrl?: string | null
}) {
  const [imageFailed, setImageFailed] = useState(false)

  const initials = playerName
    .split(/\s+|[_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'P'

  const shouldRenderImage = Boolean(playerImageUrl) && !imageFailed

  if (shouldRenderImage) {
    return (
      <img
        className="size-10 rounded-full object-cover ring-2 ring-white/15"
        src={playerImageUrl ?? undefined}
        alt={playerName}
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span className="grid size-10 place-items-center rounded-full bg-[#004852] text-sm font-bold text-[#44bcd0] ring-2 ring-white/15">
      {initials}
    </span>
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
  const [isSubmittingSecret, setIsSubmittingSecret] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const currentUserId = session?.user?.id
  const host = game?.players.host
  const opponent = game?.players.opponent
  const hostSecretLocked = host?.secretLocked ?? false
  const opponentSecretLocked = opponent?.secretLocked ?? false
  const status = game?.status ?? 'waiting'

  const isOpponent = Boolean(currentUserId && opponent?.playerId && currentUserId === opponent.playerId)
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
    setSubmitError(null)
    setIsConfirmDialogOpen(true)
  }

  async function handleConfirmSecret() {
    if (!selectedSecret) return

    setIsSubmittingSecret(true)
    setSubmitError(null)

    try {
      const result = await submitSecret(gameId, selectedSecret.id)

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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to confirm secret')
    } finally {
      setIsSubmittingSecret(false)
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
    <section className="min-h-full bg-lobby-background font-lobby-body text-[#f4f1f7]" aria-live="polite">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="font-lobby-display text-[28px] leading-9 font-bold text-[#63d6ea]">Match Lobby</h1>
          <p className="mt-2 text-base text-[#c4c7d0]">Invite a friend to join.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-6">
              <div className="pointer-events-none absolute inset-0 bg-[#63d6ea]/5" />
              <div className="relative flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/4 text-3xl text-[#63d6ea]" aria-hidden="true">
                  ◉
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold tracking-[0.12em] text-[#63d6ea] uppercase">
                    Selected category
                  </span>
                  <h2 className="mt-1 truncate text-xl font-semibold text-white">
                    {game?.category.name ?? 'Loading category…'}
                    {game && (
                      <span className="font-normal text-[#c2c6d6]"> · {game.category.itemCount} items</span>
                    )}
                  </h2>
                </div>
              </div>

              <hr className="relative my-6 border-white/10" />

              <div className="relative">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold tracking-[0.12em] text-[#63d6ea] uppercase">
                    Match progress
                  </span>
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    disabled={loading}
                    className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#63d6ea] transition hover:bg-white/8 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d6ea]"
                    aria-label="Refresh game status"
                    title="Refresh game status"
                  >
                    <svg
                      className={`h-5 w-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-2] ${loading ? 'animate-spin' : ''}`}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" />
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
                        className={`flex items-center gap-3 ${isCurrent ? 'font-bold text-[#63d6ea]' : isComplete ? 'text-[#10b981]' : 'text-[#c4c7d0]'}`}
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
                  <p className="mt-3 text-sm leading-5 text-[#ffb4ab]" role="alert">
                    {error.message}
                  </p>
                )}
              </div>
            </article>
          </div>

          <div className="space-y-6 md:col-span-7">
            <article className="rounded-2xl border border-white/10 bg-white/4 p-6">
              <span className="block text-xs font-semibold tracking-[0.12em] text-[#c4c7d0] uppercase">
                Room code
              </span>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/4 p-3">
                <output className="min-w-0 truncate font-mono text-xl font-semibold tracking-[0.18em] text-white" aria-label="Room code">
                  {roomCode}
                </output>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="grid size-9 cursor-pointer place-items-center rounded-md text-[#63d6ea] transition hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d6ea]"
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
                    className="grid size-9 cursor-pointer place-items-center rounded-md text-[#63d6ea] transition hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d6ea]"
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
                <p className="mt-3 text-center text-xs text-[#10b981]">Room code copied.</p>
              )}
              {copyStatus === 'error' && (
                <p className="mt-3 text-center text-xs text-[#ffb4ab]" role="alert">
                  Couldn’t copy the room code. Please copy it manually.
                </p>
              )}
              <p className="mt-3 text-center text-xs font-semibold text-[#c4c7d0]">
                {timeUntil(game?.expiresAt) ?? 'Checking expiry…'}
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/4 p-6">
              <span className="block text-xs font-semibold tracking-[0.12em] text-[#c4c7d0] uppercase">
                Players
              </span>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/4 p-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      playerName={host?.playerName ?? 'Host'}
                      playerImageUrl={host?.playerImageUrl}
                    />
                    <div>
                      <strong className="block text-white">{host?.playerName ?? 'Host'}</strong>
                      <small className="text-xs text-[#10b981]">Host</small>
                    </div>
                  </div>
                  <CheckIcon muted={!hostSecretLocked} />
                </div>

                <div
                  className={`flex items-center justify-between rounded-xl border bg-white/4 p-3 ${
                    opponent ? 'border-white/10' : 'border-dashed border-white/12 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      playerName={opponent?.playerName ?? 'Waiting for player'}
                      playerImageUrl={opponent?.playerImageUrl}
                    />
                    <div>
                      <strong className={opponent ? 'block text-white' : 'block italic text-[#c4c7d0]'}>
                        {opponent ? opponent.playerName : 'Waiting for player'}
                      </strong>
                      <small className="text-xs text-[#c4c7d0]">Opponent</small>
                    </div>
                  </div>

                  {opponent ? (
                    <CheckIcon muted={!opponentSecretLocked} />
                  ) : (
                    <span className="size-2 animate-pulse rounded-full bg-[#f59e0b]" />
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-white/10 bg-[#100d13]/95 px-4 pt-4 pb-2 backdrop-blur sm:-mx-6 sm:px-6">
          <button
            type="button"
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#63d6ea] text-xl font-semibold text-[#00363e] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d6ea] shadow-[0_4px_16px_rgba(99,214,234,0.2)]"
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
