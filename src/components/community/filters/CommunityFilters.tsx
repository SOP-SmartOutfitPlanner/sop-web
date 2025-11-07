"use client";

import { StatsBar } from "./StatsBar";
import { HashtagCloud } from "./HashtagCloud";
import { CommunityTabs } from "./CommunityTabs";
import { SearchFilters } from "./SearchFilters";

interface CommunityFiltersProps {
  activeTab: string;
  selectedTag: string;
  searchQuery: string;
  timeFilter: string;
  onTabChange: (tab: string) => void;
  onTagClick: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onTagChange: (tag: string) => void;
  onTimeFilterChange: (filter: string) => void;
  onClearAll: () => void;
}

/**
 * All filter components grouped together
 * Stats Bar, Hashtag Cloud, Tabs, and Search Filters
 */
export function CommunityFilters({
  activeTab,
  selectedTag,
  searchQuery,
  timeFilter,
  onTabChange,
  onTagClick,
  onSearchChange,
  onTagChange,
  onTimeFilterChange,
  onClearAll,
}: CommunityFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <StatsBar />

      {/* Hashtag Cloud */}
      <HashtagCloud selectedTag={selectedTag} onTagClick={onTagClick} />

      {/* Tabs */}
      <CommunityTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Search & Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        timeFilter={timeFilter}
        onSearchChange={onSearchChange}
        onTagChange={onTagChange}
        onTimeFilterChange={onTimeFilterChange}
        onClearAll={onClearAll}
      />
    </div>
  );
}
