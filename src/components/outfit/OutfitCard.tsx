"use client";

import { useState, memo, useCallback, MouseEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Calendar, User, Trash2, Edit } from "lucide-react";
import { Outfit } from "@/types/outfit";
import GlassCard from "@/components/ui/glass-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSaveFavoriteOutfit } from "@/hooks/useOutfits";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OutfitCardProps {
  outfit: Outfit;
  onView?: (outfit: Outfit) => void;
  onEdit?: (outfit: Outfit) => void;
  onDelete?: (outfitId: number) => void;
}

const OutfitCardComponent = ({ outfit, onView, onEdit, onDelete }: OutfitCardProps) => {
  const { mutate: toggleFavorite, isPending } = useSaveFavoriteOutfit();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFavoriteClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(outfit.id);
  }, [toggleFavorite, outfit.id]);

  const handleEditClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(outfit);
    }
  }, [onEdit, outfit]);

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

  const formattedDate = useCallback(() => {
    return format(new Date(outfit.createdDate), "MMM d, yyyy");
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
      >
      <GlassCard
        padding="0"
        blur="10px"
        brightness={1.05}
        borderRadius="16px"
        glowColor="rgba(59, 130, 246, 0.2)"
        glowIntensity={8}
        className="cursor-pointer overflow-hidden bg-linear-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20"
        onClick={handleCardClick}
      >
        {/* Image Grid */}
        <div className="relative aspect-square bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <div className="grid grid-cols-2 gap-1 h-full p-2">
            {outfit.items.slice(0, 4).map((item) => (
              <div
                key={`${outfit.id}-${item.itemId || item.id}`}
                className="relative rounded-lg overflow-hidden bg-white dark:bg-gray-800"
              >
                <Image
                  src={item.imgUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
            {outfit.items.length > 4 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                +{outfit.items.length - 4} more
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xl",
              "bg-white/80 border-2 border-white/90",
              "hover:bg-white hover:border-white hover:scale-110",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <Heart
              className={`w-5 h-5 ${
                outfit.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-700"
              }`}
            />
          </button>

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className={cn(
                "absolute top-2 left-2 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xl",
                "bg-red-500/90 border-2 border-red-600/90",
                "hover:bg-red-600 hover:border-red-700 hover:scale-110",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={handleEditClick}
              className={cn(
                "absolute top-14 left-2 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xl",
                "bg-blue-500/90 border-2 border-blue-600/90",
                "hover:bg-blue-600 hover:border-blue-700 hover:scale-110",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <Edit className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="pr-6 pb-6 space-y-2.5">
          <div>
            <h3 className="font-bricolage font-semibold text-lg text-white line-clamp-1">
              {outfit.name}
            </h3>
            {outfit.description && (
              <p className="font-poppins text-sm text-white/80 line-clamp-2 mt-1">
                {outfit.description}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-white/70">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="line-clamp-1">{outfit.userDisplayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate()}</span>
            </div>
          </div>

          {/* Item Count */}
          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <span className="text-sm font-medium text-white">
              {outfit.items.length} {outfit.items.length === 1 ? "item" : "items"}
            </span>
            {outfit.isSaved && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/50 border border-blue-300/70 text-blue-200">
                Saved
              </span>
            )}
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
    prevProps.onDelete !== nextProps.onDelete
  ) {
    return false;
  }
  
  return true; // Props are equal, skip re-render
});
