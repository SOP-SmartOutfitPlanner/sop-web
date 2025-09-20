"use client";

import { memo } from "react";
import { FilterDropdown } from "./filter-dropdown";
import { SortDropdown } from "./sort-dropdown";
import { AdvancedFilterModal } from "./advanced-filter-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  quickFilter: string;
  onQuickFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  advancedFilters: {
    types: string[];
    seasons: string[];
    occasions: string[];
    colors: string[];
  };
  onAdvancedFiltersChange: (filters: any) => void;
  onClearAdvancedFilters: () => void;
  // Selection props
  isSelectionMode: boolean;
  selectedCount: number;
  totalItems: number;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const SearchFilterBar = memo(function SearchFilterBar({
  searchQuery,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  sortBy,
  onSortChange,
  advancedFilters,
  onAdvancedFiltersChange,
  onClearAdvancedFilters,
  isSelectionMode,
  selectedCount,
  totalItems,
  onToggleSelectionMode,
  onSelectAll,
  onClearSelection,
}: SearchFilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search wardrobe..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {!isSelectionMode && (
        <>
          <FilterDropdown
            selectedFilter={quickFilter}
            onFilterChange={onQuickFilterChange}
          />

          <SortDropdown selectedSort={sortBy} onSortChange={onSortChange} />

          <AdvancedFilterModal
            filters={advancedFilters}
            onFiltersChange={onAdvancedFiltersChange}
            onClearFilters={onClearAdvancedFilters}
          />
        </>
      )}

      {/* Selection Mode Controls */}
      {isSelectionMode ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {totalItems} selected
          </span>
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            Select All
          </Button>
          <Button variant="secondary" size="sm" onClick={onToggleSelectionMode}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={onToggleSelectionMode}>
          Select
        </Button>
      )}
    </div>
  );
});
