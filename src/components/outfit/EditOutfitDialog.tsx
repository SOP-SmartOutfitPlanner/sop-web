"use client";

import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { X, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Image } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { useUpdateOutfit, useOutfit } from "@/hooks/useOutfits";
import { useOutfitStore } from "@/store/outfit-store";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";

interface EditOutfitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfitId: number | null;
  wardrobeItems: ApiWardrobeItem[];
}

// Memoized item card component
interface ItemCardProps {
  item: ApiWardrobeItem;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const ItemCard = memo(({ item, isSelected, onToggle }: ItemCardProps) => {
  const handleClick = () => {
    if (item.id) onToggle(item.id);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative w-full flex flex-col cursor-pointer p-1"
    >
      {/* GlassCard wrapper */}
      <div
        className={
          isSelected
            ? "relative flex flex-col p-2 rounded-2xl transition-all duration-100 bg-linear-to-br from-cyan-300/30 via-blue-200/10 to-indigo-300/30 backdrop-blur-md border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-transparent"
            : "relative flex flex-col p-2 rounded-2xl transition-all duration-100 bg-linear-to-br from-cyan-300/30 via-blue-200/10 to-indigo-300/30 backdrop-blur-md border-2 border-white/20 hover:border-cyan-400/40"
        }
      >
        {/* Selection Indicator */}
        <div className={
          isSelected
            ? "absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-100 border-2 bg-cyan-500 border-white/50 shadow-lg"
            : "absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-100 border-2 bg-white/20 backdrop-blur-md border-white/30"
        }>
          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>

        {/* Image Container */}
        <div className="bg-white/5 rounded-lg aspect-square overflow-hidden relative mb-2">
          <Image
            src={item.imgUrl}
            alt={item.name}
            width="100%"
            height="100%"
            className="object-cover rounded-lg"
            preview={false}
            loading="lazy"
            placeholder={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              borderRadius: '0.5rem'
            }}
            wrapperClassName="w-full h-full"
            rootClassName="w-full h-full !block"
          />
        </div>

        {/* Item Details */}
        <div className="flex flex-col px-1">
          {/* Name */}
          <h3 className="text-white font-semibold text-sm truncate mb-1">
            {item.name}
          </h3>

          {/* Category */}
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[9px] font-medium truncate text-center">
            {item.categoryName || item.category?.name || "Uncategorized"}
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected &&
         prevProps.item.id === nextProps.item.id;
});

ItemCard.displayName = 'ItemCard';

export function EditOutfitDialog({
  open,
  onOpenChange,
  outfitId,
  wardrobeItems,
}: EditOutfitDialogProps) {
  const { mutate: updateOutfit, isPending } = useUpdateOutfit();
  const { data: outfitData, isLoading: isLoadingOutfit } = useOutfit(outfitId);
  const { selectedItemIds, setSelectedItems, toggleItemSelection, clearSelectedItems } = useOutfitStore();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  // Initialize form with outfit data
  useEffect(() => {
    if (outfitData && open) {
      setName(outfitData.name);
      setDescription(outfitData.description || "");
      // Set selected items from outfit
      const itemIds = outfitData.items.map(item => item.itemId);
      setSelectedItems(itemIds);
    }
  }, [outfitData, open, setSelectedItems]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setNameError("");
      clearSelectedItems();
    }
  }, [open, clearSelectedItems]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Form will be reset by useEffect when open becomes false
  }, [onOpenChange]);

  const toggleSelectAll = useCallback(() => {
    if (selectedItemIds.length === wardrobeItems.length) {
      clearSelectedItems();
    } else {
      wardrobeItems.forEach(item => {
        if (item.id && !selectedItemIds.includes(item.id)) {
          toggleItemSelection(item.id);
        }
      });
    }
  }, [selectedItemIds.length, wardrobeItems, clearSelectedItems, toggleItemSelection]);

  const handleSubmit = useCallback(() => {
    if (!outfitId) return;

    // Validation
    if (!name.trim()) {
      setNameError("Outfit name is required");
      return;
    }
    if (name.length > 100) {
      setNameError("Name is too long");
      return;
    }
    if (selectedItemIds.length === 0) {
      return;
    }

    setNameError("");

    updateOutfit(
      {
        id: outfitId,
        data: {
          name: name.trim(),
          description: description.trim() || "",
          itemIds: selectedItemIds,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }, [outfitId, name, description, selectedItemIds, updateOutfit, handleClose]);

  // Memoize selected set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedItemIds), [selectedItemIds]);

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

  if (!open) return null;

  // Show loading state while fetching outfit data
  if (isLoadingOutfit) {
    return (
      <>
        <div className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-51 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-300 font-poppins">Loading outfit...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden overscroll-none"
        style={{ position: 'fixed', inset: 0 }}
        onClick={() => {
          if (!isPending && !isLoadingOutfit) {
            handleClose();
          }
        }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-51 flex items-center justify-center p-4 pointer-events-none overflow-hidden">
        <div
          className="w-[1400px] max-w-[60vw] h-[85vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Full Background Container with Glassmorphism */}
          <div className="absolute inset-0 bg-linear-to-br bg-opacity-70 from-slate-900/50 via-blue-900/90 to-slate-900/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="px-12 pt-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                    Edit Outfit
                  </h2>
                  <p className="font-bricolage text-lg text-gray-200 mt-2">
                    Update your outfit details and items
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isPending || isLoadingOutfit}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 px-12 py-4 overflow-hidden min-h-0 flex flex-col">
              {isLoadingOutfit ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="text-white/70 font-bricolage">Loading outfit...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Form Fields */}
                  <div className="shrink-0 mb-6 space-y-4">
                    <div>
                      <label htmlFor="outfit-name" className="block text-sm font-medium text-white mb-2">
                        Outfit Name *
                      </label>
                      <input
                        id="outfit-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError("");
                        }}
                        placeholder="e.g., Casual Summer Look"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                      />
                      {nameError && (
                        <p className="text-sm text-red-400 mt-2">{nameError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="outfit-description" className="block text-sm font-medium text-white mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        id="outfit-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this outfit..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Selection Header */}
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      <span className="font-bricolage text-lg text-white font-semibold">
                        {selectedItemIds.length} of {wardrobeItems.length} items selected
                      </span>
                    </div>
                    <GlassButton
                      onClick={toggleSelectAll}
                      variant="custom"
                      backgroundColor="rgba(255, 255, 255, 0.2)"
                      borderColor="rgba(255, 255, 255, 0.4)"
                      textColor="white"
                      size="sm"
                    >
                      {selectedItemIds.length === wardrobeItems.length ? "Deselect All" : "Select All"}
                    </GlassButton>
                  </div>

                  {/* Items Grid */}
                  <div className="flex-1 overflow-y-auto min-h-0 hide-scrollbar" data-lenis-prevent>
                    {wardrobeItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white/50" />
                          </div>
                          <p className="text-white/70 font-bricolage text-lg">No wardrobe items found</p>
                          <p className="text-white/50 text-sm mt-1">Add items to your wardrobe first</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-4">
                        {wardrobeItems.map((item) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            isSelected={selectedSet.has(item.id!)}
                            onToggle={toggleItemSelection}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-12 pb-8">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-4">
                  <GlassButton
                    onClick={handleClose}
                    disabled={isPending || isLoadingOutfit}
                    variant="custom"
                    backgroundColor="rgba(255, 255, 255, 0.3)"
                    borderColor="rgba(255, 255, 255, 0.5)"
                    textColor="#374151"
                    size="md"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </GlassButton>

                  <GlassButton
                    onClick={handleSubmit}
                    disabled={isPending || isLoadingOutfit || selectedItemIds.length === 0 || !name.trim()}
                    variant="custom"
                    backgroundColor="rgba(59, 130, 246, 0.6)"
                    borderColor="rgba(59, 130, 246, 0.8)"
                    textColor="white"
                    size="md"
                  >
                    {isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Update Outfit ({selectedItemIds.length})
                      </>
                    )}
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
