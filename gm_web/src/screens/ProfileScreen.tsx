import { useAuth } from '../hooks/useAuth';
import PlayerAvatar from '../components/PlayerAvatar';
import FacebookPlayerName from '../platform/facebook/FacebookPlayerName';

// Inline text style for the isMe profile-name overlay (your own name).
// Mirrors the <h2> below (20px black #171d1e, single line); margin:-8px
// offsets the overlay iframe's default 8px body margin so the name never
// gets clipped into a scroller.
const PROFILE_NAME_TEXT_STYLE =
  'font-family: Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 900; color: #171d1e; letter-spacing: -0.025em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; line-height: 1.4; margin: -8px; padding: 0;'

export default function ProfileScreen() {
  const { session, loading } = useAuth();

  const user = session?.user;
  const metadata = user?.user_metadata;
  const username =
    (metadata?.name as string | undefined) ||
    (metadata?.full_name as string | undefined) ||
    (metadata?.user_name as string | undefined) ||
    (metadata?.username as string | undefined) ||
    (user?.email ? user.email.split('@')[0] : undefined) ||
    'Player';

  const avatarUrl =
    (metadata?.avatar_url as string | undefined) ||
    (metadata?.picture as string | undefined) ||
    null;

  return (
    <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-center border-b border-[#bbc9cc] pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">Profile</h1>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#bbc9cc] bg-white p-6 text-center gap-3">
            <div className="size-20 rounded-full bg-[#eff4f7]" />
            <div className="h-6 w-32 rounded bg-[#eff4f7]" />
            <div className="h-4 w-48 rounded bg-[#eff4f7]" />
          </div>
          <div className="h-36 rounded-2xl border border-[#bbc9cc] bg-white p-4" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* User Identity Card */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#bbc9cc] bg-white p-6 text-center shadow-xs">
            <div className="mb-3.5">
              <PlayerAvatar
                isMe
                imageUrl={avatarUrl}
                name={username}
                className="size-20 sm:size-24 shrink-0 rounded-full bg-[#eff4f7] border-2 border-[#006875] shadow-[0_4px_16px_rgba(0,104,117,0.15)]"
                iconSize="size-10"
              />
            </div>

            <div className="flex w-full flex-col items-center gap-1">
              <h2 className="flex w-full items-center justify-center">
                <FacebookPlayerName
                  isMe
                  fallbackName={username}
                  className="w-full h-8 justify-center"
                  textClassName="truncate text-xl sm:text-2xl font-black tracking-tight text-[#171d1e] text-center"
                  textStyle={PROFILE_NAME_TEXT_STYLE}
                />
              </h2>
              {user?.email && (
                <p className="text-xs text-[#3c494c] font-medium">{user.email}</p>
              )}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-[#e9eff1] border border-[#006875]/30 px-3 py-1 text-xs font-bold text-[#006875]">
                Detective
              </span>
              <span className="rounded-full bg-[#e6f6ee] border border-[#0b6b45]/30 px-3 py-1 text-xs font-semibold text-[#0b6b45]">
                Online
              </span>
            </div>
          </div>

          {/* More Profile Information Notice Card */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#bbc9cc] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-[#02c2d9]/15 text-lg" aria-hidden="true">
                📊
              </span>
              <h3 className="text-base font-bold text-[#171d1e]">Profile Overview</h3>
            </div>

            <div className="rounded-xl border border-[#bbc9cc] bg-[#eff4f7] p-4">
              <div className="flex items-start gap-3">
                <span className="text-base mt-0.5" aria-hidden="true">ℹ️</span>
                <div>
                  <p className="text-sm font-semibold text-[#006875]">
                    We are working on fetching more profile-related information.
                  </p>
                  <p className="mt-1 text-xs text-[#3c494c] leading-relaxed">
                    Detailed statistics such as total matches played, win rate, detective ranks, and achievements will appear here in an upcoming update.
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col rounded-xl border border-[#bbc9cc] bg-[#eff4f7]/60 p-3 text-center">
                <span className="text-[11px] font-semibold text-[#6c797c] uppercase tracking-wider">
                  Matches
                </span>
                <span className="mt-1 text-lg font-bold text-[#171d1e]/40">—</span>
              </div>
              <div className="flex flex-col rounded-xl border border-[#bbc9cc] bg-[#eff4f7]/60 p-3 text-center">
                <span className="text-[11px] font-semibold text-[#6c797c] uppercase tracking-wider">
                  Win Rate
                </span>
                <span className="mt-1 text-lg font-bold text-[#171d1e]/40">—</span>
              </div>
              <div className="flex flex-col rounded-xl border border-[#bbc9cc] bg-[#eff4f7]/60 p-3 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-[#6c797c] uppercase tracking-wider">
                  Detective Rank
                </span>
                <span className="mt-1 text-sm font-bold text-[#904d00]">Novice</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

