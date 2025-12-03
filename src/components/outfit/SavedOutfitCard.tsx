"use client";

import React, { useState, memo, useCallback, MouseEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, X, ExternalLink } from "lucide-react";
import { SavedOutfit } from "@/types/outfit";
import GlassCard from "@/components/ui/glass-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SavedOutfitCardProps {
  outfit: SavedOutfit;
  onView?: (outfit: SavedOutfit) => void;
  onUnsave?: (
    outfitId: number,
    sourceId: number,
    sourceType: "Post" | "Collection"
  ) => void;
  onOpenPost?: (postId: number) => void;
}

const SavedOutfitCardComponent = ({
  outfit,
  onView,
  onUnsave,
  onOpenPost,
}: SavedOutfitCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUnsaveDialogOpen, setIsUnsaveDialogOpen] = useState(false);
  const router = useRouter();

  const handleUnsaveClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setIsUnsaveDialogOpen(true);
  }, []);

  const confirmUnsave = useCallback(() => {
    if (onUnsave) {
      onUnsave(outfit.outfitId, outfit.sourceId, outfit.sourceType);
    }
  }, [onUnsave, outfit.outfitId, outfit.sourceId, outfit.sourceType]);

  const handleCardClick = useCallback(() => {
    if (onView) {
      onView(outfit);
    }
  }, [onView, outfit]);

  const handleSourceClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (outfit.sourceType === "Collection") {
        router.push(`/collections/${outfit.sourceId}`);
      } else if (outfit.sourceType === "Post" && onOpenPost) {
        onOpenPost(outfit.sourceId);
      }
    },
    [outfit.sourceType, outfit.sourceId, router, onOpenPost]
  );

  const formattedSavedDate = useCallback(() => {
    try {
      const date = new Date(outfit.savedDate);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return format(date, "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  }, [outfit.savedDate]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-full"
      >
        <GlassCard
          padding="0"
          blur="10px"
          brightness={1.05}
          borderRadius="16px"
          glowColor="rgba(59, 130, 246, 0.2)"
          glowIntensity={8}
          className="cursor-pointer overflow-hidden bg-linear-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20 h-full flex flex-col"
          onClick={handleCardClick}
        >
          {/* Image Grid */}
          <div className="relative aspect-square bg-linear-to-br">
            <div className="grid grid-cols-2 gap-1 h-full p-2">
              {[...Array(4)].map((_, index) => {
                const item = outfit.items[index];
                return (
                  <div
                    key={
                      item ? `${outfit.id}-${item.itemId}` : `empty-${index}`
                    }
                    className="bg-white/5 rounded-xl aspect-square flex items-center justify-center overflow-hidden relative"
                  >
                    {item && (
                      <Image
                        src={item.imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 20vw"
                      />
                    )}
                  </div>
                );
              })}
              {outfit.items.length > 4 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  +{outfit.items.length - 4} more
                </div>
              )}
            </div>

            {/* Source Badge - Top Right */}
            <div className="absolute top-3 right-3 z-10">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-full backdrop-blur-xl",
                  "border shadow-lg text-xs font-medium",
                  outfit.sourceType === "Post"
                    ? "bg-gradient-to-br from-purple-500/90 to-pink-500/90 border-purple-400/50 text-white"
                    : "bg-gradient-to-br from-blue-500/90 to-cyan-500/90 border-blue-400/50 text-white"
                )}
              >
                {outfit.sourceType === "Post"
                  ? "📝 From Post"
                  : "📁 From Collection"}
              </div>
            </div>

            {/* Unsave Button - Top Left */}
            {onUnsave && (
              <motion.button
                onClick={handleUnsaveClick}
                aria-label="Remove from saved"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: isHovered ? 1 : 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute top-3 left-3 z-10",
                  "p-2.5 rounded-full backdrop-blur-xl transition-all duration-200",
                  "bg-gradient-to-br from-orange-500/90 to-red-500/90",
                  "border border-orange-400/50 shadow-lg shadow-orange-500/30",
                  "hover:from-orange-600/95 hover:to-red-600/95"
                )}
              >
                <X className="w-4.5 h-4.5 text-white" />
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
            {/* Outfit Name & Description */}
            <div className="mb-3 min-h-20">
              <h3 className="font-bricolage font-semibold text-lg text-white line-clamp-1 break-all">
                {outfit.outfitName}
              </h3>
              {outfit.outfitDescription ? (
                <p className="font-poppins text-sm text-white/70 line-clamp-2 break-all mt-1.5">
                  {outfit.outfitDescription}
                </p>
              ) : (
                <div className="mt-1.5 h-10"></div>
              )}
            </div>

            {/* View Source Button */}
            <button
              onClick={handleSourceClick}
              className="mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm text-blue-300 font-medium">
                    {outfit.sourceType === "Post"
                      ? "View Original Post"
                      : "View Collection"}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-300 shrink-0 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>

            {/* Meta Info */}
            <div className="flex flex-col gap-2 text-xs text-white/60 mb-3">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1 break-all">
                  {outfit.sourceOwnerDisplayName || "Unknown"}
                </span>
              </div>
              <div className="text-xs text-white/50">
                Saved: {formattedSavedDate()}
              </div>
            </div>

            {/* Item Count */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
              <span className="text-xs font-medium text-white/80">
                {outfit.items.length}{" "}
                {outfit.items.length === 1 ? "item" : "items"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/40 border border-blue-400/50 text-blue-200 font-medium">
                Saved
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Unsave Confirmation Dialog */}
      <ConfirmDialog
        open={isUnsaveDialogOpen}
        onOpenChange={setIsUnsaveDialogOpen}
        onConfirm={confirmUnsave}
        title={`Remove from Saved ${
          outfit.sourceType === "Post" ? "Posts" : "Collections"
        }?`}
        description={`Are you sure you want to remove "${
          outfit.outfitName
        }" from your saved ${
          outfit.sourceType === "Post" ? "posts" : "collections"
        }? You can save it again later.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export const SavedOutfitCard = memo(
  SavedOutfitCardComponent,
  (prevProps, nextProps) => {
    if (
      prevProps.outfit.id !== nextProps.outfit.id ||
      prevProps.outfit.outfitName !== nextProps.outfit.outfitName ||
      prevProps.outfit.outfitDescription !==
        nextProps.outfit.outfitDescription ||
      prevProps.outfit.sourceType !== nextProps.outfit.sourceType ||
      prevProps.outfit.sourceId !== nextProps.outfit.sourceId ||
      prevProps.outfit.savedDate !== nextProps.outfit.savedDate ||
      prevProps.outfit.items.length !== nextProps.outfit.items.length
    ) {
      return false;
    }

    if (
      prevProps.onView !== nextProps.onView ||
      prevProps.onUnsave !== nextProps.onUnsave
    ) {
      return false;
    }

    return true;
  }
);
