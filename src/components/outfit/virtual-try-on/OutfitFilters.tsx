"use client";

import { Search, Heart, Bookmark, X } from "lucide-react";
import { Input } from "antd";
import GlassButton from "@/components/ui/glass-button";

interface OutfitFiltersProps {
  filters: {
    search?: string;
    isFavorite?: boolean;
    isSaved?: boolean;
  };
  showFilters: boolean;
  onFiltersChange: (filters: OutfitFiltersProps["filters"]) => void;
  onToggleFilters: () => void;
}

export function OutfitFilters({
  filters,
  onFiltersChange,
}: OutfitFiltersProps) {
  const handleToggleFavorite = () => {
    if (filters.isFavorite) {
      onFiltersChange({ ...filters, isFavorite: undefined });
    } else {
      onFiltersChange({ ...filters, isFavorite: true, isSaved: undefined });
    }
  };

  const handleToggleSaved = () => {
    if (filters.isSaved) {
      onFiltersChange({ ...filters, isSaved: undefined });
    } else {
      onFiltersChange({ ...filters, isSaved: true, isFavorite: undefined });
    }
  };

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, search: "" });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      {/* Search Box */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <Input
          placeholder="Search outfits..."
          value={filters.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleToggleFavorite}
          className={`
            px-4 py-2 rounded-full font-poppins text-sm font-medium
            transition-all duration-200 flex items-center gap-2
            ${
              filters.isFavorite
                ? "bg-white/20 text-white shadow-md"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <Heart
            className={`w-4 h-4 ${filters.isFavorite ? "fill-current" : ""}`}
          />
          Favorites
        </button>
        <button
          onClick={handleToggleSaved}
          className={`
            px-4 py-2 rounded-full font-poppins text-sm font-medium
            transition-all duration-200 flex items-center gap-2
            ${
              filters.isSaved
                ? "bg-white/20 text-white shadow-md"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <Bookmark
            className={`w-4 h-4 ${filters.isSaved ? "fill-current" : ""}`}
          />
          Saved
        </button>
      </div>
    </div>
  );
}
