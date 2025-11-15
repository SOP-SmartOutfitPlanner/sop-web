"use client";

import { Shirt, Plus } from "lucide-react";
import { Outfit } from "@/types/outfit";
import { CalendarEntry, Calender } from "@/types/calender";
import GlassButton from "@/components/ui/glass-button";
import Image from "next/image";

interface DailyOutfitsSectionProps {
  calendarEntries: CalendarEntry[];
  outfits: Outfit[];
  selectedDailyOutfits: number[];
  isCreatingEntry: boolean;
  isDeletingEntry: boolean;
  canAddOutfit?: boolean;
  onToggleSelection: (outfitId: number) => void;
  onToggleSelectAll: (outfitIds: number[]) => void;
  onBatchAdd: (e?: React.MouseEvent) => void;
  onAddSingle: (outfit: Outfit, e?: React.MouseEvent) => void;
  onDeleteEntry: (entryId: number, e?: React.MouseEvent) => void;
  onEditEntry: (entry: Calender, e?: React.MouseEvent) => void;
}

export function DailyOutfitsSection({
  calendarEntries,
  outfits,
  selectedDailyOutfits,
  isCreatingEntry,
  isDeletingEntry,
  canAddOutfit = true,
  onToggleSelection,
  onToggleSelectAll,
  onBatchAdd,
  onAddSingle,
  onDeleteEntry,
}: DailyOutfitsSectionProps) {
  // Get daily outfits (isDaily = true)
  const dailyEntries = calendarEntries.filter((entry) => entry.isDaily);
  const dailyOutfits = dailyEntries.flatMap((entry) => entry.outfits);

  // Get available outfits (not in any entry for this day)
  const allPlannedOutfitIds = calendarEntries.flatMap((entry) =>
    entry.outfits.map((o) => o.outfitId)
  );
  const availableDailyOutfits = outfits.filter(
    (outfit) => !allPlannedOutfitIds.includes(outfit.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bricolage text-xl font-semibold text-white flex items-center gap-2">
          <Shirt className="w-6 h-6 text-cyan-400" />
          Daily Outfits
        </h3>
        <p className="font-poppins text-xs text-white/40">
          Outfits for the day without specific occasion
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        {/* Planned Daily Outfits */}
        {dailyOutfits.length > 0 && (
          <div className="mb-6">
            <h4 className="font-poppins text-sm font-semibold text-white/80 mb-3">
              Planned ({dailyOutfits.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {dailyOutfits.map((outfit) => (
                <div
                  key={outfit.calendarId}
                  className="group relative bg-white/5 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-square p-2">
                    <div className="relative w-full h-full grid grid-cols-2 gap-1 rounded-lg overflow-hidden bg-linear-to-br from-slate-500/20 to-blue-500/20">
                      {outfit.outfitDetails.items
                        .slice(0, 4)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="relative bg-white/10 backdrop-blur-sm"
                          >
                            <Image
                              src={item.imgUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              priority={false}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      {outfit.outfitDetails.items.length > 4 && (
                        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                          +{outfit.outfitDetails.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <p className="font-poppins text-sm font-medium text-white truncate">
                      {outfit.outfitName}
                    </p>
                    <p className="font-poppins text-xs text-white/50">
                      {outfit.outfitDetails.items.length} items
                    </p>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => onDeleteEntry(outfit.calendarId, e)}
                      className="p-1.5 bg-red-500/90 hover:bg-red-600 rounded-md transition-colors shadow-lg"
                      title="Remove"
                      disabled={isDeletingEntry}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Daily Outfits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h4 className="font-poppins text-sm font-semibold text-white/80">
                Available Outfits ({availableDailyOutfits.length})
              </h4>
              {availableDailyOutfits.length > 0 && (
                <button
                  onClick={() =>
                    onToggleSelectAll(availableDailyOutfits.map((o) => o.id))
                  }
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {availableDailyOutfits.every((o) =>
                    selectedDailyOutfits.includes(o.id)
                  )
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>
            {selectedDailyOutfits.length > 0 && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={onBatchAdd}
                disabled={isCreatingEntry || !canAddOutfit}
                title={!canAddOutfit ? "Cannot add outfit to calendar in the past" : undefined}
              >
                <Plus className="w-4 h-4" />
                Add {selectedDailyOutfits.length} Outfit
                {selectedDailyOutfits.length > 1 ? "s" : ""}
              </GlassButton>
            )}
          </div>
          {availableDailyOutfits.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableDailyOutfits.map((outfit) => {
                const isSelected = selectedDailyOutfits.includes(outfit.id);
                return (
                  <div
                    key={outfit.id}
                    className={`group relative bg-white/5 rounded-xl border transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? "border-cyan-400 ring-2 ring-cyan-400/50"
                        : "border-white/10 hover:border-cyan-400/50"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelection(outfit.id);
                      }}
                      className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 border-white/50 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:border-cyan-400"
                    >
                      {isSelected && (
                        <div className="w-4 h-4 bg-cyan-400 rounded-sm flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={(e) => onAddSingle(outfit, e)}
                      disabled={isCreatingEntry || !canAddOutfit}
                      className="w-full text-left disabled:opacity-50"
                      title={!canAddOutfit ? "Cannot add outfit to calendar in the past" : undefined}
                    >
                      <div className="aspect-square p-2">
                        <div className="relative w-full h-full grid grid-cols-2 gap-1 rounded-lg overflow-hidden bg-linear-to-br from-slate-500/20 to-blue-500/20">
                          {outfit.items.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="relative bg-white/10 backdrop-blur-sm"
                            >
                              <Image
                                src={item.imgUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                priority={false}
                                loading="lazy"
                              />
                            </div>
                          ))}
                          {outfit.items.length > 4 && (
                            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                              +{outfit.items.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-3 pb-3">
                        <p className="font-poppins text-sm font-medium text-white truncate">
                          {outfit.name}
                        </p>
                        <p className="font-poppins text-xs text-white/50">
                          {outfit.items.length} items
                        </p>
                      </div>

                      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Shirt className="w-10 h-10 mx-auto mb-2 text-white/20" />
              <p className="font-poppins text-sm text-white/50">
                {dailyOutfits.length > 0
                  ? "All your outfits are already planned"
                  : "No outfits available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
