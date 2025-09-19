"use client";

import { ChevronDown, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortOption {
  value: string;
  label: string;
  description?: string;
}

interface SortDropdownProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions: SortOption[] = [
  { value: "newest", label: "Newest First", description: "Recently added items" },
  { value: "most-worn", label: "Most Worn", description: "Frequently used items" },
  { value: "least-worn", label: "Least Worn", description: "Rarely used items" },
  { value: "a-z", label: "A → Z", description: "Alphabetical order" },
  { value: "z-a", label: "Z → A", description: "Reverse alphabetical" },
];

export function SortDropdown({ selectedSort, onSortChange }: SortDropdownProps) {
  const selectedOption = sortOptions.find(opt => opt.value === selectedSort) || sortOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[140px]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>{selectedOption.label}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-gray-500">{option.description}</span>
              )}
            </div>
            {selectedSort === option.value && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
