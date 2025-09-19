import { useCallback } from "react";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { MESSAGES } from "@/lib/constants/wardrobe";

export function useBulkActions() {
  const { selectedItems, clearSelection, bulkDeleteItems } = useWardrobeStore();

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;

    const confirmMessage = MESSAGES.DELETE_CONFIRM(selectedItems.length);
    
    if (window.confirm(confirmMessage)) {
      try {
        await bulkDeleteItems(selectedItems);
      } catch (error) {
        console.error(MESSAGES.ERROR_DELETE, error);
      }
    }
  }, [selectedItems, bulkDeleteItems]);

  const handleAddToCollection = useCallback(() => {
    // TODO: Implement later
    if (process.env.NODE_ENV === 'development') {
      console.log("Add to collection:", selectedItems);
    }
  }, [selectedItems]);

  const handleSetStatus = useCallback(() => {
    // TODO: Implement later
    if (process.env.NODE_ENV === 'development') {
      console.log("Set status:", selectedItems);
    }
  }, [selectedItems]);

  return {
    selectedItems,
    handleBulkDelete,
    handleAddToCollection,
    handleSetStatus,
    clearSelection,
  };
}
