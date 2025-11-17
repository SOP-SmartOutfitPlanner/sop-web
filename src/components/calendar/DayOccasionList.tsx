"use client";

import { Tooltip } from "antd";
import { CalendarEntry } from "@/types/calender";
import { format } from "date-fns";
import Image from "next/image";

interface DayOccasionListProps {
  entries: CalendarEntry[];
  maxVisible?: number;
}

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

export function DayOccasionList({
  entries,
  maxVisible = 5,
}: DayOccasionListProps) {
  // Prioritize: Daily first, then occasions sorted by time
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.isDaily && !b.isDaily) return -1;
    if (!a.isDaily && b.isDaily) return 1;
    if (!a.isDaily && !b.isDaily) {
      return (
        new Date(a.userOccasion.startTime).getTime() -
        new Date(b.userOccasion.startTime).getTime()
      );
    }
    return 0;
  });

  // Determine if we should use compact mode (many occasions)
  const hasMany = sortedEntries.length > 3;
  const displayLimit = hasMany ? 3 : maxVisible;
  const displayEntries = sortedEntries.slice(0, displayLimit);
  const hiddenCount = sortedEntries.length - displayLimit;

  return (
    <div className="absolute inset-0 flex items-center justify-center pt-8 pb-2 px-2">
      {/* Occasion/Daily Tags - Centered with compact mode for many items */}
      <div
        className={`flex flex-wrap gap-1 justify-center items-center max-h-full overflow-y-auto scroll-smooth
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-white/10
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-purple-400/60
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:hover:bg-purple-400/80
          ${hasMany ? "max-w-full" : ""}`}
        onWheel={(e) => e.stopPropagation()}
      >
        {displayEntries.map((entry, idx) => {
          const isDaily = entry.isDaily;
          const outfitCount = entry.outfits.length;
          const occasionTimeRange =
            !isDaily && entry.userOccasion
              ? formatTimeRange(
                  entry.userOccasion.startTime,
                  entry.userOccasion.endTime
                )
              : null;

          return (
            <Tooltip
              key={idx}
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
                          <span className="text-white/50">📝 Name:</span>{" "}
                          {entry.userOccasion.name}
                        </div>
                      )}
                      {occasionTimeRange && (
                        <div className="text-[11px] text-white/80">
                          <span className="text-white/50">🕒 Time:</span>{" "}
                          {occasionTimeRange}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outfits List */}
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="text-[10px] text-white/60 font-medium">
                      {outfitCount} Outfit{outfitCount > 1 ? "s" : ""}:
                    </div>
                    {entry.outfits.map((outfit, oIdx) => (
                      <div key={oIdx} className="space-y-1.5">
                        <div className="text-[11px] text-white/90 font-medium">
                          • {outfit.outfitName}
                        </div>
                        {/* Outfit Items Preview Grid */}
                        <div className="grid grid-cols-4 gap-1 pl-3">
                          {outfit.outfitDetails.items
                            .slice(0, 4)
                            .map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="aspect-square bg-white/5 rounded overflow-hidden border border-white/10 relative"
                              >
                                <Image
                                  src={item.imgUrl}
                                  alt={item.name}
                                  className="w-full object-cover"
                                  fill
                                  // sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
                  minWidth: "320px"
                } 
              }}
            >
              <div
                className={`${
                  hasMany ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]"
                } rounded-md font-medium cursor-help transition-all hover:scale-105 hover:shadow-lg whitespace-nowrap ${
                  isDaily
                    ? "bg-cyan-500/40 text-cyan-100 border border-cyan-400/40 hover:bg-cyan-500/50"
                    : "bg-purple-500/40 text-purple-100 border border-purple-400/40 hover:bg-purple-500/50"
                }`}
              >
                <div className="flex items-center gap-1">
                  {!hasMany && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isDaily ? "bg-cyan-300" : "bg-purple-300"
                      }`}
                    />
                  )}
                  {!isDaily && occasionTimeRange && (
                    <span
                      className={`text-white/70 font-semibold ${
                        hasMany ? "text-[8px]" : "text-[9px]"
                      }`}
                    >
                      {occasionTimeRange}
                    </span>
                  )}
                  <span
                    className={`truncate font-medium ${
                      hasMany ? "max-w-[50px]" : "max-w-20"
                    }`}
                  >
                    {isDaily
                      ? "Daily"
                      : entry.userOccasion?.occasionName || "Event"}
                  </span>
                  <span
                    className={`text-white/60 shrink-0 font-semibold ${
                      hasMany ? "text-[8px]" : "text-[9px]"
                    }`}
                  >
                    {outfitCount}
                  </span>
                </div>
              </div>
            </Tooltip>
          );
        })}

        {/* Remaining Count Badge */}
        {hiddenCount > 0 && (
          <Tooltip
            title={
              <div className="space-y-1.5 w-full">
                <div className="text-xs font-semibold border-b border-white/20 pb-1">
                  +{hiddenCount} More Occasion{hiddenCount > 1 ? "s" : ""}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                  {sortedEntries.slice(displayLimit).map((entry, idx) => {
                    const isDaily = entry.isDaily;
                    const outfitCount = entry.outfits.length;
                    const timeRange =
                      !isDaily && entry.userOccasion
                        ? formatTimeRange(
                            entry.userOccasion.startTime,
                            entry.userOccasion.endTime
                          )
                        : null;
                    return (
                      <div
                        key={idx}
                        className="text-[10px] text-white/90 py-0.5 flex items-center gap-1.5"
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDaily ? "bg-cyan-400" : "bg-purple-400"
                          }`}
                        />
                        {timeRange && (
                          <span className="text-white/60 font-semibold">
                            {timeRange}
                          </span>
                        )}
                        <span className="truncate">
                          {isDaily
                            ? "Daily"
                            : entry.userOccasion?.occasionName || "Event"}
                        </span>
                        <span className="text-white/50">({outfitCount})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            }
            placement="right"
            mouseEnterDelay={0.2}
            styles={{ 
              root: { 
                maxWidth: "320px",
                minWidth: "320px"
              } 
            }}
          >
            <div
              className={`${
                hasMany ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]"
              } rounded-md font-medium cursor-help bg-linear-to-r from-purple-500/50 to-pink-500/50 border border-purple-400/60 text-purple-100 hover:scale-105 hover:from-purple-500/60 hover:to-pink-500/60 transition-all shadow-sm`}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                <span className="font-bold">+{hiddenCount}</span>
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
