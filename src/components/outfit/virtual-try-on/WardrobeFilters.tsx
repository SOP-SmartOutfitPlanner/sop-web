"use client";

import { Filter as FilterIcon, Search } from "lucide-react";
import { TreeSelect, Select, Input } from "antd";
import type { DataNode } from "antd/es/tree";
import { Label } from "@/components/ui/label";

interface WardrobeFiltersProps {
  filters: {
    categoryId?: number;
    seasonId?: number;
    styleId?: number;
    occasionId?: number;
    searchQuery?: string;
  };
  showFilters: boolean;
  categoryTreeData: DataNode[];
  seasons: { id: number; name: string }[];
  styles: { id: number; name: string }[];
  occasions: { id: number; name: string }[];
  onFiltersChange: (filters: WardrobeFiltersProps["filters"]) => void;
  onToggleFilters: () => void;
}

export function WardrobeFilters({
  filters,
  showFilters,
  categoryTreeData,
  seasons,
  styles,
  occasions,
  onFiltersChange,
  onToggleFilters,
}: WardrobeFiltersProps) {
  const hasActiveFilters =
    filters.categoryId ||
    filters.seasonId ||
    filters.styleId ||
    filters.occasionId ||
    filters.searchQuery;

  return (
    <div className="space-y-2">
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4A90E2]/20 to-[#5BA3F5]/20 hover:from-[#4A90E2]/30 hover:to-[#5BA3F5]/30 border border-white/20 text-white text-sm font-medium transition-all shadow-lg"
      >
        <FilterIcon className="w-4 h-4" />
        <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
      </button>

      {showFilters && (
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-xl backdrop-blur-sm">
          {/* Search Box */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search by Name
            </Label>
            <Input
              placeholder="Type item name..."
              value={filters.searchQuery || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, searchQuery: e.target.value })
              }
              allowClear
              prefix={<Search className="w-3.5 h-3.5 text-gray-400" />}
              className="w-full"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Filter Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Category</Label>
              <TreeSelect
                placeholder="All Categories"
                treeData={categoryTreeData}
                value={filters.categoryId}
                onChange={(value) =>
                  onFiltersChange({ ...filters, categoryId: value })
                }
                allowClear
                showSearch
                treeNodeFilterProp="title"
                className="w-full"
                style={{ width: "100%" }}
                dropdownStyle={{ zIndex: 10001 }}
                getPopupContainer={() => document.body}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Season</Label>
              <Select
                placeholder="All Seasons"
                value={filters.seasonId}
                onChange={(value) =>
                  onFiltersChange({ ...filters, seasonId: value })
                }
                allowClear
                showSearch
                optionFilterProp="children"
                className="w-full"
                style={{ width: "100%" }}
                dropdownStyle={{ zIndex: 10001 }}
                getPopupContainer={() => document.body}
              >
                {seasons.map((season) => (
                  <Select.Option key={season.id} value={season.id}>
                    {season.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Style</Label>
              <Select
                placeholder="All Styles"
                value={filters.styleId}
                onChange={(value) =>
                  onFiltersChange({ ...filters, styleId: value })
                }
                allowClear
                showSearch
                optionFilterProp="children"
                className="w-full"
                style={{ width: "100%" }}
                dropdownStyle={{ zIndex: 10001 }}
                getPopupContainer={() => document.body}
              >
                {styles.map((style) => (
                  <Select.Option key={style.id} value={style.id}>
                    {style.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Occasion</Label>
              <Select
                placeholder="All Occasions"
                value={filters.occasionId}
                onChange={(value) =>
                  onFiltersChange({ ...filters, occasionId: value })
                }
                allowClear
                showSearch
                optionFilterProp="children"
                className="w-full"
                style={{ width: "100%" }}
                dropdownStyle={{ zIndex: 10001 }}
                getPopupContainer={() => document.body}
              >
                {occasions.map((occasion) => (
                  <Select.Option key={occasion.id} value={occasion.id}>
                    {occasion.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={() => onFiltersChange({})}
              className="w-full px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-medium transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
