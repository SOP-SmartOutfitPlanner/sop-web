"use client";

import { useState, useCallback, useMemo } from "react";
import { AddItemForm } from "@/components/wardrobe/add-item-form";
import { BulkActionsBar } from "@/components/wardrobe/bulk-actions-bar";
import { WardrobeHeader } from "@/components/wardrobe/wardrobe-header";
import { SearchFilterBar } from "@/components/wardrobe/search-filter-bar";
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content";
import { ErrorDisplay } from "@/components/common/error-display";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useWardrobeFilters } from "@/hooks/useWardrobeFilters";
import { useBulkActions } from "@/hooks/useBulkActions";

export default function WardrobePage() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Store hooks
  const { isLoading, error, sortBy, setSortBy } = useWardrobeStore();

  // Custom hooks
  const filterHooks = useWardrobeFilters();
  const bulkHooks = useBulkActions();

  // Memoized handlers
  const handleAddItem = useCallback(() => {
    setIsAddItemOpen(true);
  }, []);

  const handleCloseAddItem = useCallback(() => {
    setIsAddItemOpen(false);
  }, []);

  const handleSortChange = useCallback(
    (sort: string) => {
      setSortBy(sort);
    },
    [setSortBy]
  );

  // Render
  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}

      {/* Header Section */}
      <WardrobeHeader onAddItem={handleAddItem} isLoading={isLoading} />

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={filterHooks.searchQuery}
        onSearchChange={filterHooks.handleSearchChange}
        quickFilter={filterHooks.quickFilter}
        onQuickFilterChange={filterHooks.handleQuickFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        advancedFilters={filterHooks.advancedFilters}
        onAdvancedFiltersChange={filterHooks.handleAdvancedFiltersChange}
        onClearAdvancedFilters={filterHooks.handleClearAdvancedFilters}
      />

      {/* Main Content */}
      <WardrobeContent />

      {/* Add Item Modal */}
      <AddItemForm isOpen={isAddItemOpen} onClose={handleCloseAddItem} />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulkHooks.selectedItems.length}
        onClearSelection={bulkHooks.clearSelection}
        onAddToCollection={bulkHooks.handleAddToCollection}
        onSetStatus={bulkHooks.handleSetStatus}
        onDelete={bulkHooks.handleBulkDelete}
      />
    </div>
  );
}
