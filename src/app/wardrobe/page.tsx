"use client";

import { useState, useCallback, useMemo } from "react";
import { AddItemForm } from "@/components/wardrobe/add-item-form";
import { WardrobeHeader } from "@/components/wardrobe/wardrobe-header";
import { Toolbar } from "@/components/wardrobe/toolbar";
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content";
import { ErrorDisplay } from "@/components/common/error-display";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { getCollectionsWithCounts } from "@/lib/mock/collections";
import { WardrobeFilters } from "@/types/wardrobe";

export default function WardrobePage() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Store hooks
  const {
    isLoading,
    error,
    items,
    isSelectionMode,
    toggleSelectionMode,
    selectedItems,
    clearSelection,
  } = useWardrobeStore();

  // Toolbar filters state
  const [filters, setFilters] = useState<WardrobeFilters>({
    collectionId: "all",
    sort: "newest",
  });

  // Collections data - Pass actual items instead of just length
  const collections = useMemo(() => getCollectionsWithCounts(items), [items]);

  // Memoized handlers
  const handleAddItem = useCallback(() => {
    setIsAddItemOpen(true);
  }, []);

  const handleCloseAddItem = useCallback(() => {
    setIsAddItemOpen(false);
  }, []);

  const handleFiltersChange = useCallback((newFilters: WardrobeFilters) => {
    setFilters(newFilters);
    // TODO: Apply filters to store
    console.log("Filters changed:", newFilters);
  }, []);

  const handleSelectMode = useCallback(
    (enabled: boolean) => {
      if (enabled !== isSelectionMode) {
        toggleSelectionMode();
      }
    },
    [isSelectionMode, toggleSelectionMode]
  );

  // Render
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}

      {/* Header Section */}
      <WardrobeHeader onAddItem={handleAddItem} isLoading={isLoading} />

      {/* Toolbar */}
      <Toolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        collections={collections}
        selectedItems={selectedItems}
        onClearSelection={clearSelection}
        onSelectMode={handleSelectMode}
        isSelectMode={isSelectionMode}
        wardrobeItems={items}
      />

      {/* Main Content */}
      <WardrobeContent />

      {/* Add Item Modal */}
      <AddItemForm isOpen={isAddItemOpen} onClose={handleCloseAddItem} />
    </div>
  );
}
