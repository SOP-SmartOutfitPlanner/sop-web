"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Shirt, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Outfit } from "@/types/outfit";
import GlassButton from "@/components/ui/glass-button";
import Image from "next/image";
import { useOutfits } from "@/hooks/useOutfits";
import { useModalScroll } from "@/hooks/useModalScroll";

interface AddDailyOutfitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onAddOutfit: (outfitIds: number[]) => void;
  isCreatingEntry: boolean;
  existingOutfitIds?: number[];
}

export function AddDailyOutfitModal({
  open,
  onOpenChange,
  selectedDate,
  onAddOutfit,
  isCreatingEntry,
  existingOutfitIds = [],
}: AddDailyOutfitModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOutfits, setSelectedOutfits] = useState<number[]>([]);
  const pageSize = 8;

  // Enable mouse wheel scrolling in modal content area
  const scrollContainerRef = useModalScroll(open, {
    smooth: false, // Disable smooth for faster scrolling
    sensitivity: 1.2, // Slightly faster than default
  });

  const { data: outfitsData, isLoading } = useOutfits({
    pageIndex: currentPage,
    pageSize,
    takeAll: false,
  });

  const outfits = outfitsData?.data?.data || [];
  const metaData = outfitsData?.data?.metaData;

  // Filter out outfits that are already in calendar for this date
  const availableOutfits = outfits.filter(
    (outfit) => !existingOutfitIds.includes(outfit.id)
  );

  const handleToggleSelection = useCallback((outfitId: number) => {
    setSelectedOutfits((prev) =>
      prev.includes(outfitId)
        ? prev.filter((id) => id !== outfitId)
        : [...prev, outfitId]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    const availableIds = availableOutfits.map((o) => o.id);
    const allSelected = availableIds.every((id) => selectedOutfits.includes(id));
    if (allSelected) {
      // Deselect all in current page
      setSelectedOutfits((prev) =>
        prev.filter((id) => !availableIds.includes(id))
      );
    } else {
      // Select all in current page (merge with existing selections)
      setSelectedOutfits((prev) => {
        const newSelections = [
          ...prev.filter((id) => !availableIds.includes(id)),
          ...availableIds,
        ];
        return newSelections;
      });
    }
  }, [availableOutfits, selectedOutfits]);

  const handleAdd = useCallback(() => {
    if (selectedOutfits.length > 0) {
      onAddOutfit(selectedOutfits);
      setSelectedOutfits([]);
    }
  }, [selectedOutfits, onAddOutfit]);

  const handleAddSingle = useCallback(
    (outfit: Outfit) => {
      onAddOutfit([outfit.id]);
    },
    [onAddOutfit]
  );

  // Reset when modal closes
  const handleClose = useCallback(() => {
    setSelectedOutfits([]);
    setCurrentPage(1);
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset page when modal opens
  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      setSelectedOutfits([]);
    }
  }, [open]);

  if (!open) return null;

  const selectedInCurrentPage = availableOutfits.filter((o) =>
    selectedOutfits.includes(o.id)
  ).length;
  const allInCurrentPageSelected =
    availableOutfits.length > 0 &&
    availableOutfits.every((o) => selectedOutfits.includes(o.id));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-71 flex items-center justify-center p-4">
        <div
          className="w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 pt-6 pb-4 shrink-0 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-dela-gothic text-2xl font-bold text-white flex items-center gap-3">
                  <Shirt className="w-7 h-7 text-cyan-400" />
                  Add Daily Outfit
                </h2>
                <p className="font-bricolage text-gray-300 mt-1 text-sm">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreatingEntry}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
                title="Close"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 px-8 py-6 overflow-y-auto overflow-x-hidden min-h-0 scroll-smooth
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-white/10
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-purple-400/60
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:hover:bg-purple-400/80"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y'
            }}
          >
            {/* Selection Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bricolage text-lg font-semibold text-white">
                  Select Outfits ({selectedOutfits.length} selected)
                </h3>
                {availableOutfits.length > 0 && (
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    {allInCurrentPageSelected ? "Deselect Page" : "Select Page"}
                  </button>
                )}
                {metaData && (
                  <span className="text-xs text-white/50 font-normal">
                    ({metaData.totalCount} total available)
                  </span>
                )}
              </div>
            </div>

            {/* Outfits Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                <p className="font-poppins text-sm text-white/60">Loading outfits...</p>
              </div>
            ) : availableOutfits.length === 0 ? (
              <div className="text-center py-12">
                <Shirt className="w-12 h-12 mx-auto mb-3 text-white/20" />
                <p className="font-poppins text-sm text-white/50">
                  No available outfits
                </p>
                <p className="font-poppins text-xs text-white/30 mt-1">
                  All outfits are already added to this date
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableOutfits.map((outfit) => {
                  const isSelected = selectedOutfits.includes(outfit.id);
                  return (
                    <div
                      key={outfit.id}
                      className={`group relative rounded-lg transition-all duration-200 text-left overflow-hidden ${
                        isSelected
                          ? "bg-cyan-500/20 border-2 border-cyan-400 ring-2 ring-cyan-400/50"
                          : "bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelection(outfit.id);
                        }}
                        className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 border-white/50 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:border-cyan-400"
                        title={isSelected ? "Deselect outfit" : "Select outfit"}
                        aria-label={isSelected ? "Deselect outfit" : "Select outfit"}
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
                        onClick={() => handleAddSingle(outfit)}
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
                        <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500/80 group-hover:bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {metaData && metaData.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-white/60">
                  Showing {((metaData.currentPage - 1) * pageSize) + 1}-
                  {Math.min(metaData.currentPage * pageSize, metaData.totalCount)} of{" "}
                  {metaData.totalCount} outfits
                  {selectedOutfits.length > 0 && (
                    <span className="ml-2 text-cyan-400">
                      ({selectedOutfits.length} selected)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!metaData.hasPrevious || isLoading}
                    className="min-w-[80px]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </GlassButton>
                  <div className="flex items-center gap-1 px-3">
                    <span className="font-poppins text-sm text-white/70">
                      Page {metaData.currentPage} of {metaData.totalPages}
                    </span>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(metaData.totalPages, p + 1))
                    }
                    disabled={!metaData.hasNext || isLoading}
                    className="min-w-[80px]"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </GlassButton>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 pt-4 shrink-0 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                {selectedOutfits.length > 0 && (
                  <span>
                    {selectedOutfits.length} outfit
                    {selectedOutfits.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <GlassButton
                  variant="ghost"
                  size="md"
                  onClick={handleClose}
                  disabled={isCreatingEntry}
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="custom"
                  backgroundColor="rgba(59, 130, 246, 0.6)"
                  borderColor="rgba(59, 130, 246, 0.8)"
                  textColor="white"
                  size="md"
                  onClick={handleAdd}
                  disabled={isCreatingEntry || selectedOutfits.length === 0}
                >
                  {isCreatingEntry ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add {selectedOutfits.length > 0 ? `${selectedOutfits.length} ` : ""}
                      Outfit{selectedOutfits.length > 1 ? "s" : ""}
                    </>
                  )}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

