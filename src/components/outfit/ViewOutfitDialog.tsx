"use client";

import { useEffect, memo, useMemo, useState } from "react";
import { X, Heart, Edit, Trash2, Calendar, User } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Outfit } from "@/types/outfit";
import { useSaveFavoriteOutfit, useOutfit } from "@/hooks/useOutfits";
import { format } from "date-fns";
import { OutfitItemCard } from "./OutfitItemCard";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";

interface ViewOutfitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit: Outfit | null;
  onEdit?: (outfit: Outfit) => void;
  onDelete?: (outfitId: number) => void;
}

const ViewOutfitDialogComponent = ({
  open,
  onOpenChange,
  outfit: initialOutfit,
  onEdit,
  onDelete,
}: ViewOutfitDialogProps) => {
  const { mutate: toggleFavorite, isPending } = useSaveFavoriteOutfit();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  // Fetch real-time outfit data from React Query cache
  const { data: latestOutfit } = useOutfit(initialOutfit?.id || null);

  // Use latest data from cache, fallback to initial prop
  const outfit = latestOutfit || initialOutfit;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleItemClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setIsItemDialogOpen(true);
  };

  const handleItemDialogClose = () => {
    setIsItemDialogOpen(false);
    setSelectedItemId(null);
  };

  const handleFavoriteClick = () => {
    if (outfit) {
      toggleFavorite(outfit.id);
    }
  };

  const handleEditClick = () => {
    if (outfit && onEdit) {
      onEdit(outfit);
      // Don't close immediately - let parent handle the transition
      setTimeout(() => {
        handleClose();
      }, 50);
    }
  };

  const handleDeleteClick = () => {
    if (outfit && onDelete) {
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (outfit && onDelete) {
      onDelete(outfit.id);
      handleClose();
    }
  };

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (open) {
      const html = document.documentElement;
      html.classList.add("lenis-stopped");
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const html = document.documentElement;
      html.classList.remove("lenis-stopped");
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      const html = document.documentElement;
      html.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [open]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    if (!outfit) return "";
    return format(new Date(outfit.createdDate), "MMMM d, yyyy");
  }, [outfit]);

  if (!open || !outfit) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden overscroll-none"
        style={{ position: "fixed", inset: 0 }}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-51 flex items-center justify-center p-4 pointer-events-none overflow-hidden">
        <div
          className="w-[1200px] max-w-[90vw] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Full Background Container with Glassmorphism */}
          <div className="absolute inset-0 bg-linear-to-br bg-opacity-70 from-slate-900/50 via-blue-900/90 to-slate-900/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-12 pt-8 pb-4 shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                    {outfit.name}
                  </h2>
                  {outfit.description && (
                    <p className="font-bricolage text-lg text-gray-200 mt-2">
                      {outfit.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{outfit.userDisplayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {outfit.items.length}{" "}
                        {outfit.items.length === 1 ? "Item" : "Items"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  aria-label="Close dialog"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 ml-4 shrink-0"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div
              className="flex-1 px-12 py-4 overflow-y-auto min-h-0 hide-scrollbar"
              data-lenis-prevent
            >
              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {outfit.items.map((item) => (
                  <div key={item.itemId || item.id} className="h-[420px]">
                    <OutfitItemCard
                      item={item}
                      onClick={() => handleItemClick(item.itemId || item.id!)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-12 pb-8 pt-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Favorite Button */}
                  <GlassButton
                    onClick={handleFavoriteClick}
                    disabled={isPending}
                    variant="custom"
                    backgroundColor={
                      outfit.isFavorite
                        ? "rgba(239, 68, 68, 0.6)"
                        : "rgba(255, 255, 255, 0.2)"
                    }
                    borderColor={
                      outfit.isFavorite
                        ? "rgba(239, 68, 68, 0.8)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    textColor="white"
                    size="md"
                    className="gap-2"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        outfit.isFavorite ? "fill-current" : ""
                      }`}
                    />
                    {outfit.isFavorite ? "Unfavorite" : "Favorite"}
                  </GlassButton>

                  {/* Save Badge */}
                  {outfit.isSaved && (
                    <span className="px-3 py-2 rounded-full bg-blue-500/50 border border-blue-300/70 text-blue-200 text-sm font-medium">
                      Saved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Delete Button */}
                  {onDelete && (
                    <GlassButton
                      onClick={handleDeleteClick}
                      variant="custom"
                      backgroundColor="rgba(239, 68, 68, 0.6)"
                      borderColor="rgba(239, 68, 68, 0.8)"
                      textColor="white"
                      size="md"
                      className="gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </GlassButton>
                  )}

                  {/* Edit Button */}
                  {onEdit && (
                    <GlassButton
                      onClick={handleEditClick}
                      variant="custom"
                      backgroundColor="rgba(59, 130, 246, 0.6)"
                      borderColor="rgba(59, 130, 246, 0.8)"
                      textColor="white"
                      size="md"
                      className="gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </GlassButton>
                  )}

                  {/* Close Button */}
                  <GlassButton
                    onClick={handleClose}
                    variant="custom"
                    backgroundColor="rgba(255, 255, 255, 0.3)"
                    borderColor="rgba(255, 255, 255, 0.5)"
                    textColor="#374151"
                    size="md"
                  >
                    Close
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Outfit?"
        description={`Are you sure you want to delete "${outfit?.name}"? This action cannot be undone and will permanently remove this outfit from your collection.`}
        confirmText="Delete Outfit"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />

      {/* Item Detail Dialog */}
      {selectedItemId && (
        <ViewItemDialog
          open={isItemDialogOpen}
          onOpenChange={handleItemDialogClose}
          itemId={selectedItemId}
        />
      )}
    </>
  );
};

// Memoize dialog to prevent unnecessary re-renders
export const ViewOutfitDialog = memo(
  ViewOutfitDialogComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.open === nextProps.open &&
      prevProps.outfit?.id === nextProps.outfit?.id &&
      prevProps.outfit?.isFavorite === nextProps.outfit?.isFavorite &&
      prevProps.outfit?.isSaved === nextProps.outfit?.isSaved &&
      prevProps.onEdit === nextProps.onEdit &&
      prevProps.onDelete === nextProps.onDelete
    );
  }
);
