/**
 * Glassmorphism Post Skeleton Loader
 * Mimics exact structure and style of real PostCard with shimmer effect
 */
export function PostSkeleton() {
  return (
    <div className="relative w-full backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20">
      {/* Shimmer overlay effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
      </div>

      <div className="p-4 space-y-4 relative">
        {/* Header - Avatar + User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar skeleton */}
            <div className="w-12 h-12 rounded-full bg-cyan-400/10 border-2 border-cyan-400/20 flex-shrink-0"></div>
            
            {/* User info skeleton */}
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-cyan-400/10 rounded-md"></div>
              <div className="h-3 w-20 bg-cyan-400/10 rounded-md"></div>
            </div>
          </div>

          {/* Menu button skeleton */}
          <div className="w-8 h-8 rounded-full bg-cyan-400/10"></div>
        </div>

        {/* Image skeleton */}
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl border border-cyan-400/10"></div>

        {/* Actions row (Like, Comment, Share) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-16 bg-cyan-400/10 rounded-lg"></div>
            <div className="h-8 w-16 bg-cyan-400/10 rounded-lg"></div>
          </div>
          <div className="h-8 w-8 bg-cyan-400/10 rounded-lg"></div>
        </div>

        {/* Caption skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-cyan-400/10 rounded-md"></div>
          <div className="h-4 w-4/5 bg-cyan-400/10 rounded-md"></div>
          <div className="h-4 w-3/5 bg-cyan-400/10 rounded-md"></div>
        </div>

        {/* Hashtags skeleton */}
        <div className="flex gap-2 flex-wrap">
          <div className="h-6 w-20 bg-cyan-500/10 rounded-full border border-cyan-400/20"></div>
          <div className="h-6 w-24 bg-cyan-500/10 rounded-full border border-cyan-400/20"></div>
          <div className="h-6 w-16 bg-cyan-500/10 rounded-full border border-cyan-400/20"></div>
        </div>
      </div>
    </div>
  );
}

