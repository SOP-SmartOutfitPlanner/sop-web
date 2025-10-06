"use client";

/**
 * Wardrobe Toolbar Component
 * 
 * Optimized toolbar with:
 * - Fuse.js powered fuzzy search
 * - Memoized constants and dynamic data
 * - Performance-optimized components
 * - Real-time filtering and sorting
 */

import { useState, useCallback, useEffect, memo, useMemo } from "react";
import { Search, Command, Filter, X, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { useWardrobeStore } from "@/store/wardrobe-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { WardrobeFilters, Collection } from "@/types/wardrobe";
import { WardrobeItem } from "@/types";
import { getUniqueColorsFromItems } from "@/lib/mock/collections";
import { cn } from "@/lib/utils";

// Types
interface ToolbarProps {
  filters: WardrobeFilters;
  onFiltersChange: (filters: WardrobeFilters) => void;
  collections: Collection[];
  selectedItems: string[];
  onClearSelection: () => void;
  onSelectMode: (enabled: boolean) => void;
  isSelectMode: boolean;
  wardrobeItems: WardrobeItem[];
}

interface FilterPanelProps {
  filters: WardrobeFilters;
  onToggleFilterArray: (key: keyof WardrobeFilters, value: string) => void;
  onClearAll: () => void;
  wardrobeItems: WardrobeItem[];
}



// Constants - Optimized and memoized
const FILTER_OPTIONS = {
  types: [
    { value: "top", label: "Tops" },
    { value: "bottom", label: "Bottoms" },
    { value: "shoes", label: "Shoes" },
    { value: "outer", label: "Outerwear" },
    { value: "accessory", label: "Accessories" },
  ] as const,
  
  seasons: [
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "fall", label: "Fall" },
    { value: "winter", label: "Winter" },
  ] as const,
  
  occasions: [
    { value: "casual", label: "Casual" },
    { value: "smart", label: "Smart" },
    { value: "formal", label: "Formal" },
    { value: "sport", label: "Sport" },
    { value: "travel", label: "Travel" },
  ] as const,
  
  sort: [
    { value: "newest", label: "Newest First" },
    { value: "mostWorn", label: "Most Worn" },
    { value: "leastWorn", label: "Least Worn" },
    { value: "alpha", label: "A → Z" },
  ] as const,
} as const;

// Hooks
function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("wardrobe-search")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function useFilterCount(filters: WardrobeFilters) {
  return [
    filters.q,
    filters.types?.length,
    filters.seasons?.length,
    filters.occasions?.length,
    filters.colors?.length,
    filters.collectionId !== "all" ? filters.collectionId : null,
  ].filter(Boolean).length;
}

