"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, X, Search, Filter } from "lucide-react";
import { Outfit } from "@/types/outfit";
import GlassButton from "@/components/ui/glass-button";
import Image from "next/image";
import { useModalScroll } from "@/hooks/useModalScroll";

interface AvailableOutfitsGridProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfits: Outfit[];
  selectedOutfits: number[];
  isCreatingEntry: boolean;
  isLoadingOutfits: boolean;
  onToggleSelection: (outfitId: number) => void;
  onToggleSelectAll: (outfitIds: number[]) => void;
  onBatchAdd: (e?: React.MouseEvent) => void;
  onAddSingle: (outfit: Outfit, e?: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showFavoriteOnly: boolean;
  onFavoriteToggle: () => void;
}

const ITEMS_PER_PAGE = 8;

export function AvailableOutfitsGrid({
  open,
  onOpenChange,
  outfits,
  selectedOutfits,
  isCreatingEntry,
  isLoadingOutfits,
  onToggleSelection,
  onToggleSelectAll,
  onBatchAdd,
  onAddSingle,
  searchQuery,
  onSearchChange,
  showFavoriteOnly,
  onFavoriteToggle,
}: AvailableOutfitsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const scrollContainerRef = useModalScroll(open, {
    smooth: false,
    sensitivity: 1.1,
  });

  // Calculate pagination
  const totalPages = Math.ceil(outfits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageOutfits = outfits.slice(startIndex, endIndex);

  // Reset to page 1 when current page exceeds total pages (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Reset to page 1 when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentPage(1);
    }
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleToggleSelectAll = () => {
    const currentPageIds = currentPageOutfits.map((o) => o.id);
    const allSelected = currentPageIds.every((id) =>
      selectedOutfits.includes(id)
    );
    if (allSelected) {
      // Deselect all in current page
      onToggleSelectAll(
        selectedOutfits.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      // Select all in current page (merge with existing selections)
      const newSelections = [
        ...selectedOutfits.filter((id) => !currentPageIds.includes(id)),
        ...currentPageIds,
      ];
      onToggleSelectAll(newSelections);
    }
  };

  const allInCurrentPageSelected =
    currentPageOutfits.length > 0 &&
    currentPageOutfits.every((o) => selectedOutfits.includes(o.id));

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-71 flex items-center justify-center p-4">
        <div
          className="w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 pt-6 pb-4 shrink-0 border-b border-white/10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-dela-gothic text-2xl font-bold text-white flex items-center gap-3">
                  <Plus className="w-6 h-6 text-green-400" />
                  Add Outfit to This Occasion
                </h2>
                {outfits.length > 0 && (
                  <p className="font-poppins text-sm text-white/60 mt-1">
                    {outfits.length} outfit
                    {outfits.length > 1 ? "s" : ""} available to add
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreatingEntry}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all duration-200"
                title="Close"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Filter Section */}
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search outfits..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 transition-all"
                />
              </div>

              {/* Filter Options */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Filter className="w-4 h-4" />
                  <span>Filters:</span>
                </div>
                
                {/* Favorite Toggle */}
                <button
                  onClick={onFavoriteToggle}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    showFavoriteOnly
                      ? "bg-pink-500/30 text-pink-300 border border-pink-400/50"
                      : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/15"
                  }`}
                >
                  ⭐ Favorites Only
                </button>
              </div>
            </div>
          </div>
          <div
            ref={scrollContainerRef}
            className="flex-1 px-8 py-6 overflow-y-auto overflow-x-hidden min-h-0
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-white/10
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-purple-400/60
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:hover:bg-purple-400/80"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bricolage font-semibold text-white text-base flex items-center gap-2">
                  Select Outfits
                  <span className="text-xs text-white/50 font-normal">
                    {selectedOutfits.length} selected
                  </span>
                </h3>
                {outfits.length > ITEMS_PER_PAGE && (
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
                  >
                    {allInCurrentPageSelected ? "Deselect Page" : "Select Page"}
                  </button>
                )}
                {outfits.length <= ITEMS_PER_PAGE && outfits.length > 0 && (
                  <button
                    onClick={() => onToggleSelectAll(outfits.map((o) => o.id))}
                    className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
                  >
                    {outfits.every((o) => selectedOutfits.includes(o.id))
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
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
            ) : outfits.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-poppins text-sm text-white/50">
                  No available outfits
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {currentPageOutfits.map((outfit) => {
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-white/60">
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, outfits.length)} of {outfits.length} outfits
                      {selectedOutfits.length > 0 && (
                        <span className="ml-2 text-green-400">
                          ({selectedOutfits.length} selected)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoadingOutfits}
                        className="min-w-[80px]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </GlassButton>
                      <div className="flex items-center gap-1 px-3">
                        <span className="font-poppins text-sm text-white/70">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages || isLoadingOutfits}
                        className="min-w-[80px]"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
