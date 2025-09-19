"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdvancedFilters {
  types: string[];
  seasons: string[];
  occasions: string[];
  colors: string[];
}

interface AdvancedFilterModalProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
}

const typeOptions = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "outer", label: "Outerwear" },
  { value: "accessory", label: "Accessories" },
];

const seasonOptions = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

const occasionOptions = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "sport", label: "Sport" },
  { value: "travel", label: "Travel" },
];

const colorOptions = [
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "black", label: "Black", hex: "#000000" },
  { value: "navy", label: "Navy", hex: "#1E3A8A" },
  { value: "beige", label: "Beige", hex: "#F5F5DC" },
  { value: "brown", label: "Brown", hex: "#8B4513" },
  { value: "gray", label: "Gray", hex: "#6B7280" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "green", label: "Green", hex: "#10B981" },
];

export function AdvancedFilterModal({ filters, onFiltersChange, onClearFilters }: AdvancedFilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const handleFilterToggle = (category: keyof AdvancedFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    const emptyFilters: AdvancedFilters = {
      types: [],
      seasons: [],
      occasions: [],
      colors: [],
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
  const activeCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Items
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500"
            >
              Clear all
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type</Label>
            <div className="space-y-2">
              {typeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={localFilters.types.includes(option.value)}
                    onCheckedChange={() => handleFilterToggle('types', option.value)}
                  />
                  <Label
                    htmlFor={`type-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Season Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Season</Label>
            <div className="space-y-2">
              {seasonOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`season-${option.value}`}
                    checked={localFilters.seasons.includes(option.value)}
                    onCheckedChange={() => handleFilterToggle('seasons', option.value)}
                  />
                  <Label
                    htmlFor={`season-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Occasion</Label>
            <div className="space-y-2">
              {occasionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`occasion-${option.value}`}
                    checked={localFilters.occasions.includes(option.value)}
                    onCheckedChange={() => handleFilterToggle('occasions', option.value)}
                  />
                  <Label
                    htmlFor={`occasion-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Colors</Label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${option.value}`}
                    checked={localFilters.colors.includes(option.value)}
                    onCheckedChange={() => handleFilterToggle('colors', option.value)}
                  />
                  <Label
                    htmlFor={`color-${option.value}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: option.hex }}
                    />
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
