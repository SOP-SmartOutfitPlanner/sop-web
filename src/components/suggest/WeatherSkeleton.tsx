import GlassCard from "@/components/ui/glass-card";

export const WeatherSkeleton = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-600/30 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 space-y-3">
          {/* Temperature skeleton */}
          <div className="h-14 w-32 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-lg animate-pulse" />
          
          {/* Description skeleton */}
          <div className="h-4 w-24 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded animate-pulse" />
        </div>
        
        {/* Weather icon skeleton */}
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl backdrop-blur-sm animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 bg-slate-600/40 rounded-xl" />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
