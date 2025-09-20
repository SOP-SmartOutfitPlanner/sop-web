"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { Search, Command, Filter, X, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TypeKind, Season, Occasion, WardrobeItem } from "@/types";
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
  wardrobeItems: WardrobeItem[]; // Add this to get real data
}

interface FilterPanelProps {
  filters: WardrobeFilters;
  onToggleFilterArray: (key: keyof WardrobeFilters, value: any) => void;
  onClearAll: () => void;
  wardrobeItems: WardrobeItem[]; // Add this for dynamic colors
}

// Constants
const TYPE_OPTIONS: { value: TypeKind; label: string }[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "outer", label: "Outerwear" },
  { value: "accessory", label: "Accessories" },
];

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

const OCCASION_OPTIONS: { value: Occasion; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "smart", label: "Smart" },
  { value: "formal", label: "Formal" },
  { value: "sport", label: "Sport" },
  { value: "travel", label: "Travel" },
];

// COLOR_OPTIONS will be generated dynamically from wardrobe items

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "mostWorn", label: "Most Worn" },
  { value: "leastWorn", label: "Least Worn" },
  { value: "alpha", label: "A → Z" },
];

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
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        id="wardrobe-search"
        placeholder="Search wardrobe..."
        value={value}
        onChange={(e) => onChange(e.target.value || "")}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "pl-10 pr-16 transition-all duration-200",
          focused && "ring-2 ring-primary/20"
        )}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
        <Command className="w-3 h-3" />
        <span>K</span>
      </div>
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
  return (
    <Select value={value || "newest"} onValueChange={onChange}>
      <SelectTrigger className="w-full lg:w-48">
        <SortAsc className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
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
  onUpdateFilter: (key: keyof WardrobeFilters, value: any) => void;
  onToggleFilterArray: (key: keyof WardrobeFilters, value: any) => void;
  onClearAll: () => void;
}) {
  const activeCount = useFilterCount(filters);

  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {filters.q && (
        <Badge variant="secondary" className="gap-1">
          Search: "{filters.q}"
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
  // Get dynamic colors from wardrobe items
  const availableColors = getUniqueColorsFromItems(wardrobeItems);

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
          {TYPE_OPTIONS.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.types?.includes(type.value) || false}
                onCheckedChange={() => onToggleFilterArray("types", type.value)}
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
          {SEASON_OPTIONS.map((season) => (
            <div key={season.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.seasons?.includes(season.value) || false}
                onCheckedChange={() =>
                  onToggleFilterArray("seasons", season.value)
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
          {OCCASION_OPTIONS.map((occasion) => (
            <div key={occasion.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.occasions?.includes(occasion.value) || false}
                onCheckedChange={() =>
                  onToggleFilterArray("occasions", occasion.value)
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
          {availableColors.map((color) => (
            <button
              key={color.value}
              onClick={() => onToggleFilterArray("colors", color.value)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                filters.colors?.includes(color.value)
                  ? "border-primary scale-110"
                  : "border-border hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
              title={color.label}
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
    (key: keyof WardrobeFilters, value: any) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const toggleFilterArray = useCallback(
    (key: keyof WardrobeFilters, value: any) => {
      const currentArray = (filters[key] as any[]) || [];
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
