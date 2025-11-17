"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import GlassButton from "@/components/ui/glass-button";
import { CalendarDayModal } from "./CalendarDayModal";
import { CalendarEntry } from "@/types/calender";
import { DayOccasionList } from "./DayOccasionList";

interface MonthlyCalendarProps {
  onShowWeekView?: () => void;
  calendarEntries: CalendarEntry[];
  isLoading: boolean;
}

export function MonthlyCalendar({
  onShowWeekView,
  calendarEntries,
}: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const formatTime = (time?: string | null) => {
    if (!time) return null;
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, "HH:mm");
  };

  const formatTimeRange = (start?: string | null, end?: string | null) => {
    const startLabel = formatTime(start);
    const endLabel = formatTime(end);

    if (!startLabel && !endLabel) return null;
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
    if (startLabel) return startLabel;
    return `-- – ${endLabel}`;
  };

  // Helper function to check if a day has occasions
  const getDayInfo = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");

    // Filter calendar entries for this day
    const dayEntries = calendarEntries.filter((entry) => {
      const occasionDate = format(
        new Date(entry.userOccasion.dateOccasion),
        "yyyy-MM-dd"
      );
      return occasionDate === dayString;
    });

    // Count total outfits for this day
    const totalOutfits = dayEntries.reduce(
      (sum, entry) => sum + entry.outfits.length,
      0
    );

    // Get first entry for preview info
    const firstEntry = dayEntries[0];
    const firstOutfit = firstEntry?.outfits[0];

    return {
      entries: dayEntries,
      hasOccasions: dayEntries.length > 0,
      hasOutfits: totalOutfits > 0,
      occasionCount: dayEntries.length,
      outfitCount: totalOutfits,
      firstOccasionName: firstEntry?.userOccasion?.name,
      firstOccasionTime: firstEntry?.userOccasion
        ? formatTimeRange(
            firstEntry.userOccasion.startTime,
            firstEntry.userOccasion.endTime
          )
        : null,
      firstOutfitName: firstOutfit?.outfitName,
      weatherInfo: firstEntry?.userOccasion?.weatherSnapshot,
    };
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  return (
    <div className="w-[1200px] mx-auto">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-dela-gothic text-2xl font-bold text-white">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <p className="font-bricolage text-white/60 mt-1">
            View and manage your monthly outfit plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="ghost" size="md" onClick={onShowWeekView}>
            <LayoutGrid className="w-5 h-5" />
            Week View
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handleToday}>
            Today
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </GlassButton>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-bricolage text-sm font-semibold text-white/70 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const dayInfo = getDayInfo(day);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                relative aspect-video p-2 rounded-xl transition-all duration-300 cursor-pointer
                ${
                  isCurrentMonth
                    ? "bg-white/10 hover:bg-white/25 hover:scale-[1.02] border border-white/20 hover:border-white/40"
                    : "bg-white/5 border border-white/10 opacity-50 hover:opacity-70"
                }
                ${
                  isCurrentDay
                    ? "ring-2 ring-cyan-400 bg-cyan-500/30 shadow-lg shadow-cyan-500/20"
                    : ""
                }
                ${
                  dayInfo.hasOutfits
                    ? "hover:ring-2 hover:ring-purple-400/50"
                    : ""
                }
                group overflow-hidden
              `}
              >
                {/* Date Number with Occasion Count */}
                <div className="relative z-10 flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-white/90">
                    {format(day, "d")}
                  </div>
                  {isCurrentMonth && dayInfo.entries.length > 0 && (
                    <div className="flex items-center gap-1">
                      {dayInfo.entries.some(e => e.isDaily) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Daily" />
                      )}
                      {dayInfo.entries.some(e => !e.isDaily) && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {dayInfo.entries.filter(e => !e.isDaily).length > 1 && (
                            <span className="text-[9px] text-purple-300 font-semibold">
                              {dayInfo.entries.filter(e => !e.isDaily).length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Outfit Preview - Horizontal Layout */}
                {isCurrentMonth && dayInfo.entries.length > 0 && (
                  <DayOccasionList entries={dayInfo.entries} />
                )}

                {/* Today Badge */}
                {isCurrentDay && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-white/70 font-medium">Daily Outfit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-white/70 font-medium">Occasions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-400 ring-2 ring-cyan-400/50 animate-pulse" />
                <span className="text-white/70 font-medium">Today</span>
              </div>
            </div>
            <div className="text-sm text-white/60">
              <span className="opacity-70">Hover to preview •</span> Click to manage outfits
            </div>
          </div>
        </div>
      </div>

      {/* Day Modal */}
      {selectedDate && (
        <CalendarDayModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
