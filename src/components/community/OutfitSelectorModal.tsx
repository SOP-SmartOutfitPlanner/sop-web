"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  Shirt,
  Eye,
  X,
} from "lucide-react";
import { useOutfits } from "@/hooks/useOutfits";
import { outfitAPI } from "@/lib/api/outfit-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";
import { Outfit } from "@/types/outfit";
import { toast } from "sonner";
import Image from "next/image";
import GlassButton from "@/components/ui/glass-button";

interface OutfitSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (outfitId: number, outfitData: Outfit) => void;
  selectedOutfitId?: number | null;
  title?: string;
  description?: string;
}

const OUTFITS_PER_PAGE = 12;

export function OutfitSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedOutfitId,
  title = "Select Outfit",
  description = "Choose an outfit to attach",
}: OutfitSelectorModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(null);
  const [previewOutfitId, setPreviewOutfitId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Sync with parent when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedId(selectedOutfitId || null);
      setPreviewOutfitId(null);
      setCurrentPage(1);
    }
  }, [isOpen, selectedOutfitId]);

  // Fetch outfits with pagination
  const { data, isLoading } = useOutfits({
    pageIndex: currentPage,
    pageSize: OUTFITS_PER_PAGE,
    takeAll: false,
    search: searchQuery || undefined,
  });

  // Fetch outfit preview data
  const { data: previewOutfit, isLoading: isLoadingPreview } = useQuery({
    queryKey: ["outfit", "preview", previewOutfitId],
    queryFn: () => outfitAPI.getOutfit(previewOutfitId!),
    enabled: !!previewOutfitId && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const outfits = data?.data?.data || [];
  const totalPages = data?.data?.metaData?.totalPages || 1;
  const totalCount = data?.data?.metaData?.totalCount || 0;

  const handleOutfitSelect = useCallback(
    async (outfitId: number) => {
      setLocalSelectedId(outfitId);

      try {
        const outfitData = await outfitAPI.getOutfit(outfitId);
        queryClient.setQueryData(["outfit", outfitId], outfitData);
        onSelect(outfitId, outfitData);
      } catch (error) {
        console.error("Failed to fetch outfit:", error);
        toast.error("Failed to load outfit details");
      }
    },
    [onSelect, queryClient]
  );

  const handlePreviewOutfit = useCallback((outfitId: number) => {
    setPreviewOutfitId(outfitId);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOutfitId(null);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] p-0 gap-0 backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-cyan-400/10 flex-shrink-0">
          <DialogTitle className="text-2xl font-bricolage font-bold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-white/60 mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Main content area with optional preview panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Outfits list */}
          <div
            className={`flex flex-col flex-1 min-w-0 ${
              previewOutfitId ? "border-r border-cyan-400/10" : ""
            }`}
          >
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-cyan-400/10 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search outfits..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Outfits Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-cyan-400"></div>
                </div>
              ) : outfits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-lg font-bricolage font-bold text-white mb-2">
                    No outfits found
                  </h3>
                  <p className="text-sm text-white/60">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "Create your first outfit to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                  {outfits.map((outfit) => {
                    const isSelected = localSelectedId === outfit.id;

                    return (
                      <div
                        key={outfit.id}
                        className={`rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer group ${
                          isSelected
                            ? "ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30 scale-[1.02]"
                            : "ring-1 ring-white/10 hover:ring-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01]"
                        }`}
                        onClick={() => handleOutfitSelect(outfit.id)}
                      >
                        {/* Outfit Header */}
                        <div className="p-4 bg-white/5 border-b border-white/10">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Shirt className="w-4 h-4 text-cyan-400" />
                                {isSelected && (
                                  <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                                    <Check
                                      className="w-3 h-3 text-white"
                                      strokeWidth={3}
                                    />
                                  </div>
                                )}
                              </div>
                              <h3 className="font-bricolage font-bold text-white text-sm truncate">
                                {outfit.name}
                              </h3>
                              <div className="h-10 mt-1">
                                {outfit.description ? (
                                  <p className="text-xs text-white/60 line-clamp-2">
                                    {outfit.description}
                                  </p>
                                ) : (
                                  <div className="h-full" />
                                )}
                              </div>
                              <p className="text-xs text-white/40 mt-2">
                                {outfit.items?.length || 0} items
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex-1 p-4 bg-white/5 flex flex-col">
                          <div className="grid grid-cols-2 gap-2 mb-3 flex-1 content-start">
                            {outfit.items?.slice(0, 4).map((item) => {
                              const CategoryIcon = getCategoryIcon(
                                item.categoryId
                              );
                              const categoryColor = getCategoryColor(
                                item.categoryId
                              );

                              return (
                                <div
                                  key={item.id}
                                  className="relative aspect-square rounded-lg overflow-hidden bg-white/5"
                                >
                                  <Image
                                    src={item.imgUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                  />
                                  <div
                                    className={`absolute bottom-1 left-1 flex items-center gap-1 ${categoryColor} text-white rounded px-1.5 py-0.5 text-[10px] font-medium`}
                                  >
                                    <CategoryIcon className="w-2.5 h-2.5" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Select Button */}
                          <div className="flex gap-2">
                            <GlassButton
                              variant="secondary"
                              size="sm"
                              onClick={(e?: React.MouseEvent) => {
                                e?.stopPropagation();
                                handlePreviewOutfit(outfit.id);
                              }}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </GlassButton>
                            <GlassButton
                              variant={isSelected ? "primary" : "secondary"}
                              size="sm"
                              onClick={(e?: React.MouseEvent) => {
                                e?.stopPropagation();
                                handleOutfitSelect(outfit.id);
                              }}
                              className="flex-1"
                            >
                              {isSelected ? "Selected" : "Select"}
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview Panel */}
          {previewOutfitId && (
            <div className="w-[350px] flex-shrink-0 flex flex-col bg-white/5 overflow-hidden">
              {/* Preview Header */}
              <div className="px-4 py-3 border-b border-cyan-400/10 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bricolage font-bold text-white">
                  Outfit Preview
                </h3>
                <button
                  onClick={closePreview}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-white/20 border-t-cyan-400"></div>
                  </div>
                ) : previewOutfit ? (
                  <div className="space-y-4">
                    {/* Outfit Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Shirt className="w-5 h-5 text-cyan-400" />
                        <h4 className="font-bricolage font-bold text-white text-lg">
                          {previewOutfit.name}
                        </h4>
                      </div>
                      {previewOutfit.description && (
                        <p className="text-sm text-white/60 leading-relaxed">
                          {previewOutfit.description}
                        </p>
                      )}
                      <p className="text-xs text-white/40 mt-2">
                        {previewOutfit.items?.length || 0} items in this outfit
                      </p>
                    </div>

                    {/* All Items Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {previewOutfit.items?.map((item) => {
                        const CategoryIcon = getCategoryIcon(item.categoryId);
                        const categoryColor = getCategoryColor(item.categoryId);

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl overflow-hidden bg-white/5 border border-white/10"
                          >
                            <div className="relative aspect-square">
                              <Image
                                src={item.imgUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="150px"
                              />
                              <div
                                className={`absolute bottom-1.5 left-1.5 flex items-center gap-1 ${categoryColor} text-white rounded px-1.5 py-0.5 text-[10px] font-medium`}
                              >
                                <CategoryIcon className="w-2.5 h-2.5" />
                                <span>{item.categoryName}</span>
                              </div>
                            </div>
                            <div className="p-2 bg-black/30">
                              <p className="text-xs text-white font-medium truncate">
                                {item.name}
                              </p>
                              {item.brand && (
                                <p className="text-[10px] text-white/50 truncate">
                                  {item.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Select from Preview */}
                    <GlassButton
                      variant={
                        localSelectedId === previewOutfitId
                          ? "primary"
                          : "secondary"
                      }
                      size="md"
                      onClick={() => handleOutfitSelect(previewOutfitId)}
                      className="w-full"
                    >
                      {localSelectedId === previewOutfitId ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        "Select This Outfit"
                      )}
                    </GlassButton>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Pagination and Actions */}
        <div className="flex-shrink-0 border-t border-cyan-400/10 bg-gradient-to-t from-cyan-950/40 to-transparent">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-cyan-400/10">
              <p className="text-sm text-white/60">
                Page {currentPage} of {totalPages} ({totalCount} outfits)
              </p>
              <div className="flex gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 px-6 py-4">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              onClick={onClose}
              disabled={!localSelectedId}
              className="flex-1"
            >
              {localSelectedId ? "Confirm Selection" : "Select an Outfit"}
            </GlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
