"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { Tooltip } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { CalendarDayModal } from "./CalendarDayModal";
import { CalendarEntry } from "@/types/calendar";
import { UserOccasion } from "@/types/userOccasion";
import { useModalScroll } from "@/hooks/useModalScroll";

interface WeeklyCalendarProps {
  onShowMonthView?: () => void;
  calendarEntries: CalendarEntry[];
  userOccasions?: UserOccasion[];
  isLoading: boolean;
}

export function WeeklyCalendar({
  onShowMonthView,
  calendarEntries,
  userOccasions = [],
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Helper function to get day info
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

    // Filter user occasions for this day (including those without outfits)
    const dayOccasions = userOccasions.filter((occ) => {
      const occasionDate = format(new Date(occ.dateOccasion), "yyyy-MM-dd");
      return occasionDate === dayString;
    });

    // Get occasion IDs that already have calendar entries
    const occasionsWithOutfits = new Set(
      dayEntries.map((entry) => entry.userOccasion.id)
    );

    // Find occasions without outfits
    const occasionsWithoutOutfits = dayOccasions.filter(
      (occ) => !occasionsWithOutfits.has(occ.id)
    );

    // Count total outfits for this day
    const totalOutfits = dayEntries.reduce(
      (sum, entry) => sum + entry.outfits.length,
      0
    );

    // Combine entries with occasions without outfits
    const allOccasions = [
      ...dayEntries.map((e) => e.userOccasion),
      ...occasionsWithoutOutfits,
    ];

    return {
      occasions: allOccasions,
      entries: dayEntries,
      occasionsWithoutOutfits,
      hasOccasions: allOccasions.length > 0,
      hasOutfits: totalOutfits > 0,
    };
  };

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-dela-gothic text-2xl font-bold text-white">
            Weekly Outfit Planner
          </h2>
          <p className="font-bricolage text-white/60 mt-1">
            Plan your outfits ahead for each day of the week ·
            {format(currentDate, "yyyy")}-W{format(currentDate, "II")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="ghost" size="md" onClick={onShowMonthView}>
            <CalendarIcon className="w-5 h-5" />
            Month View
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handleToday}>
            Today
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </GlassButton>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayInfo = getDayInfo(day);
            const isCurrentDay = isToday(day);
            const dayName = format(day, "EEE");
            const dayDate = format(day, "d");
            const monthName = format(day, "MMM");

            return (
              <div key={index} className="flex flex-col">
                {/* Day Header */}
                <div className="text-center mb-4">
                  <div className="font-bricolage text-sm font-semibold text-white/70">
                    {dayName}
                  </div>
                  <div className="font-bricolage text-xs text-white/50 mt-0.5">
                    {monthName} {dayDate}
                  </div>
                </div>

                {/* Day Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleDayClick(day);
                    }
                  }}
                  className={`
                    relative flex-1 min-h-[400px] p-3 rounded-xl transition-all duration-300 border-2 flex flex-col
                    ${
                      isCurrentDay
                        ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }
                    hover:scale-[1.02] group focus:outline-none focus:ring-2 focus:ring-cyan-400/70
                  `}
                >
                  {/* Empty State - Only show if no occasions at all */}
                  {!dayInfo.hasOccasions && (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 group-hover:text-white/60 transition-colors">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3">
                        <span className="text-2xl font-light">+</span>
                      </div>
                      <span className="text-xs font-medium">Add Outfit</span>
                    </div>
                  )}

                  {/* Occasions and Outfits */}
                  {dayInfo.hasOccasions && (
                    <DayOccasionList
                      entries={dayInfo.entries}
                      occasionsWithoutOutfits={dayInfo.occasionsWithoutOutfits}
                    />
                  )}

                  {/* Occasion Indicator */}
                  {dayInfo.hasOccasions && (
                    <div className="absolute top-2 right-2 group/badge">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/40 backdrop-blur-sm border border-cyan-400/50 flex items-center justify-center cursor-help">
                        <span className="text-[10px] font-bold text-cyan-100">
                          {dayInfo.occasions.length}
                        </span>
                      </div>
                      {/* Tooltip on hover showing occasion names */}
                      {dayInfo.entries.length > 2 && (
                        <div className="absolute top-full right-0 mt-1 hidden group-hover/badge:block z-10 min-w-[150px]">
                          <div className="bg-slate-900/95 backdrop-blur-sm border border-purple-400/30 rounded-lg p-2 shadow-xl">
                            <div className="space-y-1">
                              {dayInfo.entries.map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="text-[10px] text-white/90"
                                >
                                  <span
                                    className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      entry.isDaily
                                        ? "bg-cyan-400"
                                        : "bg-purple-400"
                                    }`}
                                  />
                                  {entry.isDaily
                                    ? "Daily Outfit"
                                    : entry.userOccasion?.occasionName ||
                                      "Occasion"}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Today Badge */}
                  {isCurrentDay && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-400/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-white">
                        Today
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/10">
          <div className="text-sm text-white/60">
            <span className="font-medium">No outfits yet</span> – Start planning
            your week
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

interface DayOccasionListProps {
  entries: CalendarEntry[];
  occasionsWithoutOutfits: UserOccasion[];
}

function DayOccasionList({
  entries,
  occasionsWithoutOutfits,
}: DayOccasionListProps) {
  const shouldEnableScroll =
    entries.length > 2 || occasionsWithoutOutfits.length > 0;
  const scrollRef = useModalScroll(shouldEnableScroll, {
    smooth: false,
    sensitivity: 10,
  });

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="space-y-2 flex-1 overflow-y-auto max-h-[520px] pr-1"
      >
        {entries.map((entry, idx) => {
          const firstOutfit = entry.outfits[0];
          const isDaily = entry.isDaily;

          return (
            <div
              key={idx}
              className="bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:border-white/30 transition-all flex flex-col min-h-[240px] "
            >
              {/* Occasion Header */}
              <div className="px-2 py-1.5 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDaily ? "bg-cyan-400" : "bg-purple-400"
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-white/90 truncate">
                    {isDaily
                      ? "Daily Outfit"
                      : entry.userOccasion?.occasionName || "Occasion"}
                  </span>
                </div>
                {!isDaily && entry.userOccasion?.name && (
                  <p className="text-[9px] text-white/60 truncate mt-0.5">
                    {entry.userOccasion.name}
                  </p>
                )}
              </div>
              {/* Outfit Images Grid */}
              {firstOutfit ? (
                <div className="p-2 flex flex-1 flex-col gap-2">
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    {[0, 1, 2, 3].map((index) => {
                      const item = firstOutfit.outfitDetails.items[index];
                      return (
                        <div
                          key={index}
                          className="aspect-square bg-white/5 rounded overflow-hidden relative"
                        >
                          {item ? (
                            <Image
                              src={item.imgUrl}
                              alt={item.name}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              priority={false}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-600/30 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-500/50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Outfit Name & Count */}
                  <div className="text-center">
                    <p className="text-[10px] font-medium text-white truncate">
                      {firstOutfit.outfitName}
                    </p>
                    <p className="text-[9px] text-white/50">
                      {firstOutfit.outfitDetails.items.length} items
                    </p>
                  </div>

                  {/* Multiple outfits indicator */}
                  {entry.outfits.length > 1 && (
                    <Tooltip
                      title={
                        <div className="space-y-2 w-full">
                          {/* Header */}
                          <div className="text-xs font-semibold border-b border-white/20 pb-1.5">
                            {isDaily
                              ? "Daily Outfit"
                              : entry.userOccasion?.occasionName || "Occasion"}
                          </div>

                          {/* Occasion Details */}
                          {!isDaily && (
                            <div className="space-y-1">
                              {entry.userOccasion?.name && (
                                <div className="text-[11px] text-white/80">
                                  <span className="text-white/50">��� Name:</span>{" "}
                                  {entry.userOccasion.name}
                                </div>
                              )}
                              {entry.userOccasion?.startTime && (
                                <div className="text-[11px] text-white/80">
                                  <span className="text-white/50">��� Time:</span>{" "}
                                  {format(
                                    new Date(entry.userOccasion.startTime),
                                    "HH:mm"
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Outfits List */}
                          <div className="space-y-2 pt-1 border-t border-white/10">
                            <div className="text-[10px] text-white/60 font-medium">
                              {entry.outfits.length} Outfit
                              {entry.outfits.length > 1 ? "s" : ""}:
                            </div>
                            {entry.outfits.map((outfit, oIdx) => (
                              <div key={oIdx} className="space-y-1.5">
                                <div className="text-[11px] text-white/90 font-medium">
                                  • {outfit.outfitName}
                                </div>
                                {/* Outfit Items Preview Grid */}
                                <div className="grid grid-cols-4 gap-1 pl-3">
                                  {outfit.outfitDetails.items.slice(0, 4).map((item, itemIdx) => (
                                    <div
                                      key={itemIdx}
                                      className="aspect-square bg-white/5 rounded overflow-hidden border border-white/10 relative"
                                    >
                                      <Image
                                        src={item.imgUrl}
                                        alt={item.name}
                                        className="w-full object-cover"
                                        fill
                                        priority={false}
                                        loading="lazy"
                                      />
                                    </div>
                                  ))}
                                </div>
                                {outfit.outfitDetails.items.length > 4 && (
                                  <div className="text-[9px] text-white/50 pl-3">
                                    +{outfit.outfitDetails.items.length - 4} more items
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      }
                      placement="right"
                      mouseEnterDelay={0.2}
                      styles={{
                        root: {
                          maxWidth: "320px",
                          minWidth: "320px",
                        },
                      }}
                    >
                      <div className="mt-1 text-center cursor-help">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 hover:bg-purple-500/40 transition-all">
                          +{entry.outfits.length - 1} more outfit
                          {entry.outfits.length - 1 > 1 ? "s" : ""}
                        </span>
                      </div>
                    </Tooltip>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center p-4 text-xs text-white/60">
                  No outfits planned
                </div>
              )}
            </div>
          );
        })}

        {/* Show occasions without outfits */}
        {occasionsWithoutOutfits.map((occasion) => {
          const isDaily =
            occasion.name?.toLowerCase() === "daily" && occasion.occasionId === null;

          return (
            <div
              key={`no-outfit-${occasion.id}`}
              className="bg-white/5 rounded-lg overflow-hidden border border-white/10 border-dashed hover:border-white/20 transition-all"
            >
              {/* Occasion Header */}
              <div className="px-2 py-1.5 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDaily ? "bg-cyan-400" : "bg-purple-400"
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-white/90 truncate">
                    {isDaily ? "Daily Outfit" : occasion.occasionName || "Occasion"}
                  </span>
                </div>
                {!isDaily && occasion.name && (
                  <p className="text-[9px] text-white/60 truncate mt-0.5">
                    {occasion.name}
                  </p>
                )}
              </div>

              {/* No Outfit Placeholder */}
              <div className="p-4 flex flex-col items-center justify-center min-h-[120px]">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-2">
                  <svg
                    className="w-8 h-8 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-[10px] text-white/50 text-center">
                  No outfit assigned
                </p>
                {occasion.startTime && (
                  <p className="text-[9px] text-white/40 mt-1">
                    {format(new Date(occasion.startTime), "HH:mm")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
