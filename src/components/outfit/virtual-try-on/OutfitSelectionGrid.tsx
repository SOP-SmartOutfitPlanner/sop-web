"use client";

import { CheckCircle2, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { Outfit } from "@/types/outfit";

interface OutfitSelectionGridProps {
  outfits: Outfit[];
  selectedOutfitId: number | null;
  isLoading: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  onSelectOutfit: (outfitId: number | null) => void;
}

export function OutfitSelectionGrid({
  outfits,
  selectedOutfitId,
  isLoading,
  hasMore,
  loadMoreRef,
  onSelectOutfit,
}: OutfitSelectionGridProps) {
  if (isLoading && outfits.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl bg-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/60">
        <ImageIcon className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-base font-medium">No outfits found</p>
        <p className="text-sm mt-2">Create your first outfit to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
        {outfits.map((outfit) => (
          <button
            key={outfit.id}
            onClick={() => {
              if (selectedOutfitId === outfit.id) {
                onSelectOutfit(null);
              } else {
                onSelectOutfit(outfit.id);
              }
            }}
            className={`relative group rounded-xl overflow-hidden transition-all border-2 ${
              selectedOutfitId === outfit.id
                ? "border-[#4A90E2] shadow-lg shadow-[#4A90E2]/50 scale-[1.02]"
                : "border-white/20 hover:border-white/40 hover:scale-[1.01]"
            }`}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/10 to-[#5BA3F5]/10" />
            
            {/* Content */}
            <div className="relative aspect-[3/4] p-3 flex flex-col">
              {/* Items grid - 2x2 layout */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                {outfit.items.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden bg-black/20 border border-white/10"
                  >
                    {item.imgUrl ? (
                      <NextImage
                        src={item.imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* +N badge for extra items */}
                {outfit.items.length > 4 && (
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4A90E2]/90 to-[#5BA3F5]/90 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/20">
                    +{outfit.items.length - 4}
                  </div>
                )}
              </div>
              
              {/* Outfit info */}
              <div className="mt-3 space-y-1">
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {outfit.name}
                </p>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <span>{outfit.items.length} items</span>
                  {outfit.items.length > 5 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-medium">
                      Over limit
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Selection indicator */}
            {selectedOutfitId === outfit.id && (
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-[#4A90E2] shadow-xl border-2 border-white z-10">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="py-6 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-white/60">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-sm">Loading more outfits...</span>
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}
    </div>
  );
}
