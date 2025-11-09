"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated gradient mesh background */}
      <div
        className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-full blur-3xl"
      />
      <div
        className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"
      />
      <div
        
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-3xl"
      />
    </div>
  );
}
