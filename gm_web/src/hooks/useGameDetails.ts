import { useCallback, useEffect, useState } from 'react'
import { getGame, type GameDetails } from '../platform/api/gameApi'

interface UseGameDetailsResult {
  game: GameDetails | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useGameDetails(gameId: string): UseGameDetailsResult {
  const [game, setGame] = useState<GameDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setGame(await getGame(gameId))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error('Unable to load game'))
    } finally {
      setLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    void Promise.resolve().then(refresh)
  }, [refresh])

  return { game, loading, error, refresh }
}
