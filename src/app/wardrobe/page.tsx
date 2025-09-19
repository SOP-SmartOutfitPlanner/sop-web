"use client";

import { useState } from "react";
import { ItemGrid } from "@/components/wardrobe/item-grid";
import { Filters } from "@/components/wardrobe/filters";
import { AddItemForm } from "@/components/wardrobe/add-item-form";
import { FilterDropdown } from "@/components/wardrobe/filter-dropdown";
import { SortDropdown } from "@/components/wardrobe/sort-dropdown";
import { AdvancedFilterModal } from "@/components/wardrobe/advanced-filter-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { Plus, Search, Database } from "lucide-react";

export default function WardrobePage() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState({
    types: [],
    seasons: [],
    occasions: [],
    colors: [],
  });

  const {
    isLoading,
    error,
    fetchItems,
    items,
    sortBy,
    setSortBy,
    setFilters,
    setSearchQuery: setStoreSearchQuery,
  } = useWardrobeStore();

  // Debug logging
  console.log("Current items:", items);

  const handleRefreshItems = async () => {
    try {
      await fetchItems();
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const handleQuickFilterChange = (filter: string) => {
    setQuickFilter(filter);
    setFilters({ quickFilter: filter });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleAdvancedFiltersChange = (filters: any) => {
    setAdvancedFilters(filters);
    setFilters({
      quickFilter,
      ...filters,
    });
  };

  const handleClearAdvancedFilters = () => {
    const emptyFilters = {
      types: [],
      seasons: [],
      occasions: [],
      colors: [],
    };
    setAdvancedFilters(emptyFilters);
    setFilters({ quickFilter });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setStoreSearchQuery(value);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">My Wardrobe</h1>
          <p className="text-gray-600">
            Manage your clothing collection with smart organization
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsAddItemOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Advanced Search & Filter Bar */}
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

        <FilterDropdown
          selectedFilter={quickFilter}
          onFilterChange={handleQuickFilterChange}
        />

        <SortDropdown selectedSort={sortBy} onSortChange={handleSortChange} />

        <AdvancedFilterModal
          filters={advancedFilters}
          onFiltersChange={handleAdvancedFiltersChange}
          onClearFilters={handleClearAdvancedFilters}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ItemGrid />
        </div>
        <div className="lg:col-span-1">
          <Filters />
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemForm
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
      />
    </div>
  );
}
