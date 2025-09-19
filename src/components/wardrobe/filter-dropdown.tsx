"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWardrobeStore } from "@/store/wardrobe-store";

interface FilterOption {
  value: string;
  label: string;
  count: number;
  color?: string;
}

interface FilterDropdownProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterDropdown({ selectedFilter, onFilterChange }: FilterDropdownProps) {
  const { items } = useWardrobeStore();

  // Calculate filter options with counts
  const getFilterOptions = (): FilterOption[] => {
    const allCount = items.length;
    
    // Count by occasions
    const occasionCounts = items.reduce((acc, item) => {
      item.occasions?.forEach(occasion => {
        acc[occasion] = (acc[occasion] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Count by seasons  
    const seasonCounts = items.reduce((acc, item) => {
      item.seasons?.forEach(season => {
        acc[season] = (acc[season] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const options: FilterOption[] = [
      { value: "all", label: "All Items", count: allCount },
    ];

    // Add occasion filters
    Object.entries(occasionCounts).forEach(([occasion, count]) => {
      options.push({
        value: occasion,
        label: occasion.charAt(0).toUpperCase() + occasion.slice(1),
        count,
        color: getOccasionColor(occasion),
      });
    });

    // Add season filters
    Object.entries(seasonCounts).forEach(([season, count]) => {
      options.push({
        value: season,
        label: season.charAt(0).toUpperCase() + season.slice(1),
        count,
        color: getSeasonColor(season),
      });
    });

    return options.sort((a, b) => {
      if (a.value === "all") return -1;
      if (b.value === "all") return 1;
      return b.count - a.count;
    });
  };

  const getOccasionColor = (occasion: string): string => {
    const colors: Record<string, string> = {
      casual: "#3B82F6", // blue
      work: "#8B5CF6",   // purple  
      formal: "#1F2937", // black
      sport: "#10B981",  // green
    };
    return colors[occasion] || "#6B7280";
  };

  const getSeasonColor = (season: string): string => {
    const colors: Record<string, string> = {
      summer: "#F59E0B", // yellow
      winter: "#06B6D4", // cyan
      spring: "#10B981", // green
      fall: "#EF4444",   // red
    };
    return colors[season] || "#6B7280";
  };

  const filterOptions = getFilterOptions();
  const selectedOption = filterOptions.find(opt => opt.value === selectedFilter) || filterOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[140px]">
          <div className="flex items-center gap-2">
            {selectedOption.color && (
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <span>{selectedOption.label}</span>
            <span className="ml-1 text-sm text-gray-500">{selectedOption.count}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {filterOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {option.color && (
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span>{option.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{option.count}</span>
              {selectedFilter === option.value && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
