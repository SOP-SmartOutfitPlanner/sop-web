"use client";

import { memo, useState, useEffect } from "react";
import { FilterDropdown } from "./filter-dropdown";
import { SortDropdown } from "./sort-dropdown";
import { AdvancedFilterModal } from "./advanced-filter-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Command, Filter, X, SortAsc } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [searchFocused, setSearchFocused] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('wardrobe-search')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Calculate active filters count
  const activeFiltersCount = [
    searchQuery,
    quickFilter !== 'all' ? quickFilter : null,
    advancedFilters.types?.length,
    advancedFilters.seasons?.length,
    advancedFilters.occasions?.length,
    advancedFilters.colors?.length,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onSearchChange('');
    onQuickFilterChange('all');
    onClearAdvancedFilters();
  };

  return (
    <div className="space-y-4">
      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="wardrobe-search"
            placeholder="Search wardrobe..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "pl-10 pr-16 transition-all duration-200",
              searchFocused && "ring-2 ring-primary/20"
            )}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {!isSelectionMode && (
          <>
            {/* Filter Dropdown */}
            <FilterDropdown
              selectedFilter={quickFilter}
              onFilterChange={onQuickFilterChange}
            />

            {/* Sort Dropdown */}
            <div className="relative">
              <SortDropdown selectedSort={sortBy} onSortChange={onSortChange} />
            </div>

            {/* Advanced Filter */}
            <div className="relative">
              <AdvancedFilterModal
                filters={advancedFilters}
                onFiltersChange={onAdvancedFiltersChange}
                onClearFilters={onClearAdvancedFilters}
              />
            </div>
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
          <Button
            variant="outline"
            onClick={onToggleSelectionMode}
            className="whitespace-nowrap"
          >
            Select
          </Button>
        )}
      </div>

      {/* Selection Bar */}
      {isSelectionMode && selectedCount > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Add to Collection
            </Button>
            <Button size="sm" variant="outline">
              Set Status
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onSearchChange('')} 
              />
            </Badge>
          )}
          
          {quickFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {quickFilter}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onQuickFilterChange('all')} 
              />
            </Badge>
          )}

          {advancedFilters.types?.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onAdvancedFiltersChange({
                  ...advancedFilters,
                  types: advancedFilters.types.filter(t => t !== type)
                })} 
              />
            </Badge>
          ))}

          {advancedFilters.seasons?.map(season => (
            <Badge key={season} variant="secondary" className="gap-1">
              {season}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onAdvancedFiltersChange({
                  ...advancedFilters,
                  seasons: advancedFilters.seasons.filter(s => s !== season)
                })} 
              />
            </Badge>
          ))}

          {advancedFilters.occasions?.map(occasion => (
            <Badge key={occasion} variant="secondary" className="gap-1">
              {occasion}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onAdvancedFiltersChange({
                  ...advancedFilters,
                  occasions: advancedFilters.occasions.filter(o => o !== occasion)
                })} 
              />
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
});
