"use client";

import { useEffect, useState } from "react";
import { useGlobalEditModal } from "@/hooks/useGlobalEditModal";
import { wardrobeAPI, type ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { useUploadStore } from "@/store/upload-store";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Dynamic import for AddItemWizard to avoid loading it on every page
const AddItemWizard = dynamic(
  () =>
    import("@/components/wardrobe/wizard").then((mod) => ({
      default: mod.AddItemWizard,
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
  const [editItem, setEditItem] = useState<ApiWardrobeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Import upload store to get cached item data
  const { tasks } = useUploadStore();

  // Fetch item details when modal opens with cached data or retry mechanism
  useEffect(() => {
    if (isOpen && editItemId) {
      setIsLoading(true);

      // First, check if we have cached data in upload store
      const cachedTask = tasks.find(
        (task) => task.createdItemId === editItemId && task.createdItemData
      );

      if (cachedTask?.createdItemData) {
        setEditItem(cachedTask.createdItemData);
        setIsLoading(false);
        return;
      }

      // Helper function to fetch with retry
      const fetchWithRetry = async (
        itemId: number,
        attempt = 1,
        maxAttempts = 3
      ): Promise<ApiWardrobeItem> => {
        try {
          // Add delay before fetching
          const delay = attempt > 1 ? attempt * 500 : 300;
          await new Promise((resolve) => setTimeout(resolve, delay));

          const response = await wardrobeAPI.getItem(itemId);

          if (response) {
            return response;
          } else {
            throw new Error("Item not found in response");
          }
        } catch (error) {
          // Retry if not max attempts
          if (attempt < maxAttempts) {
            return fetchWithRetry(itemId, attempt + 1, maxAttempts);
          } else {
            throw error;
          }
        }
      };

      // Start fetching with retry
      fetchWithRetry(editItemId)
        .then((item) => {
          setEditItem(item);
        })
        .catch((error) => {
          console.error("❌ [GlobalEditModal] Failed to fetch item:", error);
          toast.error(
            "Failed to load item details. Please try again from Wardrobe page."
          );
          closeEditModal();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    // Reset edit item when modal closes
    if (!isOpen) {
      setEditItem(null);
    }
  }, [isOpen, editItemId, closeEditModal, tasks]);

  // Show loading state while fetching
  if (isOpen && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Loading item details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not open or no item data
  if (!isOpen || !editItem) {
    return null;
  }

  return (
    <AddItemWizard
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeEditModal();
        }
      }}
      editMode={true}
      editItemId={editItemId || undefined}
      editItem={editItem}
    />
  );
}
