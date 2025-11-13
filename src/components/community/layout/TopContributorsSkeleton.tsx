/**
 * Glassmorphism Skeleton for Top Contributors List
 * Mimics exact structure of ContributorCard with shimmer effect
 */
export function TopContributorsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Render 5 skeleton cards */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="relative flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-700/20 overflow-hidden"
        >
          {/* Shimmer overlay effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>

          {/* Profile Info Section */}
          <div className="flex items-center gap-3 relative z-0">
            {/* Avatar skeleton with rank badge */}
            <div className="relative">
              {/* Avatar circle */}
              <div className="w-9 h-9 rounded-full bg-cyan-400/10 border-2 border-cyan-400/20"></div>

              {/* Rank Badge - only for top 3 */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-amber-400/50 font-bold">
                    {index + 1}
                  </span>
                </div>
              )}
            </div>

            {/* Name & Post Count skeleton */}
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-cyan-400/10 rounded-md"></div>
              <div className="h-3 w-16 bg-cyan-400/10 rounded-md"></div>
            </div>
          </div>

          {/* Follow Button skeleton */}
          <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-400/20 rounded-md"></div>
        </div>
      ))}
    </div>
  );
}
