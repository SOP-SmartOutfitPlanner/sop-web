"use client";

import { useEffect, useState } from "react";
import { useGlobalEditModal } from "@/hooks/useGlobalEditModal";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { useWardrobeStore } from "@/store/wardrobe-store";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Dynamic import for EditItemDialog to avoid loading it on every page
const EditItemDialog = dynamic(
  () =>
    import("@/components/wardrobe/EditItemDialog").then((mod) => ({
      default: mod.EditItemDialog,
    })),
  {
    loading: () => null, // No loading state, modal will appear when ready
  }
);

/**
 * Global Edit Modal
 * Allows editing wardrobe items from anywhere in the app
 * Triggered by success toast after upload
 */
export function GlobalEditModal() {
  const { isOpen, editItemId, closeEditModal } = useGlobalEditModal();
  const [isLoading, setIsLoading] = useState(false);

  // Verify item exists when modal opens
  useEffect(() => {
    if (isOpen && editItemId) {
      setIsLoading(true);

      // Small delay to ensure item is created in backend
      setTimeout(async () => {
        try {
          await wardrobeAPI.getItem(editItemId);
          setIsLoading(false);
        } catch (error) {
          console.error("❌ [GlobalEditModal] Failed to verify item:", error);
          toast.error(
            "Failed to load item details. Please try again from Wardrobe page."
          );
          closeEditModal();
          setIsLoading(false);
        }
      }, 500);
    }
  }, [isOpen, editItemId, closeEditModal]);

  // Don't render if not open or still loading
  if (!isOpen || isLoading || !editItemId) {
    return null;
  }

  const handleItemUpdated = async () => {
    // Refresh wardrobe items after successful edit
    const state = useWardrobeStore.getState();
    await state.fetchItems();
  };

  return (
    <EditItemDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeEditModal();
        }
      }}
      itemId={editItemId}
      onItemUpdated={handleItemUpdated}
    />
  );
}
