"use client";

import { Plus } from "lucide-react";
import { Outfit } from "@/types/outfit";
import GlassButton from "@/components/ui/glass-button";
import Image from "next/image";

interface AvailableOutfitsGridProps {
  outfits: Outfit[];
  selectedOutfits: number[];
  isCreatingEntry: boolean;
  isLoadingOutfits: boolean;
  onToggleSelection: (outfitId: number) => void;
  onToggleSelectAll: (outfitIds: number[]) => void;
  onBatchAdd: (e?: React.MouseEvent) => void;
  onAddSingle: (outfit: Outfit, e?: React.MouseEvent) => void;
}

export function AvailableOutfitsGrid({
  outfits,
  selectedOutfits,
  isCreatingEntry,
  isLoadingOutfits,
  onToggleSelection,
  onToggleSelectAll,
  onBatchAdd,
  onAddSingle,
}: AvailableOutfitsGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h5 className="font-bricolage font-semibold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-400" />
            Add Outfit to This Occasion
          </h5>
          <button
            onClick={() => onToggleSelectAll(outfits.map((o) => o.id))}
            className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            {outfits.every((o) => selectedOutfits.includes(o.id))
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
        {selectedOutfits.length > 0 && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={onBatchAdd}
            disabled={isCreatingEntry}
          >
            <Plus className="w-4 h-4" />
            Add {selectedOutfits.length} Outfit
            {selectedOutfits.length > 1 ? "s" : ""}
          </GlassButton>
        )}
      </div>
      {isLoadingOutfits ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
          <p className="font-poppins text-xs text-white/60">
            Loading outfits...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {outfits.map((outfit) => {
            const isSelected = selectedOutfits.includes(outfit.id);
            return (
              <div
                key={outfit.id}
                className={`group relative rounded-lg transition-all duration-200 text-left overflow-hidden ${
                  isSelected
                    ? "bg-green-500/20 border-2 border-green-400 ring-2 ring-green-400/50"
                    : "bg-white/5 border border-white/10 hover:border-green-400/50 hover:bg-green-500/10"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(outfit.id);
                  }}
                  className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 border-white/50 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:border-green-400"
                >
                  {isSelected && (
                    <div className="w-4 h-4 bg-green-400 rounded-sm flex items-center justify-center">
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
                  disabled={isCreatingEntry}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Image Grid */}
                  <div className="aspect-square bg-linear-to-br from-white/5 to-white/10">
                    <div className="grid grid-cols-2 gap-0.5 h-full p-1">
                      {[...Array(4)].map((_, index) => {
                        const item = outfit.items[index];
                        return (
                          <div
                            key={
                              item
                                ? `${outfit.id}-${item.itemId || item.id}`
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
                    {outfit.items.length > 4 && (
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        +{outfit.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Outfit Info */}
                  <div className="p-2">
                    <div className="font-medium text-white text-sm line-clamp-1">
                      {outfit.name}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {outfit.items.length} item
                      {outfit.items.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Add Icon */}
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500/80 group-hover:bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
