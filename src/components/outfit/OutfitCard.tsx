"use client";

import { motion } from "framer-motion";
import { Heart, Calendar, User, Trash2, Edit } from "lucide-react";
import { Outfit } from "@/types/outfit";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { useSaveFavoriteOutfit } from "@/hooks/useOutfits";
import { format } from "date-fns";

interface OutfitCardProps {
  outfit: Outfit;
  onView?: (outfit: Outfit) => void;
  onEdit?: (outfit: Outfit) => void;
  onDelete?: (outfitId: number) => void;
}

export function OutfitCard({ outfit, onView, onEdit, onDelete }: OutfitCardProps) {
  const { mutate: toggleFavorite, isPending } = useSaveFavoriteOutfit();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(outfit.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(outfit);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(outfit.id);
    }
  };

  const handleCardClick = () => {
    if (onView) {
      onView(outfit);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        padding="0"
        blur="10px"
        brightness={1.05}
        borderRadius="16px"
        glowColor="rgba(59, 130, 246, 0.2)"
        glowIntensity={8}
        className="cursor-pointer overflow-hidden"
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
                <img
                  src={item.imgUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
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
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                outfit.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            />
          </button>

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="absolute top-2 left-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="absolute top-14 left-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Edit className="w-5 h-5 text-blue-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bricolage font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
              {outfit.name}
            </h3>
            {outfit.description && (
              <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {outfit.description}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="line-clamp-1">{outfit.userDisplayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(outfit.createdDate), "MMM d, yyyy")}</span>
            </div>
          </div>

          {/* Item Count */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {outfit.items.length} {outfit.items.length === 1 ? "item" : "items"}
            </span>
            {outfit.isSaved && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Saved
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
