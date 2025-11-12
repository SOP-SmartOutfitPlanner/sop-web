"use client";

import { Loader2, Plus, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input as AntInput, ConfigProvider, Badge } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { WardrobeFilters } from "@/types/wardrobe";
import { WardrobeItem } from "@/types";
import { useMemo, useCallback, memo, useState, useEffect } from "react";
import { FilterModal } from "@/components/wardrobe/FilterModal";

const { Search } = AntInput;

interface WardrobeHeaderProps {
  onAddItem: () => void;
  isLoading?: boolean;
  filters: WardrobeFilters;
  onFiltersChange: (filters: WardrobeFilters) => void;
  wardrobeItems?: WardrobeItem[];
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
}: WardrobeHeaderProps) {
  const [searchValue, setSearchValue] = useState(filters.q || "");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.categoryId !== undefined ? 1 : 0,
      filters.seasonId !== undefined ? 1 : 0,
      filters.styleId !== undefined ? 1 : 0,
      filters.occasionId !== undefined ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
  }, [filters.categoryId, filters.seasonId, filters.styleId, filters.occasionId]);

  // Update filters when debounced search value changes
  useEffect(() => {
    if (debouncedSearchValue !== filters.q) {
      onFiltersChange({ ...filters, q: debouncedSearchValue || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue]); // Intentionally limited dependencies to avoid infinite loop

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

        {/* Sort by Date Buttons */}
        <div className="glass-button-hover">
          <GlassButton
            onClick={() => onFiltersChange({
              ...filters,
              sortByDate: filters.sortByDate === "desc" ? undefined : "desc"
            })}
            variant="custom"
            borderRadius="14px"
            blur="8px"
            brightness={filters.sortByDate === "desc" ? 1.3 : 1.12}
            glowColor={filters.sortByDate === "desc" ? "rgba(59,130,246,0.7)" : "rgba(255,255,255,0.3)"}
            glowIntensity={filters.sortByDate === "desc" ? 10 : 6}
            borderColor={filters.sortByDate === "desc" ? "rgba(59,130,246,0.9)" : "rgba(255,255,255,0.28)"}
            borderWidth={filters.sortByDate === "desc" ? "2px" : "1px"}
            backgroundColor={filters.sortByDate === "desc" ? "rgba(20, 105, 241, 0.86)" : undefined}
            textColor="#ffffffff"
            className="px-3 h-12 font-semibold"
            displacementScale={5}
          >
            <SortDesc className={`h-4 w-4 ${filters.sortByDate === "desc" ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : ""}`} />
          </GlassButton>
        </div>

        <div className="glass-button-hover">
          <GlassButton
            onClick={() => onFiltersChange({
              ...filters,
              sortByDate: filters.sortByDate === "asc" ? undefined : "asc"
            })}
            variant="custom"
            borderRadius="14px"
            blur="8px"
            brightness={filters.sortByDate === "asc" ? 1.3 : 1.12}
            glowColor={filters.sortByDate === "asc" ? "rgba(59,130,246,0.7)" : "rgba(255,255,255,0.3)"}
            glowIntensity={filters.sortByDate === "asc" ? 10 : 6}
            borderColor={filters.sortByDate === "asc" ? "rgba(59,130,246,0.9)" : "rgba(255,255,255,0.28)"}
            borderWidth={filters.sortByDate === "asc" ? "2px" : "1px"}
            backgroundColor={filters.sortByDate === "asc" ? "rgba(20, 105, 241, 0.86)" : undefined}
            textColor="#ffffffff"
            className="px-3 h-12 font-semibold"
            displacementScale={5}
          >
            <SortAsc className={`h-4 w-4 ${filters.sortByDate === "asc" ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : ""}`} />
          </GlassButton>
        </div>

        {/* Filter Button */}
        <div className="glass-button-hover">
          <GlassButton
            onClick={() => setIsFilterModalOpen(true)}
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

      {/* Filter Modal */}
      <FilterModal
        open={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filters={filters}
        onApplyFilters={onFiltersChange}
      />
    </div>
  );
});
