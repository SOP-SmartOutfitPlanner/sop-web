"use client";

import { SearchFilters } from "./SearchFilters";

interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * All filter components grouped together
 */
export function CommunityFilters({
  searchQuery,
  onSearchChange,
}: CommunityFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}
