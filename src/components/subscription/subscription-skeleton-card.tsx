"use client";

export const SubscriptionSkeletonCard = () => (
  <div className="rounded-2xl p-8 h-full bg-white/5 border border-white/10 animate-pulse space-y-6">
    <div className="h-5 w-24 bg-white/10 rounded-full" />
    <div className="h-10 w-32 bg-white/10 rounded-lg" />
    <div className="h-4 w-20 bg-white/10 rounded-full" />
    <div className="h-4 w-full bg-white/10 rounded-full" />
    <div className="h-4 w-5/6 bg-white/10 rounded-full" />
    <div className="h-12 w-full bg-white/10 rounded-xl" />
  </div>
);

