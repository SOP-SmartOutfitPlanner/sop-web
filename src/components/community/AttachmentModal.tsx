"use client";

import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Package } from "lucide-react";
import { PostItemDetailModel, PostOutfitDetailModel } from "@/types/community";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";
import { useScrollLock } from "@/hooks/useScrollLock";

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "items" | "outfit";
  items?: PostItemDetailModel[];
  outfit?: PostOutfitDetailModel;
}

export function AttachmentModal({
  isOpen,
  onClose,
  type,
  items,
  outfit,
}: AttachmentModalProps) {
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  // Prevent closing AttachmentModal when ViewItemDialog is open
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if ViewItemDialog is not open
    if (!open && !selectedItemId) {
      onClose();
    } else if (!open && selectedItemId) {
      // If trying to close while ViewItemDialog is open, do nothing
      return;
    }
  };

  const handleImageLoad = useCallback((itemId: number) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  const displayItems = type === "items" ? items || [] : outfit?.items || [];
  const totalCount = displayItems.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className={`w-[65vw] p-0 backdrop-blur-2xl bg-gradient-to-br from-slate-950/95 via-cyan-950/90 to-blue-950/95 border-2 border-cyan-400/20 shadow-[0_0_80px_rgba(34,211,238,0.15)] rounded-3xl overflow-hidden flex flex-col ${
            type === "items"
              ? "!max-w-[90vw] h-auto max-h-[70vh]"
              : "!max-w-[65vw] h-[92vh] max-h-[92vh]"
          }`}
        >
          {/* Header */}
          <div className="relative px-10 py-8 border-b border-cyan-400/10 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 flex-shrink-0">
            <div className="flex items-center gap-5">
              {type === "outfit" && (
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                  <Package className="w-8 h-8 text-cyan-300" />
                </div>
              )}
              <div className="flex-1">
                <DialogTitle className="text-4xl font-bricolage font-black text-white tracking-tight">
                  {type === "outfit"
                    ? outfit?.name || "Outfit Details"
                    : "Wardrobe Items"}
                </DialogTitle>
                {type === "outfit" && outfit?.description ? (
                  <p className="text-lg text-white/70 mt-2 font-poppins">
                    {outfit.description}
                  </p>
                ) : (
                  <p className="text-lg text-white/60 mt-2 font-poppins">
                    {totalCount} {totalCount === 1 ? "item" : "items"} in this
                    post
                  </p>
                )}
              </div>
              <DialogClose asChild>
                <button
                  className="flex items-center justify-center w-14 h-14 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Close modal"
                >
                  <X className="w-7 h-7" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Items Grid */}
          <Tooltip.Provider delayDuration={200}>
            <div
              className={`px-10 py-8 flex-1 ${
                type === "items" ? "flex items-center" : "overflow-y-auto"
              }`}
            >
              <div
                className={`${
                  type === "items"
                    ? "flex gap-6 overflow-x-auto w-full pb-4"
                    : "grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {displayItems.map((item, index) => {
                    const CategoryIcon = getCategoryIcon(item.categoryId);
                    const categoryColor = getCategoryColor(item.categoryId);
                    const isDeleted = item.isDeleted;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.02,
                        }}
                        className={`flex flex-col ${
                          type === "items" ? "flex-shrink-0 w-64" : ""
                        }`}
                      >
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <motion.button
                              onClick={() =>
                                !isDeleted && setSelectedItemId(item.id)
                              }
                              className={`relative group rounded-2xl overflow-hidden w-full bg-white/5 border-2 border-white/10 transition-all duration-300 ${
                                isDeleted
                                  ? "opacity-50 grayscale cursor-not-allowed"
                                  : "cursor-pointer hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20"
                              }`}
                              whileHover={!isDeleted ? { y: -6 } : undefined}
                              whileTap={
                                !isDeleted ? { scale: 0.97 } : undefined
                              }
                            >
                              {/* Image Container */}
                              <div className="aspect-square relative bg-gradient-to-br from-slate-900/30 to-cyan-950/20 overflow-hidden">
                                <Image
                                  src={item.imgUrl}
                                  alt={item.name}
                                  fill
                                  className={`object-cover transition-all duration-300 ${
                                    imageLoaded[item.id]
                                      ? "opacity-100"
                                      : "opacity-0"
                                  } ${!isDeleted && "group-hover:scale-110"}`}
                                  onLoad={() => handleImageLoad(item.id)}
                                  sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                  priority={index < 12}
                                />
                                {!imageLoaded[item.id] && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-cyan-400/30 border-t-cyan-400"></div>
                                  </div>
                                )}

                                {/* Category Badge - Top Left */}
                                <div
                                  className={`absolute top-3 left-3 flex items-center gap-2 ${categoryColor} text-white rounded-xl px-3 py-2 text-sm font-semibold shadow-lg transition-opacity duration-200 ${
                                    imageLoaded[item.id]
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                >
                                  <CategoryIcon className="w-4 h-4" />
                                  <span className="hidden lg:inline">
                                    {item.categoryName}
                                  </span>
                                </div>

                                {/* Hover Overlay */}
                                {!isDeleted && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <div className="flex items-center gap-2 text-sm text-cyan-300 font-semibold">
                                      <span>View Details</span>
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}

                                {/* Deleted Overlay */}
                                {isDeleted && (
                                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <div className="bg-red-500/90 text-white text-sm font-bold px-4 py-2 rounded-full backdrop-blur-sm border border-red-400/50">
                                      Deleted
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Item Info - Below Image */}
                              <div className="p-4 bg-gradient-to-br from-slate-900/40 to-cyan-950/30">
                                <h3
                                  className={`text-base font-bricolage font-bold text-white leading-tight truncate ${
                                    isDeleted ? "line-through" : ""
                                  }`}
                                  title={item.name}
                                >
                                  {item.name}
                                </h3>
                                {item.brand && (
                                  <p
                                    className="text-sm text-white/50 mt-1 truncate font-poppins"
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
                                className="bg-gray-900/95 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-xl shadow-xl border border-white/10 z-[100] font-poppins"
                                sideOffset={5}
                              >
                                This item has been deleted from the wardrobe
                                <Tooltip.Arrow className="fill-gray-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          )}
                        </Tooltip.Root>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Empty State */}
              {displayItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Package className="w-14 h-14 text-white/30" />
                  </div>
                  <h3 className="text-2xl font-bricolage font-bold text-white mb-3">
                    No items found
                  </h3>
                  <p className="text-lg text-white/60 font-poppins">
                    This post doesn&apos;t have any items attached.
                  </p>
                </div>
              )}
            </div>
          </Tooltip.Provider>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
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
