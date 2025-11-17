"use client";

import { memo, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { OutfitCard } from "./OutfitCard";
import { Outfit } from "@/types/outfit";
import { Loader2 } from "lucide-react";

interface OutfitGridProps {
  outfits: Outfit[];
  isLoading?: boolean;
  onViewOutfit?: (outfit: Outfit) => void;
  onEditOutfit?: (outfit: Outfit) => void;
  onDeleteOutfit?: (outfitId: number) => void;
  onUseToday?: (outfit: Outfit) => void;
}

const OutfitGridComponent = ({
  outfits,
  isLoading,
  onViewOutfit,
  onEditOutfit,
  onDeleteOutfit,
  onUseToday,
}: OutfitGridProps) => {
  // Memoize empty state to prevent re-renders
  const emptyState = useMemo(
    () => (
      <div className="text-center py-20">
        <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="font-bricolage text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No outfits yet
        </h3>
        <p className="font-poppins text-gray-600 dark:text-gray-400">
          Create your first outfit by selecting items from your wardrobe
        </p>
      </div>
    ),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (outfits.length === 0) {
    return emptyState;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      <AnimatePresence mode="popLayout">
        {outfits.map((outfit) => (
          <div key={outfit.id} className="h-full min-h-[500px]">
            <OutfitCard
              outfit={outfit}
              onView={onViewOutfit}
              onEdit={onEditOutfit}
              onDelete={onDeleteOutfit}
              onUseToday={onUseToday}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Memoize grid to prevent unnecessary re-renders
export const  OutfitGrid = memo(OutfitGridComponent, (prevProps, nextProps) => {
  // Check if loading state changed
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  // Check if outfit count changed
  if (prevProps.outfits.length !== nextProps.outfits.length) return false;

  // Check if handlers changed
  if (
    prevProps.onViewOutfit !== nextProps.onViewOutfit ||
    prevProps.onEditOutfit !== nextProps.onEditOutfit ||
    prevProps.onDeleteOutfit !== nextProps.onDeleteOutfit ||
    prevProps.onUseToday !== nextProps.onUseToday
  ) {
    return false;
  }

  // Check if any outfit changed (including isFavorite, isSaved, etc.)
  return prevProps.outfits.every((prevOutfit, index) => {
    const nextOutfit = nextProps.outfits[index];
    return (
      prevOutfit.id === nextOutfit?.id &&
      prevOutfit.isFavorite === nextOutfit?.isFavorite &&
      prevOutfit.isSaved === nextOutfit?.isSaved &&
      prevOutfit.name === nextOutfit?.name &&
      prevOutfit.description === nextOutfit?.description
    );
  });
});
