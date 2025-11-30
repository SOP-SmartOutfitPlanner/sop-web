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
    <div className="space-y-3">
      {/* Search Box */}
      <div className="relative">
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
        <GlassButton
          variant={filters.isFavorite ? "primary" : "secondary"}
          size="md"
          onClick={handleToggleFavorite}
          className="gap-1.5"
        >
          <Heart className={`w-4 h-4 ${filters.isFavorite ? "fill-current" : ""}`} />
          Favorites
        </GlassButton>
        <GlassButton
          variant={filters.isSaved ? "primary" : "secondary"}
          size="md"
          onClick={handleToggleSaved}
          className="gap-1.5"
        >
          <Bookmark className={`w-4 h-4 ${filters.isSaved ? "fill-current" : ""}`} />
          Saved
        </GlassButton>
      </div>
    </div>
  );
}
