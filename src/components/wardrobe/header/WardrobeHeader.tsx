"use client";

import { Loader2, Plus, Filter } from "lucide-react";
import { Input as AntInput, ConfigProvider, Badge, Popover } from "antd";
import { Checkbox } from "@/components/ui/checkbox";
import GlassButton from "@/components/ui/glass-button";
import { WardrobeFilters } from "@/types/wardrobe";
import { WardrobeItem } from "@/types";
import { useMemo, useCallback, memo, useState, useEffect } from "react";
import { getUniqueColorsFromItems } from "@/lib/mock/collections";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const { Search } = AntInput;

interface WardrobeHeaderProps {
  onAddItem: () => void;
  isLoading?: boolean;
  filters: WardrobeFilters;
  onFiltersChange: (filters: WardrobeFilters) => void;
  wardrobeItems: WardrobeItem[];
}

// Filter Options Constants
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
} as const;

// Filter Panel Component
const FilterPanel = memo(function FilterPanel({
  filters,
  onToggleFilterArray,
  onClearAll,
  wardrobeItems,
}: {
  filters: WardrobeFilters;
  onToggleFilterArray: (key: keyof WardrobeFilters, value: string) => void;
  onClearAll: () => void;
  wardrobeItems: WardrobeItem[];
}) {
  const availableColors = useMemo(() =>
    getUniqueColorsFromItems(wardrobeItems),
    [wardrobeItems]
  );

  return (
    <div className="space-y-4 w-80">
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
          {FILTER_OPTIONS.seasons.map((season) => (
            <div key={season.value} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.seasons?.includes(season.value) || false}
                onCheckedChange={() => onToggleFilterArray("seasons", season.value)}
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
                onCheckedChange={() => onToggleFilterArray("occasions", occasion.value)}
              />
              <span className="text-sm">{occasion.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="text-sm font-medium mb-2 block">Colors</label>
        <div className="grid grid-cols-4 gap-2">
          {availableColors.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => onToggleFilterArray("colors", colorOption.value)}
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

function useFilterCount(filters: WardrobeFilters) {
  return useMemo(() => {
    return [
      filters.types?.length,
      filters.seasons?.length,
      filters.occasions?.length,
      filters.colors?.length,
    ].filter(Boolean).length;
  }, [filters.types?.length, filters.seasons?.length, filters.occasions?.length, filters.colors?.length]);
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const WardrobeHeader = memo(function WardrobeHeader({
  onAddItem,
  isLoading = false,
  filters,
  onFiltersChange,
  wardrobeItems,
}: WardrobeHeaderProps) {
  const [searchValue, setSearchValue] = useState(filters.q || "");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const activeFiltersCount = useFilterCount(filters);

  // Update filters when debounced search value changes
  useEffect(() => {
    if (debouncedSearchValue !== filters.q) {
      onFiltersChange({ ...filters, q: debouncedSearchValue || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue]); // Intentionally limited dependencies to avoid infinite loop

  const toggleFilterArray = useCallback(
    (key: keyof WardrobeFilters, value: string) => {
      const currentArray = (filters[key] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      onFiltersChange({ ...filters, [key]: newArray.length > 0 ? newArray : undefined });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      ...filters,
      types: undefined,
      seasons: undefined,
      occasions: undefined,
      colors: undefined,
    });
  }, [filters, onFiltersChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((value: string) => {
    setSearchValue(value);
    onFiltersChange({ ...filters, q: value || undefined });
  }, [filters, onFiltersChange]);

  return (
    <div className="space-y-6 mb-8">
      {/* Title */}
      <h4 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
          My Wardrobe
        </span>
      </h4>

      {/* Search Bar and Buttons */}
      <div className="flex items-center gap-4">
        <ConfigProvider
          theme={{
            components: {
              Input: {
                colorBgContainer: 'rgba(255, 255, 255, 0.9)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                colorPrimaryHover: '#60a5fa',
                colorPrimary: '#3b82f6',
              },
            },
          }}
        >
          <Search
            placeholder="Search your wardrobe..."
            allowClear
            size="large"
            value={searchValue}
            onChange={handleSearchChange}
            onSearch={handleSearchSubmit}
            style={{
              flex: 1,
              height: '48px',
            }}
            className=""
          />
        </ConfigProvider>

        {/* Filter Button */}
        <Popover
          content={isPopoverOpen ? (
            <FilterPanel
              filters={filters}
              onToggleFilterArray={toggleFilterArray}
              onClearAll={clearAllFilters}
              wardrobeItems={wardrobeItems}
            />
          ) : null}
          trigger="click"
          placement="bottomRight"
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <div className="glass-button-hover">
            <GlassButton
              variant="custom"
              borderRadius="14px"
              blur="8px"
              brightness={1.12}
              glowColor={activeFiltersCount > 0 ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.3)"}
              glowIntensity={6}
              borderColor={activeFiltersCount > 0 ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.28)"}
              borderWidth="1px"
              textColor="#ffffffff"
              className="px-4 h-12 font-semibold relative"
              displacementScale={5}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge
                  count={activeFiltersCount}
                  className="ml-2"
                  style={{ backgroundColor: '#3b82f6' }}
                />
              )}
            </GlassButton>
          </div>
        </Popover>

        {/* Add Item Button */}
        <div className="glass-button-hover">
          <GlassButton
            onClick={onAddItem}
            disabled={isLoading}
            variant="custom"
            borderRadius="14px"
            blur="8px"
            brightness={1.12}
            glowColor="rgba(59,130,246,0.45)"
            glowIntensity={6}
            borderColor="rgba(255,255,255,0.28)"
            borderWidth="1px"
            textColor="#ffffffff"
            className="px-4 h-12 font-semibold"
            displacementScale={5}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </>
            )}
          </GlassButton>
        </div>
      </div>

      <style jsx>{`
        .glass-button-hover {
          transition: transform 0.2s ease;
        }
        .glass-button-hover:hover {
          transform: scale(1.04);
        }
        .glass-button-hover:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
});
