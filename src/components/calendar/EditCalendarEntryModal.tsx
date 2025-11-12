"use client";

import { useEffect, useState } from "react";
import { Calendar, Shirt, Sparkles, X } from "lucide-react";
import { format } from "date-fns";
import GlassButton from "@/components/ui/glass-button";
import { useUpdateCalendarEntry } from "@/hooks/useCalendar";
import { Calender, EditCalenderRequest } from "@/types/calender";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";

interface EditCalendarEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarEntry: Calender | null;
  occasions: UserOccasion[];
  outfits: Outfit[];
}

export function EditCalendarEntryModal({
  open,
  onOpenChange,
  calendarEntry,
  occasions,
  outfits,
}: EditCalendarEntryModalProps) {
  const [selectedOccasionId, setSelectedOccasionId] = useState<number | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { mutate: updateEntry, isPending } = useUpdateCalendarEntry();

  // Initialize form with current values
  useEffect(() => {
    if (open && calendarEntry) {
      setSelectedOccasionId(calendarEntry.userOccasionId);
      setSelectedOutfitId(calendarEntry.outfitId);
      setSelectedDate(calendarEntry.dateUsed.split("T")[0]); // Extract date part
    }
  }, [open, calendarEntry]);

  const handleUpdate = () => {
    if (!calendarEntry) return;

    const updateData: Partial<EditCalenderRequest> = {};
    
    if (selectedOccasionId !== calendarEntry.userOccasionId) {
      updateData.userOccasionId = selectedOccasionId;
    }
    if (selectedOutfitId !== calendarEntry.outfitId) {
      updateData.outfitId = selectedOutfitId;
    }
    if (selectedDate && selectedDate !== calendarEntry.dateUsed.split("T")[0]) {
      updateData.dateUsed = `${selectedDate}T00:00:00`;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      onOpenChange(false);
      return;
    }

    updateEntry(
      { id: calendarEntry.id, data: updateData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  if (!open || !calendarEntry) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4">
        <div className="bg-linear-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bricolage text-2xl font-bold text-white flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-blue-400" />
                  Edit Calendar Entry
                </h2>
                <p className="font-poppins text-sm text-white/60 mt-1">
                  Modify the outfit, occasion, or date
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">
                Occasion
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2">
                {occasions.map((occasion) => {
                  const isSelected = selectedOccasionId === occasion.id;
                  return (
                    <button
                      key={occasion.id}
                      onClick={() => setSelectedOccasionId(occasion.id)}
                      className={`
                        text-left p-4 rounded-lg transition-all border-2
                        ${
                          isSelected
                            ? "bg-purple-500/30 border-purple-400"
                            : "bg-white/5 border-transparent hover:border-purple-400/50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold">
                            {occasion.occasionName}
                          </span>
                          <h4 className="font-semibold text-white mt-1">{occasion.name}</h4>
                          <p className="text-xs text-white/60 mt-1">
                            {format(new Date(occasion.startTime), "MMM d, yyyy")} at {format(new Date(occasion.startTime), "h:mm a")} - {format(new Date(occasion.endTime), "h:mm a")}
                          </p>
                        </div>
                        {isSelected && <Sparkles className="w-5 h-5 text-purple-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Outfit */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">
                Outfit
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2">
                {outfits.map((outfit) => {
                  const isSelected = selectedOutfitId === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      onClick={() => setSelectedOutfitId(outfit.id)}
                      className={`
                        text-left p-4 rounded-lg transition-all border-2
                        ${
                          isSelected
                            ? "bg-cyan-500/30 border-cyan-400"
                            : "bg-white/5 border-transparent hover:border-cyan-400/50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{outfit.name}</h4>
                          <p className="text-xs text-white/60 mt-1">
                            <Shirt className="w-3 h-3 inline mr-1" />
                            {outfit.items.length} items
                          </p>
                        </div>
                        {isSelected && <Sparkles className="w-5 h-5 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center justify-end gap-4">
              <GlassButton variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </GlassButton>
              <GlassButton
                variant="custom"
                backgroundColor="rgba(59, 130, 246, 0.6)"
                borderColor="rgba(59, 130, 246, 0.8)"
                onClick={handleUpdate}
                disabled={isPending || !selectedOccasionId || !selectedOutfitId || !selectedDate}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Update Entry
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
