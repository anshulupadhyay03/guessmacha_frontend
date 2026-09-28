import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameDetails } from '../../../shared/types/game';
import { gameService } from '../platform/api/gameApi';
import { supabase } from '../platform/supabase/client';

interface UseGameDetailsResult {
  game: GameDetails | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useGameDetails(gameId: string): UseGameDetailsResult {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);

  const fetchGame = useCallback(
    async (isInitialOrManual = false) => {
      if (!gameId) return;

      if (isInitialOrManual) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await gameService.getGame(gameId);
        if (!isMountedRef.current) return;
        setGame(data);
      } catch (caughtError) {
        if (!isMountedRef.current) return;
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error('Unable to load game'),
        );
      } finally {
        if (isMountedRef.current && isInitialOrManual) {
          setLoading(false);
        }
      }
    },
    [gameId],
  );

  const refresh = useCallback(async () => {
    await fetchGame(true);
  }, [fetchGame]);

  useEffect(() => {
    if (!gameId) return;

    isMountedRef.current = true;

    // 1. Initial authoritative load
    void Promise.resolve().then(() => fetchGame(true));

    // 2. Debounced state refresh when Realtime notifies of changes
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleRealtimeChange = () => {
      if (!isMountedRef.current) return;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        if (isMountedRef.current) {
          void fetchGame(false);
        }
      }, 100);
    };

    // 3. Supabase Realtime channel subscription across game & game_players
    const channel = supabase
      .channel(`game_details:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('[Lobby Realtime] games event:', payload);
          handleRealtimeChange();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('[Lobby Realtime] game_players event:', payload);
          handleRealtimeChange();
        },
      )
      .subscribe((status) => {
        console.log('[Lobby Realtime] subscription status:', status);
      });

    // 4. Cleanup when unmounting or gameId change
    return () => {
      isMountedRef.current = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      void supabase.removeChannel(channel);
    };
  }, [gameId, fetchGame]);

  return { game, loading, error, refresh };
}
