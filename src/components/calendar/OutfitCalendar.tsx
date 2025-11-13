"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { useUserOccasions, useCalendarEntries } from "@/hooks/useCalendar";

export function OutfitCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Fetch occasions and calendar entries for current month
  const { data: occasionsData } = useUserOccasions({
    PageIndex: 1,
    PageSize: 10,
    takeAll: true,
    Month: currentDate.getMonth() + 1,
    Year: currentDate.getFullYear(),
  });

  const { data: calendarData } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 10,
    takeAll: true,
    Month: currentDate.getMonth() + 1,
    Year: currentDate.getFullYear(),
  });

  const occasions = occasionsData?.data?.data || [];
  const calendarEntries = calendarData?.data?.data || [];

  // Helper function to check if a day has occasions
  const getDayInfo = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");

    const dayOccasions = occasions.filter((occasion) => {
      const occasionDate = format(
        new Date(occasion.dateOccasion),
        "yyyy-MM-dd"
      );
      return occasionDate === dayString;
    });

    const dayEntries = calendarEntries.filter((entry) => {
      const entryDate = format(new Date(entry.dateUsed), "yyyy-MM-dd");
      return entryDate === dayString;
    });

    // Get first occasion and outfit names for tooltip
    const firstOccasion = dayOccasions[0];
    const firstEntry = dayEntries[0];

    return {
      hasOccasions: dayOccasions.length > 0,
      hasOutfits: dayEntries.length > 0,
      occasionCount: dayOccasions.length,
      outfitCount: dayEntries.length,
      firstOccasionName: firstOccasion?.name,
      firstOccasionTime: firstOccasion
        ? format(new Date(firstOccasion.startTime), "HH:mm")
        : null,
      firstOutfitName: firstEntry?.outfitName,
      weatherInfo: firstOccasion?.weatherSnapshot,
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
    <div className="w-full">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-dela-gothic text-2xl font-bold text-white">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
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
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                title={
                  isCurrentMonth && (dayInfo.hasOccasions || dayInfo.hasOutfits)
                    ? `${
                        dayInfo.firstOccasionName
                          ? `📅 ${dayInfo.firstOccasionName}${
                              dayInfo.firstOccasionTime
                                ? ` (${dayInfo.firstOccasionTime})`
                                : ""
                            }`
                          : ""
                      }${
                        dayInfo.firstOccasionName && dayInfo.firstOutfitName
                          ? "\n"
                          : ""
                      }${
                        dayInfo.firstOutfitName
                          ? `👕 ${dayInfo.firstOutfitName}`
                          : ""
                      }${
                        dayInfo.weatherInfo ? `\n🌤️ ${dayInfo.weatherInfo}` : ""
                      }`
                    : undefined
                }
                className={`
                  relative aspect-square p-2 rounded-xl transition-all duration-300
                  ${
                    isCurrentMonth
                      ? "bg-white/10 hover:bg-white/25 hover:scale-105 border border-white/20 hover:border-white/40"
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
                  group
                `}
              >
                <div className="relative flex flex-col items-center justify-center h-full gap-1">
                  {/* Date Number */}
                  <span
                    className={`
                    font-bricolage text-base font-bold
                    ${isCurrentMonth ? "text-white" : "text-white/40"}
                    ${isCurrentDay ? "text-cyan-200 text-lg" : ""}
                    ${
                      dayInfo.hasOutfits && !isCurrentDay
                        ? "text-purple-200"
                        : ""
                    }
                  `}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Enhanced Indicators */}
                  {isCurrentMonth &&
                    (dayInfo.hasOccasions || dayInfo.hasOutfits) && (
                      <div className="flex flex-col items-center gap-0.5">
                        {/* Outfit Indicator */}
                        {dayInfo.hasOutfits && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/40 backdrop-blur-sm border border-purple-400/30">
                            <div className="w-2 h-2 rounded-sm bg-purple-200" />
                            <span className="text-[9px] text-purple-100 font-bold">
                              {dayInfo.outfitCount}
                            </span>
                          </div>
                        )}

                        {/* Occasion Indicator */}
                        {dayInfo.hasOccasions && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/40 backdrop-blur-sm border border-cyan-400/30">
                            <div className="w-2 h-2 rounded-full bg-cyan-200" />
                            <span className="text-[9px] text-cyan-100 font-bold">
                              {dayInfo.occasionCount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Today Badge */}
                  {isCurrentDay && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
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
