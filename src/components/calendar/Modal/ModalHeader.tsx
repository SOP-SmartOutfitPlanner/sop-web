"use client";

import { X, Calendar, Shirt } from "lucide-react";
import { format } from "date-fns";
import { CalendarEntry } from "@/types/calender";
import { UserOccasion } from "@/types/userOccasion";

interface ModalHeaderProps {
  selectedDate: Date;
  occasions: UserOccasion[];
  calendarEntries: CalendarEntry[];
  onClose: () => void;
}

export function ModalHeader({
  selectedDate,
  occasions,
  calendarEntries,
  onClose,
}: ModalHeaderProps) {
  return (
    <div className="px-10 pt-8 pb-6 shrink-0 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="font-dela-gothic text-3xl font-bold text-white">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>
          <p className="font-bricolage text-gray-300 mt-2 text-base">
            Manage your occasions and outfits for this day
          </p>

          {/* Day Summary Stats */}
          {(occasions.length > 0 || calendarEntries.length > 0) && (
            <div className="flex items-center gap-4 mt-4">
              {occasions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30">
                  <Calendar className="w-4 h-4 text-purple-300" />
                  <span className="text-sm text-purple-200 font-medium">
                    {occasions.length} Occasion
                    {occasions.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {calendarEntries.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
                  <Shirt className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm text-cyan-200 font-medium">
                    {calendarEntries.reduce(
                      (sum, e) => sum + e.outfits.length,
                      0
                    )}{" "}
                    Outfit
                    {calendarEntries.reduce(
                      (sum, e) => sum + e.outfits.length,
                      0
                    ) > 1
                      ? "s"
                      : ""}{" "}
                    Planned
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 shrink-0"
          title="Close"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
