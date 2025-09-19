"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ITEM_TYPES,
  SEASONS,
  OCCASIONS,
  COLOR_PALETTE,
} from "@/lib/constants/wardrobe";
import type { FilterState, FilterPopoverProps } from "@/types/wardrobe-ui";

export function FilterPopover({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearAll,
}: FilterPopoverProps) {
  const handleFilterChange = (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[category] = [...newFilters[category], value];
    } else {
      newFilters[category] = newFilters[category].filter(
        (item) => item !== value
      );
    }
    onFiltersChange(newFilters);
  };

  const handleColorSelect = (color: string) => {
    const isSelected = filters.colors.includes(color);
    handleFilterChange("colors", color, !isSelected);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter Items</h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={onClearAll}
            >
              Clear all
            </Button>
          </div>

          {/* Type Filters */}
          <div>
            <h5 className="font-medium mb-3">Type</h5>
            <div className="grid grid-cols-2 gap-2">
              {ITEM_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={filters.types.includes(type.value)}
                    onCheckedChange={(checked) =>
                      handleFilterChange(
                        "types",
                        type.value,
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={type.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Season Filters */}
          <div>
            <h5 className="font-medium mb-3">Season</h5>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map((season) => (
                <div key={season.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`season-${season.value}`}
                    checked={filters.seasons.includes(season.value)}
                    onCheckedChange={(checked) =>
                      handleFilterChange(
                        "seasons",
                        season.value,
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={`season-${season.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {season.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Occasion Filters */}
          <div>
            <h5 className="font-medium mb-3">Occasion</h5>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((occasion) => (
                <div
                  key={occasion.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`occasion-${occasion.value}`}
                    checked={filters.occasions.includes(occasion.value)}
                    onCheckedChange={(checked) =>
                      handleFilterChange(
                        "occasions",
                        occasion.value,
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={`occasion-${occasion.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {occasion.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h5 className="font-medium mb-3">Colors</h5>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((colorOption, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(colorOption.color)}
                  className={`w-8 h-8 rounded-full border-2 hover:border-gray-400 transition-colors ${
                    filters.colors.includes(colorOption.color)
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : colorOption.border
                      ? "border-gray-400"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                  aria-label={`Select color ${colorOption.color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
