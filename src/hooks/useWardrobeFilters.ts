import { useState, useCallback } from "react";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { DEFAULT_FILTER, ADVANCED_FILTER_DEFAULTS } from "@/lib/constants/wardrobe";

interface AdvancedFilters {
  types: string[];
  seasons: string[];
  occasions: string[];
  colors: string[];
}

export function useWardrobeFilters() {
  const [quickFilter, setQuickFilter] = useState(DEFAULT_FILTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(ADVANCED_FILTER_DEFAULTS);

  const { setFilters, setSearchQuery: setStoreSearchQuery } = useWardrobeStore();

  const handleQuickFilterChange = useCallback((filter: string) => {
    setQuickFilter(filter);
    setFilters({ quickFilter: filter });
  }, [setFilters]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setStoreSearchQuery(value);
  }, [setStoreSearchQuery]);

  const handleAdvancedFiltersChange = useCallback((filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setFilters({
      quickFilter,
      ...filters,
    });
  }, [quickFilter, setFilters]);

  const handleClearAdvancedFilters = useCallback(() => {
    setAdvancedFilters(ADVANCED_FILTER_DEFAULTS);
    setFilters({ quickFilter });
  }, [quickFilter, setFilters]);

  return {
    // State
    quickFilter,
    searchQuery,
    advancedFilters,
    // Handlers
    handleQuickFilterChange,
    handleSearchChange,
    handleAdvancedFiltersChange,
    handleClearAdvancedFilters,
  };
}
