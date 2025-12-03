"use client";

import { memo, useCallback } from "react";
import { Search, Heart, X } from "lucide-react";
import { useOutfitStore, OutfitViewMode } from "@/store/outfit-store";
import { Input } from "antd";

const OutfitFiltersComponent = () => {
  const {
    searchQuery,
    setSearchQuery,
    showFavorites,
    setShowFavorites,
    viewMode,
    setViewMode,
  } = useOutfitStore();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites(!showFavorites);
  }, [showFavorites, setShowFavorites]);

  const handleViewModeChange = useCallback(
    (mode: OutfitViewMode) => {
      setViewMode(mode);
    },
    [setViewMode]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Favorites Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          <Input
            type="text"
            placeholder="Search outfits..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white/70"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Favorites Filter - Only show in my-outfits mode */}
        {viewMode === "my-outfits" && (
          <button
            onClick={handleToggleFavorites}
            className={`
              px-4 py-2 rounded-full font-poppins text-sm font-medium
              transition-all duration-200 flex items-center gap-2
              ${
                showFavorites
                  ? "bg-white/20 text-white shadow-md"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <Heart
              className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`}
            />
            Favorites
          </button>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit">
        <button
          onClick={() => handleViewModeChange("my-outfits")}
          className={`
            px-4 py-2 rounded-full font-poppins text-sm font-medium
            transition-all duration-200
            ${
              viewMode === "my-outfits"
                ? "bg-white/20 text-white shadow-md"
                : "text-white/70 hover:text-white"
            }
          `}
        >
          My Outfits
        </button>
        <button
          onClick={() => handleViewModeChange("saved-from-collections")}
          className={`
            px-4 py-2 rounded-full font-poppins text-sm font-medium
            transition-all duration-200
            ${
              viewMode === "saved-from-collections"
                ? "bg-white/20 text-white shadow-md"
                : "text-white/70 hover:text-white"
            }
          `}
        >
          Saved from Collections
        </button>
        <button
          onClick={() => handleViewModeChange("saved-from-posts")}
          className={`
            px-4 py-2 rounded-full font-poppins text-sm font-medium
            transition-all duration-200
            ${
              viewMode === "saved-from-posts"
                ? "bg-white/20 text-white shadow-md"
                : "text-white/70 hover:text-white"
            }
          `}
        >
          Saved from Posts
        </button>
      </div>
    </div>
  );
};

// Memoize filters to prevent unnecessary re-renders
export const OutfitFilters = memo(OutfitFiltersComponent);
