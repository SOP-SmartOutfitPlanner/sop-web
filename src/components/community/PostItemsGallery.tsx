"use client";

import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PostItemDetailModel } from "@/types/community";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PostItemsGalleryProps {
  items: PostItemDetailModel[];
}

const INITIAL_DISPLAY_COUNT = 8; // Show 8 items initially (2 rows of 4)

export function PostItemsGallery({ items }: PostItemsGalleryProps) {
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleImageLoad = useCallback((itemId: number) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  if (!items || items.length === 0) return null;

  const shouldShowToggle = items.length > INITIAL_DISPLAY_COUNT;
  const displayedItems = showAll
    ? items
    : items.slice(0, INITIAL_DISPLAY_COUNT);
  const remainingCount = items.length - INITIAL_DISPLAY_COUNT;

  return (
    <>
      <Tooltip.Provider delayDuration={200}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bricolage font-semibold text-white/90">
              Items in this post ({items.length})
            </h4>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {displayedItems.map((item) => {
              const CategoryIcon = getCategoryIcon(item.categoryId);
              const categoryColor = getCategoryColor(item.categoryId);
              const isDeleted = item.isDeleted;

              return (
                <Tooltip.Root key={item.id}>
                  <Tooltip.Trigger asChild>
                    <motion.button
                      onClick={() => !isDeleted && setSelectedItemId(item.id)}
                      className={`relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all ${
                        isDeleted
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      whileHover={!isDeleted ? { scale: 1.02 } : undefined}
                      whileTap={!isDeleted ? { scale: 0.98 } : undefined}
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
                          sizes="(max-width: 640px) 50vw, 25vw"
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
                      {isDeleted && (
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
                                isDeleted ? "line-through" : ""
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
                  {isDeleted && (
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
