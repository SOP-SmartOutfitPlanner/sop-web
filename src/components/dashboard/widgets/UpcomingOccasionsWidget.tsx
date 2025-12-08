"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  CalendarPlus,
  Sparkles,
} from "lucide-react";
import { UserOccasion } from "@/types/userOccasion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";
import { useMemo } from "react";

interface UpcomingOccasionsWidgetProps {
  occasions: UserOccasion[];
  isLoading: boolean;
}

function formatTime(timeString: string) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getThisWeekDays(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  // Get the start of the week (Sunday)
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

export function UpcomingOccasionsWidget({
  occasions,
  isLoading,
}: UpcomingOccasionsWidgetProps) {
  const weekDays = useMemo(() => getThisWeekDays(), []);
  const today = new Date();

  // Get current month/year display
  const monthYearDisplay = useMemo(() => {
    const startMonth = weekDays[0].toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = weekDays[6].toLocaleDateString("en-US", { month: "short" });
    const year = weekDays[0].getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${year}`;
    }
    return `${startMonth} - ${endMonth} ${year}`;
  }, [weekDays]);

  // Get occasions for a specific day
  const getOccasionsForDay = (day: Date) => {
    return occasions.filter((occasion) => {
      const occasionDate = new Date(occasion.dateOccasion);
      return isSameDay(occasionDate, day);
    });
  };

  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(16, 185, 129, 0.2)"
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
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/10" />
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
      transition={{ duration: 0.4 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(16, 185, 129, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">This Week</h2>
                <p className="text-xs text-white/50">{monthYearDisplay}</p>
              </div>
            </div>
            <Link href="/calendar">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Weekly Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayOccasions = getOccasionsForDay(day);
              const isToday = isSameDay(day, today);
              const isPast = day < today && !isToday;
              const dayName = day.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const dayNumber = day.getDate();

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`relative flex flex-col rounded-xl border p-2 min-h-[100px] transition-all ${
                    isToday
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : isPast
                      ? "border-white/5 bg-white/5 opacity-60"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {/* Day Header */}
                  <div className="text-center mb-2">
                    <p
                      className={`text-xs ${
                        isToday ? "text-emerald-400" : "text-white/40"
                      }`}
                    >
                      {dayName}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        isToday ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {dayNumber}
                    </p>
                  </div>

                  {/* Occasions for the day */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayOccasions.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs text-white/20">-</span>
                      </div>
                    ) : (
                      dayOccasions.slice(0, 2).map((occasion, idx) => (
                        <div
                          key={occasion.id}
                          className={`rounded px-1.5 py-1 text-xs truncate ${
                            isToday
                              ? "bg-emerald-500/30 text-emerald-200"
                              : "bg-white/10 text-white/70"
                          }`}
                          title={`${occasion.name || occasion.occasionName} - ${formatTime(occasion.startTime)}`}
                        >
                          <div className="flex items-center gap-1">
                            {isToday && idx === 0 && (
                              <Sparkles className="h-2.5 w-2.5 flex-shrink-0" />
                            )}
                            <span className="truncate">
                              {occasion.name || occasion.occasionName}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    {dayOccasions.length > 2 && (
                      <p className="text-xs text-white/40 text-center">
                        +{dayOccasions.length - 2} more
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State - only show if no events this week */}
          {occasions.length === 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-white/50">No events this week</p>
              <Link href="/calendar">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
