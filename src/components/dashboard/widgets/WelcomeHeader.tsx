"use client";

import { User } from "@/lib/types/auth.types";
import { Home, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

interface WelcomeHeaderProps {
  user: User | null;
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <GlassCard
      padding="1.5rem"
      blur="12px"
      brightness={1.1}
      glowColor="rgba(34, 211, 238, 0.3)"
      glowIntensity={8}
      borderColor="rgba(255, 255, 255, 0.1)"
      borderRadius="1.5rem"
      className="bg-white/5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-cyan-500/25">
            <div className="absolute inset-[2px] flex items-center justify-center rounded-[14px] bg-slate-900">
              <Home className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Dashboard
            </p>
            <h1 className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-3xl font-black text-transparent md:text-4xl">
              {getGreeting()}, {user?.displayName?.split(" ")[0] || "there"}
            </h1>
          </div>
        </div>
        <p className="text-base text-white/60 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          {getFormattedDate()}
        </p>
      </div>
    </GlassCard>
  );
}
