"use client";

import { Search, Heart, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import GlassButton from "@/components/ui/glass-button";
import { useOutfitStore } from "@/store/outfit-store";

export function OutfitFilters() {
  const { searchQuery, setSearchQuery, showFavorites, setShowFavorites } = useOutfitStore();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search outfits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <GlassButton
          variant={showFavorites ? "primary" : "secondary"}
          size="md"
          onClick={() => setShowFavorites(!showFavorites)}
          className="gap-2"
        >
          <Heart
            className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`}
          />
          Favorites
        </GlassButton>
      </div>
    </div>
  );
}
