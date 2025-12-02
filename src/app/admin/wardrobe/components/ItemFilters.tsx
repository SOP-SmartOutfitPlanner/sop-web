"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ItemFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterAnalyzed: string;
  onAnalyzedChange: (value: string) => void;
  categories?: Array<{ id: number; name: string }>;
}

export function ItemFilters({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterAnalyzed,
  onAnalyzedChange,
  categories = [],
}: ItemFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
        <Input
          placeholder="Search by item name, brand, color..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50"
        />
      </div>

      {/* Category Filter */}
      <Select value={filterCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
          <SelectItem value="all" className="text-white hover:bg-white/10">
            All Categories
          </SelectItem>
          {categories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id.toString()}
              className="text-white hover:bg-white/10"
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AI Analyzed Filter */}
      <Select value={filterAnalyzed} onValueChange={onAnalyzedChange}>
        <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="All Items" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
          <SelectItem value="all" className="text-white hover:bg-white/10">
            All Items
          </SelectItem>
          <SelectItem value="analyzed" className="text-white hover:bg-white/10">
            AI Analyzed
          </SelectItem>
          <SelectItem
            value="notAnalyzed"
            className="text-white hover:bg-white/10"
          >
            Not Analyzed
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
