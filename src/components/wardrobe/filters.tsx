"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltersProps } from "@/types/wardrobe";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { colors } from "@/lib/mock/wardrobe-items";

const categories = ["top", "bottom", "shoes", "outer", "accessory"];
const seasons = ["spring", "summer", "fall", "winter"];

export function Filters({ onFiltersChange }: FiltersProps) {
  const { filters, setFilters, clearFilters } = useWardrobeStore();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...(filters || {}) };

    if (value === "all" || value === "") {
      delete newFilters[key as keyof typeof newFilters];
    } else {
      (newFilters as any)[key] = value;
    }

    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    onFiltersChange?.({});
  };

  const hasActiveFilters = filters && Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-auto p-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={filters?.category || "all"}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color Filter */}
        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm font-medium">
            Color
          </Label>
          <Select
            value={filters?.color || "all"}
            onValueChange={(value) => handleFilterChange("color", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All colors</SelectItem>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full border border-gray-300"
                      style={{
                        backgroundColor:
                          color.toLowerCase() === "multicolor"
                            ? "linear-gradient(45deg, red, blue, green, yellow)"
                            : color.toLowerCase(),
                      }}
                    />
                    {color}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Season Filter */}
        <div className="space-y-2">
          <Label htmlFor="season" className="text-sm font-medium">
            Season
          </Label>
          <Select
            value={filters?.season || "all"}
            onValueChange={(value) => handleFilterChange("season", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All seasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All seasons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters &&
                Object.entries(filters).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange(key, "")}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
