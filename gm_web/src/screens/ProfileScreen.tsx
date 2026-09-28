import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function DefaultAvatarIcon({ className = 'size-10' }: { className?: string }) {
  return (
    <svg className={`${className} text-[#a9afbc]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ProfileAvatar({ imageUrl, name }: { imageUrl?: string | null; name?: string }) {
  const [hasError, setHasError] = useState(false);

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={name || 'User profile'}
        onError={() => setHasError(true)}
        className="size-20 sm:size-24 rounded-full object-cover border-2 border-[#63d6ea]/50 shadow-[0_0_24px_rgba(99,214,234,0.25)]"
      />
    );
  }

  return (
    <div
      className="grid size-20 sm:size-24 place-items-center rounded-full bg-white/8 border-2 border-white/15"
      aria-label={name || 'User profile'}
    >
      <DefaultAvatarIcon className="size-10 sm:size-12 text-[#a9afbc]" />
    </div>
  );
}

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
    <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#f5f7fb]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-center border-b border-white/8 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-white">Profile</h1>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-[#1e1924] p-6 text-center gap-3">
            <div className="size-20 rounded-full bg-white/10" />
            <div className="h-6 w-32 rounded bg-white/10" />
            <div className="h-4 w-48 rounded bg-white/10" />
          </div>
          <div className="h-36 rounded-2xl border border-white/8 bg-[#1e1924] p-4" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* User Identity Card */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#1e1924] p-6 text-center shadow-md">
            <div className="mb-3.5">
              <ProfileAvatar imageUrl={avatarUrl} name={username} />
            </div>

            <div className="flex flex-col items-center gap-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {username}
              </h2>
              {user?.email && (
                <p className="text-xs text-[#a9afbc] font-medium">{user.email}</p>
              )}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-[#63d6ea]/10 border border-[#63d6ea]/30 px-3 py-1 text-xs font-bold text-[#63d6ea]">
                Detective
              </span>
              <span className="rounded-full bg-white/8 border border-white/10 px-3 py-1 text-xs font-semibold text-[#c5cad4]">
                Online
              </span>
            </div>
          </div>

          {/* More Profile Information Notice Card */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1e1924] p-5 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-[#63d6ea]/15 text-lg" aria-hidden="true">
                📊
              </span>
              <h3 className="text-base font-bold text-white">Profile Overview</h3>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-start gap-3">
                <span className="text-base mt-0.5" aria-hidden="true">ℹ️</span>
                <div>
                  <p className="text-sm font-semibold text-[#63d6ea]">
                    We are working on fetching more profile-related information.
                  </p>
                  <p className="mt-1 text-xs text-[#a9afbc] leading-relaxed">
                    Detailed statistics such as total matches played, win rate, detective ranks, and achievements will appear here in an upcoming update.
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col rounded-xl border border-white/6 bg-white/[0.03] p-3 text-center">
                <span className="text-[11px] font-semibold text-[#a9afbc] uppercase tracking-wider">
                  Matches
                </span>
                <span className="mt-1 text-lg font-bold text-white/40">—</span>
              </div>
              <div className="flex flex-col rounded-xl border border-white/6 bg-white/[0.03] p-3 text-center">
                <span className="text-[11px] font-semibold text-[#a9afbc] uppercase tracking-wider">
                  Win Rate
                </span>
                <span className="mt-1 text-lg font-bold text-white/40">—</span>
              </div>
              <div className="flex flex-col rounded-xl border border-white/6 bg-white/[0.03] p-3 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-[#a9afbc] uppercase tracking-wider">
                  Detective Rank
                </span>
                <span className="mt-1 text-sm font-bold text-amber-300/80">Novice</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

