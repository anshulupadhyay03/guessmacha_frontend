import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';

interface UseRealtimeChannelOptions {
  /** Fired for every broadcast/postgres_changes payload received on this channel. */
  onEvent?: (payload: any) => void;
  /** Fired when presence state changes (join/leave/sync). */
  onPresenceChange?: (state: Record<string, any>) => void;
  /** Disable the subscription without unmounting the component. */
  enabled?: boolean;
}

/**
 * useRealtimeChannel
 * Generic lifecycle wrapper around a Supabase Realtime channel.
 * Subscribes on mount (or when `enabled` flips true), always unsubscribes on
 * unmount/dependency change. Screens should still do a one-time fetch for the
 * current state on mount — realtime augments a source-of-truth fetch, it
 * doesn't replace it (see the frontend spec's Realtime Flow section).
 *
 * TODO: confirm exact channel naming + payload event names with backend
 * (e.g. `match:{matchId}`, `match:{matchId}:chat`, `profile:{userId}`,
 * `notifications:{userId}`, `presence:friends`) and adjust the `.on(...)`
 * calls below (broadcast vs postgres_changes vs presence) accordingly.
 */
export function useRealtimeChannel(
  channelName: string | null,
  { onEvent, onPresenceChange, enabled = true }: UseRealtimeChannelOptions,
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelName || !enabled) return;

    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: '*' }, ({ payload }) => onEvent?.(payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: '*' }, (payload) =>
        onEvent?.(payload),
      )
      .on('presence', { event: 'sync' }, () => {
        onPresenceChange?.(channel.presenceState());
      });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, enabled]);

  return channelRef;
}

export default useRealtimeChannel;