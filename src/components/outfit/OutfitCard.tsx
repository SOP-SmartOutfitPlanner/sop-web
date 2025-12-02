"use client";

import React, { useState, memo, useCallback, MouseEvent } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, User, Trash2, Edit, Sparkles } from "lucide-react";
import { Outfit } from "@/types/outfit";
import GlassCard from "@/components/ui/glass-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSaveFavoriteOutfit } from "@/hooks/useOutfits";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import GlassButton from "@/components/ui/glass-button";

interface OutfitCardProps {
  outfit: Outfit;
  onView?: (outfit: Outfit) => void;
  onEdit?: (outfit: Outfit) => void;
  onDelete?: (outfitId: number) => void;
  onUseToday?: (outfit: Outfit) => void;
}

const OutfitCardComponent = ({
  outfit,
  onView,
  onEdit,
  onDelete,
  onUseToday,
}: OutfitCardProps) => {
  const { mutate: toggleFavorite, isPending } = useSaveFavoriteOutfit();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFavoriteClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(outfit.id);
    },
    [toggleFavorite, outfit.id]
  );

  const handleEditClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (onEdit) {
        onEdit(outfit);
      }
    },
    [onEdit, outfit]
  );

  const handleDeleteClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (onDelete) {
      onDelete(outfit.id);
    }
  }, [onDelete, outfit.id]);

  const handleCardClick = useCallback(() => {
    if (onView) {
      onView(outfit);
    }
  }, [onView, outfit]);

  const handleUseTodayClick = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.stopPropagation();
      }
      if (onUseToday) {
        onUseToday(outfit);
      }
    },
    [onUseToday, outfit]
  );

  const formattedDate = useCallback(() => {
    try {
      const date = new Date(outfit.createdDate);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return format(date, "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  }, [outfit.createdDate]);

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
                      item
                        ? `${outfit.id}-${item.itemId || item.id}`
                        : `empty-${index}`
                    }
                    className="bg-white/5 rounded-xl aspect-square flex items-center justify-center overflow-hidden relative"
                  >
                    {item && (
                      <img
                        src={item.imgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
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

            {/* Action Buttons Container */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {/* Favorite Button - Always visible when favorited */}
              <motion.button
                onClick={handleFavoriteClick}
                disabled={isPending}
                aria-label={
                  outfit.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: outfit.isFavorite || isHovered ? 1 : 0,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "p-2.5 rounded-full backdrop-blur-xl transition-all duration-200",
                  "border shadow-lg",
                  outfit.isFavorite
                    ? "bg-gradient-to-br from-red-500/90 to-pink-500/90 border-red-400/50 shadow-red-500/30"
                    : "bg-white/90 border-white/50 hover:bg-white shadow-black/10"
                )}
              >
                <Heart
                  className={cn(
                    "w-4.5 h-4.5 transition-all duration-200",
                    outfit.isFavorite
                      ? "fill-white text-white"
                      : "text-gray-700"
                  )}
                />
              </motion.button>

              {/* Edit Button */}
              {onEdit && (
                <motion.button
                  onClick={handleEditClick}
                  aria-label="Edit outfit"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: isHovered ? 1 : 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "p-2.5 rounded-full backdrop-blur-xl transition-all duration-200",
                    "bg-gradient-to-br from-blue-500/90 to-indigo-500/90",
                    "border border-blue-400/50 shadow-lg shadow-blue-500/30",
                    "hover:from-blue-600/95 hover:to-indigo-600/95"
                  )}
                >
                  <Edit className="w-4.5 h-4.5 text-white" />
                </motion.button>
              )}
            </div>

            {/* Delete Button - Top Left */}
            {onDelete && (
              <motion.button
                onClick={handleDeleteClick}
                aria-label="Delete outfit"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: isHovered ? 1 : 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute top-3 left-3 z-10",
                  "p-2.5 rounded-full backdrop-blur-xl transition-all duration-200",
                  "bg-gradient-to-br from-red-500/90 to-red-600/90",
                  "border border-red-400/50 shadow-lg shadow-red-500/30",
                  "hover:from-red-600/95 hover:to-red-700/95"
                )}
              >
                <Trash2 className="w-4.5 h-4.5 text-white" />
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div className="px-4 pt-3 pb-4 flex flex-col flex-1 min-h-[200px]">
            {/* Outfit Name */}
            <div className="mb-2 min-h-20">
              <h3 className="font-bricolage font-semibold text-lg text-white line-clamp-1 break-all">
                {outfit.name}
              </h3>
              {outfit.description ? (
                <p className="font-poppins text-sm text-white/70 line-clamp-2 break-all mt-1.5">
                  {outfit.description}
                </p>
              ) : (
                <div className="mt-1.5 h-10"></div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1 break-all">
                  {outfit.userDisplayName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate()}</span>
              </div>
            </div>

            {/* Item Count and Saved Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/80">
                {outfit.items.length}{" "}
                {outfit.items.length === 1 ? "item" : "items"}
              </span>
              {outfit.isSaved && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/40 border border-blue-400/50 text-blue-200 font-medium">
                  Saved
                </span>
              )}
            </div>

            {/* Use Outfit Today Button - Always reserve space */}
            <div className="mt-auto pt-3 border-t border-white/10 min-h-14 flex items-end">
              {onUseToday ? (
                <GlassButton
                  variant="custom"
                  backgroundColor="rgba(59, 130, 246, 0.4)"
                  borderColor="rgba(59, 130, 246, 0.6)"
                  textColor="white"
                  size="sm"
                  onClick={handleUseTodayClick}
                  fullWidth
                  className="text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4" />
                  Use Outfit Today
                </GlassButton>
              ) : null}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Outfit?"
        description={`Are you sure you want to delete "${outfit.name}"? This action cannot be undone and will permanently remove this outfit from your collection.`}
        confirmText="Delete Outfit"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export const OutfitCard = memo(OutfitCardComponent, (prevProps, nextProps) => {
  // If any of these change, re-render
  if (
    prevProps.outfit.id !== nextProps.outfit.id ||
    prevProps.outfit.name !== nextProps.outfit.name ||
    prevProps.outfit.description !== nextProps.outfit.description ||
    prevProps.outfit.isFavorite !== nextProps.outfit.isFavorite ||
    prevProps.outfit.isSaved !== nextProps.outfit.isSaved ||
    prevProps.outfit.items.length !== nextProps.outfit.items.length ||
    prevProps.outfit.createdDate !== nextProps.outfit.createdDate ||
    prevProps.outfit.userDisplayName !== nextProps.outfit.userDisplayName
  ) {
    return false; // Props changed, should re-render
  }

  // Handlers comparison
  if (
    prevProps.onView !== nextProps.onView ||
    prevProps.onEdit !== nextProps.onEdit ||
    prevProps.onDelete !== nextProps.onDelete ||
    prevProps.onUseToday !== nextProps.onUseToday
  ) {
    return false;
  }

  return true; // Props are equal, skip re-render
});
