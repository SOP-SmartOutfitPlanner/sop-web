import { useState, useCallback } from "react";

interface CommunityFilters {
  activeTab: string;
  selectedTag: string;
  searchQuery: string;
  timeFilter: string;
}

/**
 * Custom hook to manage all community filter states
 * Centralizes filter logic and provides clear setters
 */
export function useCommunityFilters(initialFilters?: Partial<CommunityFilters>) {
  const [activeTab, setActiveTab] = useState(initialFilters?.activeTab ?? "latest");
  const [selectedTag, setSelectedTag] = useState(initialFilters?.selectedTag ?? "");
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery ?? "");
  const [timeFilter, setTimeFilter] = useState(initialFilters?.timeFilter ?? "all");

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTag("");
    setTimeFilter("all");
  }, []);

  const resetFilters = useCallback(() => {
    setActiveTab("latest");
    setSelectedTag("");
    setSearchQuery("");
    setTimeFilter("all");
  }, []);

  return {
    // Filter values
    activeTab,
    selectedTag,
    searchQuery,
    timeFilter,

    // Setters
    setActiveTab,
    setSelectedTag,
    setSearchQuery,
    setTimeFilter,

    // Utility functions
    clearAllFilters,
    resetFilters,
  };
}
