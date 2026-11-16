import { useProfile } from '../hooks/useProfile';
import CategoryIcon from '../components/CategoryIcon';
import FacebookPlayerName from '../platform/facebook/FacebookPlayerName';
import {
  MilitaryTechIcon,
  ArrowForwardIcon,
  SportsEsportsIcon,
  TrophyIcon,
  ShieldIcon,
  TrendingUpIcon,
  AnalyticsIcon,
  FireIcon,
  ChevronRightIcon,
  AlertCircleIcon,
} from '../components/icons';

// Inline text style for the isMe profile-name overlay (your own name).
const PROFILE_NAME_TEXT_STYLE =
  'font-family: Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; color: #171d1e; letter-spacing: -0.025em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.3; margin: -6px 0 0 -8px; padding: 0;';

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { data, loading, error, refresh } = useProfile();

  if (loading) {
    return (
      <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
        {/* Top Header */}
        <div className="relative mb-4 flex items-center justify-center border-b border-[#bbc9cc] pb-3">
          <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">Profile</h1>
        </div>

        {/* Loading Skeletons */}
        <div className="flex flex-col gap-4 animate-pulse">
          {/* Section 1 Skeleton: Player Identity */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#bbc9cc] shadow-xs">
            <div className="size-16 rounded-full bg-[#eff4f7] shrink-0" />
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="h-6 w-36 rounded bg-[#eff4f7]" />
              <div className="h-4 w-48 rounded bg-[#eff4f7]" />
            </div>
          </div>

          {/* Section 2 Skeleton: Rank Progression */}
          <div className="bg-white p-4 rounded-xl border border-[#bbc9cc] shadow-xs flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <div className="h-5 w-28 rounded bg-[#eff4f7]" />
              <div className="h-5 w-24 rounded bg-[#eff4f7]" />
            </div>
            <div className="h-3 w-full rounded-full bg-[#eff4f7]" />
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded bg-[#eff4f7]" />
              <div className="h-4 w-28 rounded bg-[#eff4f7]" />
            </div>
          </div>

          {/* Section 3 Skeleton: Game Statistics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="h-28 rounded-xl bg-white border border-[#bbc9cc] p-3 flex flex-col justify-between" />
            <div className="h-28 rounded-xl bg-white border border-[#bbc9cc] p-3 flex flex-col justify-between" />
            <div className="h-28 rounded-xl bg-white border border-[#bbc9cc] p-3 flex flex-col justify-between" />
          </div>

          {/* Section 4 Skeleton: Match Record */}
          <div className="h-36 rounded-xl bg-white border border-[#bbc9cc] p-4" />

          {/* Section 5 Skeleton: Longest Streak */}
          <div className="h-20 rounded-xl bg-white border border-[#bbc9cc] p-4" />

          {/* Section 6 Skeleton: Category Performance */}
          <div className="flex flex-col gap-3">
            <div className="h-5 w-36 rounded bg-[#eff4f7]" />
            <div className="h-20 rounded-xl bg-white border border-[#bbc9cc]" />
            <div className="h-20 rounded-xl bg-white border border-[#bbc9cc]" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
        {/* Top Header */}
        <div className="relative mb-4 flex items-center justify-center border-b border-[#bbc9cc] pb-3">
          <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">Profile</h1>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#bbc9cc] bg-white p-8 text-center shadow-xs">
          <div className="mb-3 text-[#ba1a1a]">
            <AlertCircleIcon className="size-10" />
          </div>
          <h2 className="text-lg font-bold text-[#171d1e]">Unable to load profile</h2>
          <p className="mt-1 text-sm text-[#3c494c] max-w-sm leading-relaxed">
            {error.message || 'An unexpected error occurred while fetching your profile.'}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#006875] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#005560] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Retrying…' : 'Tap to Retry'}
          </button>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
        <div className="relative mb-4 flex items-center justify-center border-b border-[#bbc9cc] pb-3">
          <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">Profile</h1>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#bbc9cc] bg-white p-8 text-center shadow-xs">
          <h2 className="text-lg font-bold text-[#171d1e]">No Profile Found</h2>
          <p className="mt-1 text-sm text-[#3c494c]">
            Profile information is currently unavailable.
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-4 rounded-xl bg-[#006875] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#005560]"
          >
            Tap to Refresh
          </button>
        </div>
      </section>
    );
  }

  const profile = data.profile;
  const rank = data.rank;
  const gameStatistics = data.gameStatistics;
  const matchRecord = data.matchRecord;
  const categoryPerformance = data.categoryPerformance ?? [];

  // Identity values with empty fallbacks
  const displayName = profile?.displayName?.trim() || 'Player';
  const avatarInitials = getInitials(displayName);
  const avatarUrl = profile?.avatarUrl?.trim() || null;

  // Rank progression values with empty fallbacks
  const rankName = rank?.name?.trim() || 'Beginner';
  const rankPoints = Number(rank?.points ?? 0) || 0;
  const nextRank = rank?.nextRank?.trim() || null;
  const nextRankPoints =
    rank?.nextRankPoints !== null && rank?.nextRankPoints !== undefined
      ? Number(rank.nextRankPoints)
      : null;
  const pointsToNextRank =
    rank?.pointsToNextRank !== null && rank?.pointsToNextRank !== undefined
      ? Number(rank.pointsToNextRank)
      : null;
  const rankProgress = Math.min(100, Math.max(0, Number(rank?.progress ?? 0) || 0));
  const isMasterRank = nextRank === null;

  // Game statistics with empty fallbacks
  const gamesPlayed = Number(gameStatistics?.gamesPlayed ?? 0) || 0;
  const winRate = Number(gameStatistics?.winRate ?? 0) || 0;

  // Current streak
  const currentStreakCount = Number(gameStatistics?.currentStreak?.count ?? 0) || 0;
  const currentStreakType = gameStatistics?.currentStreak?.type ?? null;
  const isWinningStreak = currentStreakType === 'win' && currentStreakCount > 0;
  const isLosingStreak = currentStreakType === 'loss' && currentStreakCount > 0;

  let streakText = 'No Active Streak';
  let streakSubtitle = 'Play a match to start';
  if (isWinningStreak) {
    streakText = `${currentStreakCount} ${currentStreakCount === 1 ? 'Win' : 'Wins'}`;
    streakSubtitle = 'Active winning streak';
  } else if (isLosingStreak) {
    streakText = `${currentStreakCount} ${currentStreakCount === 1 ? 'Loss' : 'Losses'}`;
    streakSubtitle = 'Win next duel to start streak';
  }

  // Longest streak
  const bestStreakCount = Number(gameStatistics?.bestStreak?.count ?? 0) || 0;
  const bestStreakType = gameStatistics?.bestStreak?.type ?? null;
  const hasBestStreak = bestStreakCount > 0;
  const longestStreakSubtitle =
    bestStreakType === 'win'
      ? 'Longest consecutive Victory record'
      : 'Longest consecutive defeat record';

  // Match record with empty fallbacks
  const matchWins = Number(matchRecord?.wins ?? 0) || 0;
  const matchLosses = Number(matchRecord?.losses ?? 0) || 0;
  const matchDraws = Number(matchRecord?.draws ?? 0) || 0;
  const totalCompleted = Number(matchRecord?.totalCompleted ?? 0) || 0;
  const distWins = Math.min(100, Math.max(0, Number(matchRecord?.distribution?.wins ?? 0) || 0));
  const distLosses = Math.min(100, Math.max(0, Number(matchRecord?.distribution?.losses ?? 0) || 0));
  const distDraws = Math.min(100, Math.max(0, Number(matchRecord?.distribution?.draws ?? 0) || 0));
  const hasDistribution = distWins > 0 || distLosses > 0 || distDraws > 0;

  return (
    <section className="relative mx-auto flex w-full max-w-[640px] flex-col px-4 pt-3 pb-8 text-left text-[#171d1e]">
      {/* Top Header */}
      <div className="relative mb-4 flex items-center justify-center border-b border-[#bbc9cc] pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#171d1e]">Profile</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Section 1: Player Identity Badge */}
        <section className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-[#bbc9cc] shadow-xs">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Avatar with fallback initials and active indicator */}
            <div className="relative flex-shrink-0 size-16 rounded-full bg-[#baebf5]/50 border-2 border-[#dee3e5] flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-[#006875] font-['Manrope'] font-bold text-xl tracking-tight select-none">
                  {avatarInitials}
                </span>
              )}
              <span
                className="absolute bottom-0 right-0 size-3.5 rounded-full bg-[#02c2d9] border-2 border-white shadow-xs"
                title="Active"
              />
            </div>

            {/* Player details */}
            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-center gap-1.5">
                <h2 className="font-['Manrope'] text-xl sm:text-2xl text-[#171d1e] font-bold tracking-tight truncate max-w-[220px] sm:max-w-[340px]">
                  <FacebookPlayerName
                    isMe
                    fallbackName={displayName}
                    className="w-full justify-start"
                    textClassName="truncate font-['Manrope'] text-xl sm:text-2xl font-bold text-[#171d1e] tracking-tight"
                    textStyle={PROFILE_NAME_TEXT_STYLE}
                  />
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#e3e9eb] text-[#171d1e] text-xs font-semibold uppercase tracking-wider">
                  <MilitaryTechIcon className="size-3.5 text-[#36656e] mr-1 shrink-0" />
                  {rankName.toLowerCase().includes('tier') || rankName.toLowerCase().includes('rank')
                    ? rankName
                    : `${rankName} Tier`}
                </span>
                <span className="text-xs text-[#3c494c] font-semibold">{rankPoints} RP</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Rank Progression Card */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#bbc9cc] shadow-xs flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#3c494c] uppercase tracking-wider font-semibold block">
                Current Tier
              </span>
              <span className="font-['Manrope'] text-xl sm:text-2xl text-[#171d1e] font-bold">
                {rankName.toLowerCase().includes('rank') ? rankName : `${rankName} Rank`}
              </span>
            </div>
            <div className="text-right">
              <span className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#006875]">
                {rankPoints}
              </span>
              {!isMasterRank && nextRankPoints !== null ? (
                <span className="text-sm text-[#3c494c] font-medium"> / {nextRankPoints} RP</span>
              ) : (
                <span className="text-sm text-[#3c494c] font-medium"> RP</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="w-full h-3 rounded-full bg-[#e3e9eb] overflow-hidden p-0.5 relative">
              <div
                className="h-full rounded-full bg-[#02c2d9] shadow-[0_0_10px_rgba(2,194,217,0.65)] transition-all duration-700 ease-out"
                style={{ width: `${isMasterRank ? 100 : rankProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-[#006875] font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#02c2d9] inline-block shadow-[0_0_6px_rgba(2,194,217,0.7)]" />
                {isMasterRank ? '100% Completed' : `${rankProgress}% Completed`}
              </span>
              {!isMasterRank && nextRank && pointsToNextRank !== null ? (
                <span className="text-xs font-semibold text-[#36656e] flex items-center gap-1">
                  {pointsToNextRank} RP to {nextRank}
                  <ArrowForwardIcon className="size-3.5" />
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#36656e]">Max Rank Achieved</span>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Game Statistics Grid */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Card 1: Games Played */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-[#bbc9cc] shadow-xs flex flex-col justify-between">
            <div className="size-7 rounded-lg bg-[#e9eff1] flex items-center justify-center text-[#36656e] mb-3">
              <SportsEsportsIcon className="size-4.5" />
            </div>
            <div>
              <div className="font-['Manrope'] text-2xl sm:text-3xl font-bold text-[#171d1e] leading-none mb-1">
                {gamesPlayed}
              </div>
              <div className="text-[11px] text-[#3c494c] font-semibold leading-tight">
                Games Played
              </div>
              <div className="text-[10px] text-[#6c797c] mt-0.5">Completed duels</div>
            </div>
          </div>

          {/* Card 2: Win Rate */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-[#bbc9cc] shadow-xs flex flex-col justify-between">
            <div className="size-7 rounded-lg bg-[#baebf5] flex items-center justify-center text-[#3c6b74] mb-3">
              <TrophyIcon className="size-4.5" />
            </div>
            <div>
              <div className="font-['Manrope'] text-2xl sm:text-3xl font-bold text-[#006875] leading-none mb-1">
                {winRate}%
              </div>
              <div className="text-[11px] text-[#3c494c] font-semibold leading-tight">
                Win Rate
              </div>
              <div className="text-[10px] text-[#6c797c] mt-0.5">Excluding draws</div>
            </div>
          </div>

          {/* Card 3: Current Streak */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-[#bbc9cc] shadow-xs flex flex-col justify-between">
            <div
              className={`size-7 rounded-lg flex items-center justify-center mb-3 ${
                isWinningStreak
                  ? 'bg-[#baebf5] text-[#006875]'
                  : isLosingStreak
                  ? 'bg-[#e3e9eb] text-[#3c494c]'
                  : 'bg-[#e9eff1] text-[#6c797c]'
              }`}
            >
              <ShieldIcon className="size-4.5" />
            </div>
            <div>
              <div
                className={`font-['Manrope'] font-bold leading-none mb-1 ${
                  isWinningStreak
                    ? 'text-2xl sm:text-3xl text-[#006875]'
                    : isLosingStreak
                    ? 'text-2xl sm:text-3xl text-[#3c494c]'
                    : 'text-sm sm:text-base text-[#6c797c]'
                }`}
              >
                {streakText}
              </div>
              <div className="text-[11px] text-[#3c494c] font-semibold leading-tight">
                Current Streak
              </div>
              <div className="text-[10px] text-[#36656e] mt-0.5 font-medium flex items-center gap-0.5 truncate">
                {isWinningStreak && <TrendingUpIcon className="size-3 text-[#006875]" />}
                {isLosingStreak && <TrendingUpIcon className="size-3 text-[#36656e]" />}
                {streakSubtitle}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Match Record & Distribution */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#bbc9cc] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-[#e3e9eb]">
            <div>
              <h3 className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#171d1e] tracking-tight leading-tight">
                Match Record
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <AnalyticsIcon className="size-3.5 text-[#6c797c]" />
                <p className="text-xs text-[#3c494c] font-medium">
                  {totalCompleted} Total Completed Matches
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Counts Row */}
          <div className="grid grid-cols-3 gap-2 text-center bg-[#eff4f7] p-2.5 rounded-xl border border-[#bbc9cc]/50">
            <div className="flex flex-col items-center">
              <span className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#006875]">
                {matchWins}
              </span>
              <span className="text-xs font-semibold text-[#36656e] uppercase tracking-wider">
                Wins
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#3c494c]">
                {matchLosses}
              </span>
              <span className="text-xs font-semibold text-[#6c797c] uppercase tracking-wider">
                Losses
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#6c797c]">
                {matchDraws}
              </span>
              <span className="text-xs font-semibold text-[#bbc9cc] uppercase tracking-wider">
                Draws
              </span>
            </div>
          </div>

          {/* Segmented Multi-Color Distribution Bar */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#e9eff1]">
              {hasDistribution ? (
                <>
                  <div
                    className="h-full bg-[#02c2d9] transition-all duration-500"
                    style={{ width: `${distWins}%` }}
                    title={`Wins: ${distWins}%`}
                  />
                  <div
                    className="h-full bg-[#bbc9cc] transition-all duration-500"
                    style={{ width: `${distLosses}%` }}
                    title={`Losses: ${distLosses}%`}
                  />
                  <div
                    className="h-full bg-[#6c797c] transition-all duration-500"
                    style={{ width: `${distDraws}%` }}
                    title={`Draws: ${distDraws}%`}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-[#e3e9eb]" title="No matches completed yet" />
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#3c494c] px-1 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#02c2d9]" />
                <span>Wins ({distWins}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#bbc9cc]" />
                <span>Losses ({distLosses}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#6c797c]" />
                <span>Draws ({distDraws}%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Longest Streak (Celebratory Banner) */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#f89a43]/20 via-white to-[#ffdcc2]/30 p-4 sm:p-5 rounded-2xl border border-[#bbc9cc] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-12 rounded-full bg-[#f89a43] flex items-center justify-center text-[#683600] shadow-sm shrink-0">
              <FireIcon className="size-6.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#904d00] uppercase tracking-widest">
                  LONGEST STREAK
                </span>
              </div>
              {hasBestStreak ? (
                <>
                  <div className="font-['Manrope'] text-xl sm:text-2xl text-[#171d1e] font-bold tracking-tight truncate">
                    {bestStreakCount} Consecutive {bestStreakType === 'loss' ? 'Losses' : 'Wins'}
                  </div>
                  <span className="text-[11px] text-[#3c494c]">
                    {longestStreakSubtitle}
                  </span>
                </>
              ) : (
                <>
                  <div className="font-['Manrope'] text-base sm:text-lg text-[#6c797c] font-bold tracking-tight">
                    No Streak Recorded Yet
                  </div>
                  <span className="text-[11px] text-[#6c797c]">
                    Complete matches to set your longest streak record
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Section 6: Category Performance */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-['Manrope'] text-lg sm:text-xl font-bold text-[#171d1e]">
                Category Performance
              </h3>
              <p className="text-xs text-[#3c494c]">Ordered by win percentage & volume</p>
            </div>
            <span className="text-xs text-[#006875] font-semibold">
              {categoryPerformance.length}{' '}
              {categoryPerformance.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>

          {categoryPerformance.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#bbc9cc] text-center shadow-xs">
              <p className="text-sm font-semibold text-[#171d1e]">No category matches played yet</p>
              <p className="text-xs text-[#3c494c] mt-1">
                Play duels across different categories to track your category stats.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-0.5">
              {categoryPerformance.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="bg-white p-4 rounded-xl border border-[#bbc9cc] shadow-xs flex flex-col gap-3 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-lg bg-[#baebf5] flex items-center justify-center text-[#006875] shrink-0 overflow-hidden p-1.5">
                        <CategoryIcon
                          iconKey={cat.iconKey}
                          name={cat.categoryName}
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="font-['Manrope'] text-base font-bold text-[#171d1e] truncate"
                          title={cat.categoryName}
                        >
                          {cat.categoryName}
                        </h4>
                        <div className="text-xs text-[#3c494c] flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                          <span>
                            {cat.matchesPlayed} {cat.matchesPlayed === 1 ? 'Match' : 'Matches'}
                          </span>
                          <span className="text-[#bbc9cc]">•</span>
                          <span className="font-semibold text-[#006875]">{cat.wins} Wins</span>
                          <span className="text-[#bbc9cc]">•</span>
                          <span className="font-medium text-[#6c797c]">{cat.losses} Losses</span>
                          <span className="text-[#bbc9cc]">•</span>
                          <span className="font-medium text-[#6c797c]">{cat.draws} Draws</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon className="size-5 text-[#bbc9cc] shrink-0" />
                  </div>

                  {/* Category win rate progress bar with win rate % next to it */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="flex-1 h-2 rounded-full bg-[#e9eff1] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.winRate > 0 ? 'bg-[#02c2d9]' : 'bg-[#bbc9cc]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, cat.winRate))}%` }}
                      />
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span
                        className={`font-['Manrope'] text-xs sm:text-sm font-bold tabular-nums ${
                          cat.winRate > 0 ? 'text-[#006875]' : 'text-[#6c797c]'
                        }`}
                      >
                        {cat.winRate}%
                      </span>
                      <span className="text-[10px] text-[#6c797c] font-semibold uppercase tracking-wider">
                        Win Rate
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
