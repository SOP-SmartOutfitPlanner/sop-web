"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  Heart,
  Bookmark,
  X,
  Shirt,
  Eye,
} from "lucide-react";
import NextImage from "next/image";
import { Image as AntImage } from "antd";
import { Outfit } from "@/types/outfit";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import GlassButton from "@/components/ui/glass-button";

interface OutfitSidePanelLayoutProps {
  outfits: Outfit[];
  selectedOutfitId: number | null;
  isLoading: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  onSelectOutfit: (outfitId: number | null) => void;
  // Try-on related props
  humanImagePreview: string;
  selectedItemIds: number[];
  onToggleItem: (itemId: number) => void;
  onGenerateTryOn: () => void;
  isProcessing: boolean;
  canGenerate: boolean;
}

export function OutfitSidePanelLayout({
  outfits,
  selectedOutfitId,
  isLoading,
  hasMore,
  loadMoreRef,
  onSelectOutfit,
  humanImagePreview,
  selectedItemIds,
  onToggleItem,
  onGenerateTryOn,
  isProcessing,
  canGenerate,
}: OutfitSidePanelLayoutProps) {
  // Get selected outfit details
  const selectedOutfit = useMemo(() => {
    if (!selectedOutfitId) return null;
    return outfits.find((o) => o.id === selectedOutfitId) || null;
  }, [selectedOutfitId, outfits]);

  // Loading skeleton
  if (isLoading && outfits.length === 0) {
    return (
      <div className="flex h-full gap-4">
        {/* Left: Outfit List skeleton */}
        <div className="w-[320px] flex-shrink-0 space-y-3 overflow-y-auto custom-scrollbar pr-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-white/10 animate-pulse"
            />
          ))}
        </div>
        {/* Right: Preview skeleton */}
        <div className="flex-1 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  // Empty state
  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-white/60">
        <ImageIcon className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-base font-medium">No outfits found</p>
        <p className="text-sm mt-2">Create your first outfit to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* LEFT PANEL: Outfit List */}
      <div className="w-[320px] flex-shrink-0 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
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
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                selectedOutfitId === outfit.id
                  ? "bg-gradient-to-r from-[#4A90E2]/30 to-[#5BA3F5]/20 border-[#4A90E2] shadow-lg shadow-[#4A90E2]/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {/* Outfit thumbnail - 2x2 grid */}
              <div className="w-16 h-16 flex-shrink-0 grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden bg-black/20">
                {outfit.items.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="relative aspect-square bg-black/30">
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
                        <Shirt className="w-3 h-3 text-white/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Outfit info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white text-sm font-semibold truncate">
                  {outfit.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/60 text-xs">
                    {outfit.items.length} items
                  </span>
                  {outfit.items.length > 5 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-medium">
                      Over limit
                    </span>
                  )}
                </div>
              </div>

              {/* Selection indicator / Arrow */}
              <div className="flex-shrink-0">
                {selectedOutfitId === outfit.id ? (
                  <div className="p-1.5 rounded-full bg-[#4A90E2]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-white/40" />
                )}
              </div>
            </button>
          ))}

          {/* Load more */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-white/60">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Try-On Preview */}
      <div className="flex-1 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 overflow-hidden flex flex-col">
        {selectedOutfit ? (
          <>
            {/* Preview Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[#4A90E2]/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-bricolage">
                    {selectedOutfit.name}
                  </h3>
                  <p className="text-sm text-white/60 mt-0.5">
                    {selectedOutfit.items.length} items in this outfit
                  </p>
                </div>
                <button
                  onClick={() => onSelectOutfit(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                {/* Left: Human Image + Try-On Button */}
                <div className="flex flex-col items-center">
                  {/* Human Image Preview */}
                  <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-xl">
                    {humanImagePreview ? (
                      <AntImage
                        src={humanImagePreview}
                        alt="Your photo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        preview={{
                          mask: (
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>Preview</span>
                            </div>
                          ),
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p className="text-sm">Upload your photo first</p>
                      </div>
                    )}

                    {/* Overlay badge */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                        <p className="text-xs text-white/80 text-center">
                          Your photo for try-on
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Try-On Button */}
                  <div className="mt-4 w-full max-w-[240px]">
                    <GlassButton
                      variant="primary"
                      size="lg"
                      onClick={onGenerateTryOn}
                      disabled={!canGenerate || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Try On This Outfit</span>
                        </>
                      )}
                    </GlassButton>

                    {!humanImagePreview && (
                      <p className="text-xs text-yellow-300/80 text-center mt-2">
                        Please upload your photo first
                      </p>
                    )}

                    {selectedItemIds.length > 5 && (
                      <p className="text-xs text-red-300 text-center mt-2">
                        Too many items selected ({selectedItemIds.length}/5)
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Outfit Items */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                    <Shirt className="w-4 h-4" />
                    Items in Outfit
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-white/10 text-xs">
                      {selectedItemIds.length}/5 selected
                    </span>
                  </h4>

                  <div className="flex-1 grid grid-cols-2 gap-3 content-start">
                    {selectedOutfit.items.map((item) => {
                      const isSelected = selectedItemIds.includes(item.itemId);
                      return (
                        <button
                          key={item.itemId}
                          onClick={() => onToggleItem(item.itemId)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-[#4A90E2] shadow-lg shadow-[#4A90E2]/30 scale-[1.02]"
                              : "border-white/20 hover:border-white/40"
                          }`}
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
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <Shirt className="w-8 h-8 text-white/30" />
                            </div>
                          )}

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 rounded-full bg-[#4A90E2] shadow-lg">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Item name overlay */}
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-xs text-white truncate font-medium">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-white/60 truncate">
                              {item.categoryName}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No outfit selected - Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4A90E2]/20 to-[#5BA3F5]/20 flex items-center justify-center mb-4">
              <Shirt className="w-10 h-10 text-[#4A90E2]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Select an Outfit
            </h3>
            <p className="text-sm text-white/60 max-w-xs">
              Choose an outfit from the list on the left to preview and try it on virtually
            </p>
            <div className="mt-6 flex items-center gap-2 text-white/40 text-sm">
              <ChevronRight className="w-4 h-4 animate-pulse" />
              <span>Click on any outfit to view details</span>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
