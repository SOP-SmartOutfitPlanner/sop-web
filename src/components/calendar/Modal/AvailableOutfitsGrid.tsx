"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 8;

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
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(outfits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageOutfits = outfits.slice(startIndex, endIndex);

  // Reset to page 1 when outfits change or current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [outfits.length, totalPages, currentPage]);

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

  const currentPageSelectedCount = currentPageOutfits.filter((o) =>
    selectedOutfits.includes(o.id)
  ).length;
  const allInCurrentPageSelected =
    currentPageOutfits.length > 0 &&
    currentPageOutfits.every((o) => selectedOutfits.includes(o.id));
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h5 className="font-bricolage font-semibold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-400" />
            Add Outfit to This Occasion
            {outfits.length > 0 && (
              <span className="text-xs text-white/50 font-normal">
                ({outfits.length} available)
              </span>
            )}
          </h5>
          {outfits.length > ITEMS_PER_PAGE && (
            <button
              onClick={handleToggleSelectAll}
              className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              {allInCurrentPageSelected ? "Deselect Page" : "Select Page"}
            </button>
          )}
          {outfits.length <= ITEMS_PER_PAGE && (
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
                Showing {startIndex + 1}-{Math.min(endIndex, outfits.length)} of{" "}
                {outfits.length} outfits
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
  );
}
