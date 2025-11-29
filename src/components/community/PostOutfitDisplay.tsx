"use client";

import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PostOutfitDetailModel } from "@/types/community";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PostOutfitDisplayProps {
  outfit: PostOutfitDetailModel;
}

const INITIAL_DISPLAY_COUNT = 4; // Show 4 items initially (1 row of 4)

export function PostOutfitDisplay({ outfit }: PostOutfitDisplayProps) {
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
        <div>
          <h4 className="text-sm font-bricolage font-semibold text-white/90 mb-3">
            Outfit in this post
          </h4>

          {/* Outfit Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h5
                className={`text-base font-bricolage font-bold text-white truncate ${
                  isDeleted ? "line-through" : ""
                }`}
                title={outfit.name}
              >
                {outfit.name}
              </h5>
              {isDeleted && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      Deleted
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-white/10"
                      sideOffset={5}
                    >
                      This outfit was deleted
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}
            </div>
            {outfit.description && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <p className="text-sm text-white/60 mt-1.5 line-clamp-2">
                    {outfit.description}
                  </p>
                </Tooltip.Trigger>
                {outfit.description.length > 100 && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-white/10 max-w-xs"
                      sideOffset={5}
                    >
                      {outfit.description}
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            )}
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-white/40">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
              {shouldShowToggle && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1"
                >
                  {showAll ? (
                    <>
                      Show Less
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Show All ({remainingCount} more)
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Items Grid - Always visible, responsive for many items */}
          {outfit.items && outfit.items.length > 0 && (
            <div className="grid grid-cols-4 gap-2.5">
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
                        className={`relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all ${
                          isItemDeleted
                            ? "opacity-50 grayscale cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        whileHover={
                          !isItemDeleted ? { scale: 1.02 } : undefined
                        }
                        whileTap={!isItemDeleted ? { scale: 0.98 } : undefined}
                      >
                        {/* Image */}
                        <div className="aspect-square relative bg-white/5">
                          <Image
                            src={item.imgUrl}
                            alt={item.name}
                            fill
                            className={`object-cover transition-opacity duration-200 ${
                              imageLoaded[item.id] ? "opacity-100" : "opacity-0"
                            }`}
                            onLoad={() => handleImageLoad(item.id)}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          {!imageLoaded[item.id] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
                            </div>
                          )}
                        </div>

                        {/* Category Badge */}
                        <div
                          className={`absolute bottom-2 left-2 flex items-center gap-1.5 ${categoryColor} text-white rounded-lg px-2 py-0.5 [@media(hover:none)]:px-3 [@media(hover:none)]:py-1.5 text-xs font-medium transition-opacity duration-200 ${
                            imageLoaded[item.id] ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {item.categoryName}
                          </span>
                        </div>

                        {/* Deleted Badge */}
                        {isItemDeleted && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Deleted
                          </div>
                        )}

                        {/* Item Name */}
                        <div className="p-2 bg-white/5">
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <p
                                className={`text-xs text-white/80 truncate font-medium ${
                                  isItemDeleted ? "line-through" : ""
                                }`}
                              >
                                {item.name}
                              </p>
                            </Tooltip.Trigger>
                            {item.name.length > 20 && (
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 max-w-xs z-[70]"
                                  sideOffset={5}
                                >
                                  {item.name}
                                  <Tooltip.Arrow className="fill-gray-900" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            )}
                          </Tooltip.Root>
                        </div>
                      </motion.button>
                    </Tooltip.Trigger>
                    {isItemDeleted && (
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-white/10"
                          sideOffset={5}
                        >
                          This item was deleted from your wardrobe
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
