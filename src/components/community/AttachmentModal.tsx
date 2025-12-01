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
          className={`w-[65vw] p-0 backdrop-blur-xl bg-slate-950/95 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col !max-w-[45rem] h-auto ${
            type === "outfit" ? "max-h-[80vh]" : ""
          }`}
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              {type === "outfit" && (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
                  <Package className="w-5 h-5 text-cyan-300" />
                </div>
              )}
              <div className="flex-1">
                <DialogTitle className="text-xl font-bricolage font-bold text-white">
                  {type === "outfit"
                    ? outfit?.name || "Outfit Details"
                    : "Wardrobe Items"}
                </DialogTitle>
                {type === "outfit" && outfit?.description ? (
                  <p className="text-sm text-white/60 mt-1 font-poppins line-clamp-2">
                    {outfit.description}
                  </p>
                ) : (
                  <p className="text-sm text-white/50 mt-1 font-poppins">
                    {totalCount} {totalCount === 1 ? "item" : "items"} in this
                    post
                  </p>
                )}
              </div>
              <DialogClose asChild>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Items Grid */}
          <Tooltip.Provider delayDuration={200}>
            <div
              className={`px-6 py-4 flex-1 ${
                type === "items" ? "flex items-center" : "overflow-y-auto"
              }`}
            >
              <div
                className={`${
                  type === "items"
                    ? "flex gap-3 overflow-x-auto w-full pb-2"
                    : "grid grid-cols-4 gap-3"
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
                          duration: 0.15,
                          delay: index * 0.01,
                        }}
                        className={`flex flex-col ${
                          type === "items" ? "flex-shrink-0 w-40" : ""
                        }`}
                      >
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <motion.button
                              onClick={() =>
                                !isDeleted && setSelectedItemId(item.id)
                              }
                              className={`relative group rounded-lg overflow-hidden w-full bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-200 ${
                                isDeleted
                                  ? "opacity-50 grayscale cursor-not-allowed"
                                  : "cursor-pointer hover:bg-white/10"
                              }`}
                              whileHover={
                                !isDeleted ? { scale: 1.02 } : undefined
                              }
                              whileTap={
                                !isDeleted ? { scale: 0.98 } : undefined
                              }
                            >
                              {/* Compact Image Container */}
                              <div className="aspect-square relative bg-slate-900/20 overflow-hidden">
                                <Image
                                  src={item.imgUrl}
                                  alt={item.name}
                                  fill
                                  className={`object-cover transition-all duration-300 ${
                                    imageLoaded[item.id]
                                      ? "opacity-100"
                                      : "opacity-0"
                                  } ${!isDeleted && "group-hover:scale-105"}`}
                                  onLoad={() => handleImageLoad(item.id)}
                                  sizes="(max-width: 640px) 25vw, 150px"
                                  priority={index < 12}
                                />
                                {!imageLoaded[item.id] && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400/30 border-t-cyan-400"></div>
                                  </div>
                                )}

                                {/* Mini Category Badge */}
                                <div
                                  className={`absolute top-1.5 right-1.5 ${categoryColor} text-white rounded-md px-1.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm ${
                                    imageLoaded[item.id]
                                      ? "opacity-90"
                                      : "opacity-0"
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
                                className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 z-[100] font-poppins"
                                sideOffset={5}
                              >
                                This item has been deleted
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
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="text-lg font-bricolage font-bold text-white mb-2">
                    No items found
                  </h3>
                  <p className="text-sm text-white/60 font-poppins">
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
