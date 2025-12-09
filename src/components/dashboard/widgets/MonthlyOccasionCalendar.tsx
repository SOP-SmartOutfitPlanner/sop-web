"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { UserOccasion } from "@/types/userOccasion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { useState, useMemo } from "react";

interface MonthlyOccasionCalendarProps {
  occasions: UserOccasion[];
  isLoading: boolean;
}

export function MonthlyOccasionCalendar({
  occasions,
  isLoading,
}: MonthlyOccasionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getOccasionsForDay = (day: Date) => {
    return occasions.filter((occasion) => {
      try {
        const occasionDate = new Date(occasion.dateOccasion);
        return isSameDay(occasionDate, day);
      } catch {
        return false;
      }
    });
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(236, 72, 153, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-32 bg-white/10" />
            <Skeleton className="h-8 w-20 bg-white/10" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded bg-white/10" />
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
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(236, 72, 153, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={handleToday}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="h-6 flex items-center justify-center text-xs font-medium text-white/40"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayOccasions = getOccasionsForDay(day);
              const hasOccasions = dayOccasions.length > 0;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <Link
                  key={day.toISOString()}
                  href={`/calendar?date=${format(day, "yyyy-MM-dd")}`}
                  className={`
                    relative h-9 flex flex-col items-center justify-center rounded-lg
                    transition-all cursor-pointer
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${
                      isTodayDate
                        ? "bg-pink-500/30 border border-pink-500/50"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  <span
                    className={`text-xs font-medium ${
                      isTodayDate ? "text-pink-300" : "text-white"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {hasOccasions && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayOccasions.slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            isTodayDate ? "bg-pink-400" : "bg-emerald-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* View Full Calendar Link */}
          <Link href="/calendar" className="block mt-4">
            <Button
              variant="ghost"
              className="w-full text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              size="sm"
            >
              Open Full Calendar
            </Button>
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
