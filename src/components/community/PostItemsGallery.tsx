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
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bricolage font-semibold text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                {items.length}
              </span>
              Items in this post
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
          <div className="grid grid-cols-4 gap-2">
            {displayedItems.map((item) => {
              const CategoryIcon = getCategoryIcon(item.categoryId);
              const categoryColor = getCategoryColor(item.categoryId);
              const isDeleted = item.isDeleted;

              return (
                <Tooltip.Root key={item.id}>
                  <Tooltip.Trigger asChild>
                    <motion.button
                      onClick={() => !isDeleted && setSelectedItemId(item.id)}
                      className={`relative group rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-200 ${
                        isDeleted
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : "cursor-pointer hover:bg-white/10"
                      }`}
                      whileHover={!isDeleted ? { scale: 1.02 } : undefined}
                      whileTap={!isDeleted ? { scale: 0.98 } : undefined}
                    >
                      {/* Compact Image Container */}
                      <div className="aspect-square relative bg-slate-900/20 overflow-hidden">
                        <Image
                          src={item.imgUrl}
                          alt={item.name}
                          fill
                          className={`object-cover transition-all duration-300 ${
                            imageLoaded[item.id] ? "opacity-100" : "opacity-0"
                          } ${!isDeleted && "group-hover:scale-105"}`}
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

                        {/* Deleted Overlay */}
                        {isDeleted && (
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
                            isDeleted ? "line-through opacity-60" : ""
                          }`}
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        {item.brand && (
                          <p
                            className="text-xs text-white/50 mt-0.5 truncate"
                            title={item.brand}
                          >
                            {item.brand}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  </Tooltip.Trigger>
                  {isDeleted && (
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