// Components
const SearchInput = memo(function SearchInput({
  value,
  onChange,
  wardrobeItems = [],
}: {
  value: string;
  onChange: (value: string) => void;
  wardrobeItems?: WardrobeItem[];
}) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Get store methods to sync search with filtering
  const { setSearchQuery } = useWardrobeStore();

  // Use fuzzy search for suggestions
  const { results, suggestions } = useAdvancedSearch(wardrobeItems, value);

  // Show suggestions when focused and typing
  const shouldShowSuggestions = focused && value.length >= 2 && (results.length > 0 || suggestions.length > 0);

  useEffect(() => {
    setShowSuggestions(shouldShowSuggestions);
  }, [shouldShowSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onChange(suggestion); // Update local state
    setSearchQuery(suggestion); // Sync with store for filtering
    setShowSuggestions(false);
  }, [onChange, setSearchQuery]);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        id="wardrobe-search"
        placeholder="Search wardrobe with AI..."
        value={value}
        onChange={(e) => {
          const newValue = e.target.value || "";
          onChange(newValue); // Update local state
          setSearchQuery(newValue); // Sync with store for filtering
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay to allow suggestion clicks
          setTimeout(() => setFocused(false), 200);
        }}
        className={cn(
          "pl-10 pr-16 transition-all duration-200",
          focused && "ring-2 ring-primary/20"
        )}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
        <Command className="w-3 h-3" />
        <span>K</span>
      </div>

      {/* Fuzzy Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Found {results.length} items
              </div>
              {results.slice(0, 5).map((result) => (
                <div
                  key={result.item.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-sm"
                  onClick={() => handleSuggestionClick(result.item.name)}
                >
                  <div className="w-6 h-6 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs">
                      {result.item.type === 'top' ? '👕' : 
                       result.item.type === 'bottom' ? '👖' : 
                       result.item.type === 'shoes' ? '👟' : '🧥'}
                    </span>
                  </div>
                  <div className="flex-1 truncate">
                    <span className="font-medium">{result.item.name}</span>
                    {result.item.brand && (
                      <span className="text-muted-foreground ml-2">• {result.item.brand}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Suggestions
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-accent"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {results.length === 0 && suggestions.length === 0 && value.length >= 2 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No items found for &ldquo;{value}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const CollectionSelect = memo(function CollectionSelect({
  value,
  collections,
  onChange,
}: {
  value: string;
  collections: Collection[];
  onChange: (value: string) => void;
}) {
  // Only use onChange prop - let parent handle store sync to avoid double updates
  return (
    <Select value={value || "all"} onValueChange={onChange}>
      <SelectTrigger className="w-full lg:w-48">
        <SelectValue placeholder="Collection" />
      </SelectTrigger>
      <SelectContent>
        {collections.map((collection) => (
          <SelectItem key={collection.id} value={collection.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: collection.color }}
              />
              <span>{collection.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {collection.count}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const SortSelect = memo(function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Use store hook for additional sync (setSortBy for sorting logic)
  const { setSortBy } = useWardrobeStore();

  const handleSortChange = useCallback((sortValue: string) => {
    onChange(sortValue); // Update filters via parent (toolbar → wardrobe page → store)
    setSortBy(sortValue); // Also update store sortBy for sorting logic
  }, [onChange, setSortBy]);

  return (
    <Select value={value || "newest"} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full lg:w-48">
        <SortAsc className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.sort.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const FilterButton = memo(function FilterButton({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("relative", activeCount > 0 && "border-primary")}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        {children}
      </PopoverContent>
    </Popover>
  );
});

const SelectModeButton = memo(function SelectModeButton({
  isSelectMode,
  onToggle,
}: {
  isSelectMode: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant={isSelectMode ? "default" : "outline"}
      onClick={onToggle}
      className="whitespace-nowrap"
    >
      {isSelectMode ? "Cancel" : "Select"}
    </Button>
  );
});

const SelectionBar = memo(function SelectionBar({
  selectedCount,
  onClearSelection,
}: {
  selectedCount: number;
  onClearSelection: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
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
  );
});

const ActiveFilters = memo(function ActiveFilters({
  filters,
  onUpdateFilter,
  onToggleFilterArray,
  onClearAll,
}: {
  filters: WardrobeFilters;
  onUpdateFilter: (key: keyof WardrobeFilters, value: string | undefined) => void;
  onToggleFilterArray: (key: keyof WardrobeFilters, value: string) => void;
  onClearAll: () => void;
}) {
  const activeCount = useFilterCount(filters);

  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {filters.q && (
        <Badge variant="secondary" className="gap-1">
          Search: &ldquo;{filters.q}&rdquo;
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onUpdateFilter("q", undefined)}
          />
        </Badge>
      )}

      {filters.types?.map((type) => (
        <Badge key={type} variant="secondary" className="gap-1">
          {type}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onToggleFilterArray("types", type)}
          />
        </Badge>
      ))}

      {filters.seasons?.map((season) => (
        <Badge key={season} variant="secondary" className="gap-1">
          {season}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onToggleFilterArray("seasons", season)}
          />
        </Badge>
      ))}

      {filters.occasions?.map((occasion) => (
        <Badge key={occasion} variant="secondary" className="gap-1">
          {occasion}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onToggleFilterArray("occasions", occasion)}
          />
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
});

const FilterPanel = memo(function FilterPanel({
  filters,
  onToggleFilterArray,
  onClearAll,
  wardrobeItems,
}: FilterPanelProps) {
  // Optimized: Memoize dynamic colors generation
  const availableColors = useMemo(() => 
    getUniqueColorsFromItems(wardrobeItems),
    [wardrobeItems]
  );



  // Only update via parent to avoid double sync
  const handleToggleFilterArray = useCallback((key: keyof WardrobeFilters, value: string) => {
    onToggleFilterArray(key, value);
  }, [onToggleFilterArray]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filter Items</h4>
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      </div>

      {/* Types */}
      <div>
        <label className="text-sm font-medium mb-2 block">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {FILTER_OPTIONS.types.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.types?.includes(type.value) || false}
                onCheckedChange={() => handleToggleFilterArray("types", type.value)}
              />
              <span className="text-sm">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seasons */}
      <div>
        <label className="text-sm font-medium mb-2 block">Season</label>
        <div className="grid grid-cols-2 gap-2">
          {FILTER_OPTIONS.seasons.map((season) => (
            <div key={season.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.seasons?.includes(season.value) || false}
                onCheckedChange={() =>
                  handleToggleFilterArray("seasons", season.value)
                }
              />
              <span className="text-sm">{season.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Occasions */}
      <div>
        <label className="text-sm font-medium mb-2 block">Occasion</label>
        <div className="grid grid-cols-2 gap-2">
          {FILTER_OPTIONS.occasions.map((occasion) => (
            <div key={occasion.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.occasions?.includes(occasion.value) || false}
                onCheckedChange={() =>
                  handleToggleFilterArray("occasions", occasion.value)
                }
              />
              <span className="text-sm">{occasion.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Colors - Dynamic from wardrobe items */}
      <div>
        <label className="text-sm font-medium mb-2 block">Colors</label>
        <div className="grid grid-cols-4 gap-2">
          {availableColors.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => handleToggleFilterArray("colors", colorOption.value)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                filters.colors?.includes(colorOption.value)
                  ? "border-primary scale-110"
                  : "border-border hover:scale-105"
              )}
              style={{ backgroundColor: colorOption.value }}
              title={colorOption.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Main Component
export const Toolbar = memo(function Toolbar({
  filters,
  onFiltersChange,
  collections,
  selectedItems,
  onClearSelection,
  onSelectMode,
  isSelectMode,
  wardrobeItems,
}: ToolbarProps) {
  useKeyboardShortcuts();

  const updateFilter = useCallback(
    (key: keyof WardrobeFilters, value: string | string[] | undefined) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const toggleFilterArray = useCallback(
    (key: keyof WardrobeFilters, value: string) => {
      const currentArray = (filters[key] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      updateFilter(key, newArray.length > 0 ? newArray : undefined);
    },
    [filters, updateFilter]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      collectionId: "all",
      sort: "newest",
    });
  }, [onFiltersChange]);

  const activeFiltersCount = useFilterCount(filters);

  return (
    <div className="space-y-4">
      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <SearchInput
          value={filters.q || ""}
          onChange={(value) => updateFilter("q", value || undefined)}
          wardrobeItems={wardrobeItems}
        />

        {!isSelectMode && (
          <>
            <CollectionSelect
              value={filters.collectionId || "all"}
              collections={collections}
              onChange={(value) => updateFilter("collectionId", value)}
            />

            <SortSelect
              value={filters.sort || "newest"}
              onChange={(value) => updateFilter("sort", value)}
            />

            <FilterButton activeCount={activeFiltersCount}>
              <FilterPanel
                filters={filters}
                onToggleFilterArray={toggleFilterArray}
                onClearAll={clearAllFilters}
                wardrobeItems={wardrobeItems}
              />
            </FilterButton>
          </>
        )}

        <SelectModeButton
          isSelectMode={isSelectMode}
          onToggle={() => onSelectMode(!isSelectMode)}
        />
      </div>

      {/* Selection Bar */}
      {isSelectMode && (
        <SelectionBar
          selectedCount={selectedItems.length}
          onClearSelection={onClearSelection}
        />
      )}

      {/* Active Filters */}
      <ActiveFilters
        filters={filters}
        onUpdateFilter={updateFilter}
        onToggleFilterArray={toggleFilterArray}
        onClearAll={clearAllFilters}
      />
    </div>
  );
});
