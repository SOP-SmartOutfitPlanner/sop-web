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

  const handleImageLoad = useCallback((itemId: number) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  const displayItems = type === "items" ? items || [] : outfit?.items || [];
  const totalCount = displayItems.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl max-h-[85vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-cyan-950/80 via-blue-950/70 to-indigo-950/70 border border-cyan-400/30 shadow-2xl"
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              {type === "outfit" && (
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <Package className="w-5 h-5 text-cyan-300" />
                </div>
              )}
              <div>
                <DialogTitle className="text-2xl font-bricolage font-bold text-white">
                  {type === "outfit"
                    ? outfit?.name || "Outfit Details"
                    : `Items in this post (${totalCount})`}
                </DialogTitle>
                {type === "outfit" && outfit?.description && (
                  <p className="text-sm text-white/70 mt-1">
                    {outfit.description}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>
          <DialogClose asChild>
            <button
              className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </DialogClose>

          <Tooltip.Provider delayDuration={200}>
            <div className="mt-6">
              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {displayItems.map((item, index) => {
                    const CategoryIcon = getCategoryIcon(item.categoryId);
                    const categoryColor = getCategoryColor(item.categoryId);
                    const isDeleted = item.isDeleted;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <motion.button
                              onClick={() =>
                                !isDeleted && setSelectedItemId(item.id)
                              }
                              className={`relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all w-full ${
                                isDeleted
                                  ? "opacity-50 grayscale cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                              whileHover={
                                !isDeleted ? { scale: 1.03 } : undefined
                              }
                              whileTap={
                                !isDeleted ? { scale: 0.97 } : undefined
                              }
                            >
                              {/* Image */}
                              <div className="aspect-square relative bg-white/5">
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
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                                {!imageLoaded[item.id] && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400/30 border-t-cyan-400"></div>
                                  </div>
                                )}
                              </div>

                              {/* Category Badge */}
                              <div
                                className={`absolute top-2 left-2 flex items-center gap-1.5 ${categoryColor} text-white rounded-lg px-2 py-1 text-xs font-medium transition-opacity duration-200 ${
                                  imageLoaded[item.id]
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                <CategoryIcon className="w-3.5 h-3.5" />
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
                              <div className="p-3 bg-gradient-to-t from-black/40 to-transparent">
                                <p
                                  className={`text-sm text-white font-semibold truncate ${
                                    isDeleted ? "line-through" : ""
                                  }`}
                                >
                                  {item.name}
                                </p>
                              </div>
                            </motion.button>
                          </Tooltip.Trigger>
                          {isDeleted && (
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-white/10 z-[100]"
                                sideOffset={5}
                              >
                                This item was deleted
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
