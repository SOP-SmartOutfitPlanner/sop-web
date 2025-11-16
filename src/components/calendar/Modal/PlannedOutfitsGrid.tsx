"use client";

import { Shirt, Trash2 } from "lucide-react";
import { CalendarEntry, Calender } from "@/types/calender";
import Image from "next/image";

interface PlannedOutfitsGridProps {
  outfits: Calender[];
  isDeletingEntry: boolean;
  onDeleteEntry: (entryId: number, e?: React.MouseEvent) => void;
  onEditEntry: (entry: Calender, e?: React.MouseEvent) => void;
  onViewOutfit?: (outfit: Calender, e?: React.MouseEvent) => void;
  calendarEntries: CalendarEntry[];
}

export function PlannedOutfitsGrid({
  outfits,
  isDeletingEntry,
  onDeleteEntry,
  onViewOutfit,
}: PlannedOutfitsGridProps) {
  return (
    <div>
      <h5 className="font-bricolage font-semibold text-white text-sm mb-3 flex items-center gap-2">
        <Shirt className="w-4 h-4 text-cyan-400" />
        Planned Outfits
      </h5>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {outfits.map((outfit) => (
          <div
            key={outfit.calendarId}
            className="group relative rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all duration-200 overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (onViewOutfit) {
                onViewOutfit(outfit, e);
              }
            }}
          >
            {/* Image Grid */}
            <div className="aspect-square bg-linear-to-br from-white/5 to-white/10">
              <div className="grid grid-cols-2 gap-0.5 h-full p-1">
                {[...Array(4)].map((_, index) => {
                  const item = outfit.outfitDetails.items[index];
                  return (
                    <div
                      key={
                        item
                          ? `${outfit.outfitId}-${item.itemId}`
                          : `empty-${index}`
                      }
                      className="bg-white/5 rounded-lg aspect-square flex items-center justify-center overflow-hidden relative"
                    >
                      {item && (
                        <Image
                          src={item.imgUrl}
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          priority={false}
                          loading="lazy"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {outfit.outfitDetails.items.length > 4 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  +{outfit.outfitDetails.items.length - 4}
                </div>
              )}
            </div>

            {/* Outfit Name */}
            <div className="p-2">
              <div className="font-medium text-white text-sm line-clamp-1">
                {outfit.outfitName}
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                {outfit.outfitDetails.items.length} item
                {outfit.outfitDetails.items.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Delete Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEntry(outfit.calendarId, e);
                }}
                className="p-1.5 bg-red-500/90 hover:bg-red-600 rounded-md transition-colors shadow-lg"
                title="Remove outfit"
                disabled={isDeletingEntry}
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
