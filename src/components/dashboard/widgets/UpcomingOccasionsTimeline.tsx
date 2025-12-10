"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarRange,
  ChevronRight,
  Clock,
  Calendar,
} from "lucide-react";
import { UserOccasion } from "@/types/userOccasion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";
import { format, isToday, isTomorrow } from "date-fns";
import { useMemo } from "react";

interface UpcomingOccasionsTimelineProps {
  occasions: UserOccasion[];
  isLoading: boolean;
}

function formatTime(timeString: string) {
  if (!timeString) return "";
  try {
    const date = new Date(timeString);
    return format(date, "h:mm a");
  } catch {
    return timeString;
  }
}

function getDateLabel(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM d");
  } catch {
    return dateString;
  }
}

function getDayColors(index: number) {
  const colors = [
    { bg: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30" },
    { bg: "from-rose-500 to-pink-600", glow: "shadow-rose-500/30" },
    { bg: "from-amber-500 to-orange-600", glow: "shadow-amber-500/30" },
    { bg: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30" },
    { bg: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/30" },
    { bg: "from-cyan-500 to-sky-600", glow: "shadow-cyan-500/30" },
  ];
  return colors[index % colors.length];
}

interface GroupedOccasion {
  date: string;
  dateLabel: string;
  occasions: UserOccasion[];
}

export function UpcomingOccasionsTimeline({
  occasions,
  isLoading,
}: UpcomingOccasionsTimelineProps) {
  // Group occasions by date - include ALL occasions (today + future)
  const groupedOccasions = useMemo(() => {
    if (!occasions || occasions.length === 0) return [];

    const groups: Record<string, UserOccasion[]> = {};

    // Sort by dateOccasion
    const sortedOccasions = [...occasions].sort(
      (a, b) => new Date(a.dateOccasion).getTime() - new Date(b.dateOccasion).getTime()
    );

    sortedOccasions.forEach((occasion) => {
      // Extract date part only
      const dateKey = occasion.dateOccasion.split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(occasion);
    });

    return Object.entries(groups)
      .map(([date, occs]) => ({
        date,
        dateLabel: getDateLabel(date),
        occasions: occs.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      }))
      .slice(0, 7); // Show up to 7 days
  }, [occasions]);

  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(139, 92, 246, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              <div>
                <Skeleton className="h-5 w-40 bg-white/10 mb-1" />
                <Skeleton className="h-3 w-24 bg-white/10" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-white/10" />
                  <Skeleton className="h-3 w-1/2 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(139, 92, 246, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <CalendarRange className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
                <p className="text-xs text-white/50">
                  {occasions.length} {occasions.length === 1 ? "event" : "events"} this week
                </p>
              </div>
            </div>
            <Link href="/calendar">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                See All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Timeline */}
          {groupedOccasions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 mb-4">
                <Calendar className="h-7 w-7 text-white/30" />
              </div>
              <h3 className="text-base font-semibold text-white/70 mb-1">
                No Upcoming Events
              </h3>
              <p className="text-sm text-white/40 max-w-xs">
                Your week looks clear. Plan ahead by adding new occasions!
              </p>
            </div>
          ) : (
            <div
              data-lenis-prevent
              className="relative max-h-[400px] overflow-y-auto pr-2 overscroll-contain
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-white/5
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-white/20
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-white/30"
            >
              {/* Timeline line */}
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-500/50 via-purple-500/30 to-transparent" />

              <div className="space-y-4">
                {groupedOccasions.map((group, groupIndex) => {
                  const colors = getDayColors(groupIndex);

                  return (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                      className="relative pl-14"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-4 top-1 w-4 h-4 rounded-full bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg ring-4 ring-slate-900/50`}
                      />

                      {/* Date Label */}
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-white/90">
                          {group.dateLabel}
                        </span>
                      </div>

                      {/* Events for this day */}
                      <div className="space-y-3">
                        {group.occasions.map((occasion) => (
                          <div
                            key={occasion.id}
                            className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:from-white/15 hover:to-white/10 transition-all shadow-md"
                          >
                            {/* Header: Time + Type */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-500/20 border border-violet-500/30">
                                <Clock className="h-3.5 w-3.5 text-violet-400" />
                                <span className="text-xs font-medium text-violet-300">
                                  {formatTime(occasion.startTime)}
                                </span>
                              </div>
                              <span className="px-2 py-1 rounded-md bg-white/10 text-xs font-medium text-white/60">
                                {occasion.occasionName}
                              </span>
                            </div>

                            {/* Name */}
                            <h4 className="text-base font-semibold text-white mb-1">
                              {occasion.name}
                            </h4>

                            {/* Description if exists */}
                            {occasion.description && (
                              <p className="text-sm text-white/50 line-clamp-2">
                                {occasion.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
