"use client";

import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PostOutfitDetailModel, PostItemDetailModel } from "@/types/community";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";
import { ChevronDown, ChevronUp, Bookmark, Loader2 } from "lucide-react";
import {
  useSaveItemFromPost,
  useSaveOutfitFromPost,
} from "@/hooks/useSaveFromPost";
import { useAuthStore } from "@/store/auth-store";

interface PostOutfitDisplayProps {
  outfit: PostOutfitDetailModel;
  postId: number; // Required for save functionality
}

const INITIAL_DISPLAY_COUNT = 8; // Show 8 items initially (2 rows of 4)

// Save button for individual items in outfit display
function ItemSaveButton({
  item,
  postId,
}: {
  item: PostItemDetailModel;
  postId: number;
}) {
  const { isSaved, isLoading, toggleSave } = useSaveItemFromPost(
    item.id,
    postId,
    item.isSaved
  );
  const { user } = useAuthStore();

  if (item.isDeleted) return null;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            disabled={isLoading || !user}
            className={`absolute bottom-1.5 right-1.5 flex items-center justify-center w-6 h-6 rounded-md backdrop-blur-sm transition-all duration-200 ${
              isSaved
                ? "bg-cyan-500/90 text-white hover:bg-cyan-600/90"
                : "bg-black/50 text-white/80 hover:bg-black/70 hover:text-white"
            } ${isLoading ? "opacity-70 cursor-wait" : ""} ${
              !user ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label={isSaved ? "Remove from saved" : "Save item"}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Bookmark
                className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`}
              />
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 z-[100] font-poppins"
            sideOffset={5}
          >
            {!user
              ? "Login to save items"
              : isSaved
              ? "Remove from saved"
              : "Save to wardrobe"}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Save button for outfit
function OutfitSaveButton({
  outfit,
  postId,
}: {
  outfit: PostOutfitDetailModel;
  postId: number;
}) {
  const { isSaved, isLoading, toggleSave } = useSaveOutfitFromPost(
    outfit.id,
    postId,
    outfit.isSaved
  );
  const { user } = useAuthStore();

  if (outfit.isDeleted) return null;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            disabled={isLoading || !user}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              isSaved
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30"
                : "bg-white/10 text-white/80 border border-white/10 hover:bg-white/20 hover:text-white"
            } ${isLoading ? "opacity-70 cursor-wait" : ""} ${
              !user ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label={isSaved ? "Remove outfit from saved" : "Save outfit"}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Bookmark
                className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`}
              />
            )}
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 z-[100] font-poppins"
            sideOffset={5}
          >
            {!user
              ? "Login to save outfits"
              : isSaved
              ? "Remove outfit from saved"
              : "Save outfit to your collection"}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function PostOutfitDisplay({ outfit, postId }: PostOutfitDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleImageLoad = useCallback((itemId: number) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  const isDeleted = outfit.isDeleted;
  const itemCount = outfit.items?.length || 0;
  const shouldShowToggle = itemCount > INITIAL_DISPLAY_COUNT;
  const displayedItems = showAll
    ? outfit.items
    : outfit.items?.slice(0, INITIAL_DISPLAY_COUNT);
  const remainingCount = itemCount - INITIAL_DISPLAY_COUNT;

  return (
    <>
      <Tooltip.Provider delayDuration={200}>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bricolage font-semibold text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                {itemCount}
              </span>
              Outfit in this post
            </h4>
            {shouldShowToggle && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1"
              >
                {showAll ? (
                  <>
                    Show Less
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    +{remainingCount} more
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Outfit Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h5
                className={`text-sm font-medium text-white truncate flex-1 ${
                  isDeleted ? "line-through" : ""
                }`}
                title={outfit.name}
              >
                {outfit.name}
              </h5>
              {isDeleted && (
                <span className="bg-red-500/80 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                  Deleted
                </span>
              )}
              {/* Save Outfit Button */}
              <OutfitSaveButton outfit={outfit} postId={postId} />
            </div>
            {outfit.description && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">
                    {outfit.description}
                  </p>
                </Tooltip.Trigger>
                {outfit.description.length > 80 && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 max-w-xs"
                      sideOffset={5}
                    >
                      {outfit.description}
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            )}
          </div>

          {/* Items Grid - 4 per row compact layout */}
          {outfit.items && outfit.items.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {displayedItems?.map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.categoryId);
                const categoryColor = getCategoryColor(item.categoryId);
                const isItemDeleted = item.isDeleted;

                return (
                  <Tooltip.Root key={`${item.id}-${index}`}>
                    <Tooltip.Trigger asChild>
                      <motion.button
                        onClick={() =>
                          !isItemDeleted && setSelectedItemId(item.id)
                        }
                        className={`relative group rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-200 ${
                          isItemDeleted
                            ? "opacity-50 grayscale cursor-not-allowed"
                            : "cursor-pointer hover:bg-white/10"
                        }`}
                        whileHover={
                          !isItemDeleted ? { scale: 1.02 } : undefined
                        }
                        whileTap={!isItemDeleted ? { scale: 0.98 } : undefined}
                      >
                        {/* Compact Image Container */}
                        <div className="aspect-square relative bg-slate-900/20 overflow-hidden">
                          <Image
                            src={item.imgUrl}
                            alt={item.name}
                            fill
                            className={`object-cover transition-all duration-300 ${
                              imageLoaded[item.id] ? "opacity-100" : "opacity-0"
                            } ${!isItemDeleted && "group-hover:scale-105"}`}
                            onLoad={() => handleImageLoad(item.id)}
                            sizes="(max-width: 640px) 25vw, 150px"
                            priority={false}
                          />
                          {!imageLoaded[item.id] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400/30 border-t-cyan-400"></div>
                            </div>
                          )}

                          {/* Mini Category Badge */}
                          <div
                            className={`absolute top-1.5 right-1.5 ${categoryColor} text-white rounded-md px-1.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm ${
                              imageLoaded[item.id] ? "opacity-90" : "opacity-0"
                            }`}
                          >
                            <CategoryIcon className="w-3 h-3" />
                          </div>

                          {/* Save Item Button */}
                          {imageLoaded[item.id] && (
                            <ItemSaveButton item={item} postId={postId} />
                          )}

                          {/* Deleted Overlay */}
                          {isItemDeleted && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <div className="bg-red-500/80 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm">
                                Deleted
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Minimal Info Section */}
                        <div className="p-2 bg-slate-900/40 border-t border-white/5">
                          <h3
                            className={`text-xs font-medium text-white truncate ${
                              isItemDeleted ? "line-through opacity-60" : ""
                            }`}
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                        </div>
                      </motion.button>
                    </Tooltip.Trigger>
                    {isItemDeleted && (
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 font-poppins"
                          sideOffset={5}
                        >
                          This item has been deleted
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    )}
                  </Tooltip.Root>
                );
              })}
            </div>
          )}
        </div>
      </Tooltip.Provider>

      {/* View Item Dialog - Rendered via portal to appear outside post DOM */}
      {selectedItemId &&
        typeof document !== "undefined" &&
        createPortal(
          <ViewItemDialog
            itemId={selectedItemId}
            open={!!selectedItemId}
            onOpenChange={(open) => !open && setSelectedItemId(null)}
          />,
          document.body
        )}
    </>
  );
}
