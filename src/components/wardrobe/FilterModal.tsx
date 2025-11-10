"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Filter as FilterIcon } from "lucide-react";
import { TreeSelect, Select } from "antd";
import type { DataNode } from "antd/es/tree";
import GlassButton from "@/components/ui/glass-button";
import { Label } from "@/components/ui/label";
import { WardrobeFilters } from "@/types/wardrobe";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: WardrobeFilters;
  onApplyFilters: (filters: WardrobeFilters) => void;
}

interface TreeNodeData extends DataNode {
  value?: number;
  children?: TreeNodeData[];
}

export function FilterModal({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<WardrobeFilters>(filters);
  const [categoryTreeData, setCategoryTreeData] = useState<TreeNodeData[]>([]);
  const [seasons, setSeasons] = useState<{ id: number; name: string }[]>([]);
  const [styles, setStyles] = useState<{ id: number; name: string }[]>([]);
  const [occasions, setOccasions] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lock scroll when modal is open
  useScrollLock(open);

  // Fetch filter options from API
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        setIsLoading(true);
        try {
          const [rootCategories, seasonsData, stylesData, occasionsData] = await Promise.all([
            wardrobeAPI.getRootCategories(),
            wardrobeAPI.getSeasons(),
            wardrobeAPI.getStyles(),
            wardrobeAPI.getOccasions(),
          ]);

          // Build tree structure for categories - load all children for proper display
          const treeDataPromises = rootCategories.map(async (cat) => {
            const children = await wardrobeAPI.getCategoriesByParent(cat.id);
            return {
              key: cat.id,
              value: cat.id,
              title: cat.name,
              isLeaf: children.length === 0,
              children: children.map((child) => ({
                key: child.id,
                value: child.id,
                title: child.name,
                isLeaf: true,
              })),
            };
          });

          const treeData = await Promise.all(treeDataPromises);

          setCategoryTreeData(treeData);
          setSeasons(seasonsData);
          setStyles(stylesData);
          setOccasions(occasionsData);
        } catch (error) {
          console.error("Failed to fetch filter options:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOptions();
    }
  }, [open]);

  // Sync local filters with props when modal opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);


  const handleApply = useCallback(() => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  }, [localFilters, onApplyFilters, onOpenChange]);

  const handleClearAll = useCallback(() => {
    const clearedFilters: WardrobeFilters = {
      q: localFilters.q, // Keep search query
      collectionId: undefined,
      types: undefined,
      seasons: undefined,
      occasions: undefined,
      colors: undefined,
      isAnalyzed: undefined,
      categoryId: undefined,
      seasonId: undefined,
      styleId: undefined,
      occasionId: undefined,
      sortByDate: undefined,
    };
    setLocalFilters(clearedFilters);
  }, [localFilters.q]);

  const hasActiveFilters =
    localFilters.categoryId !== undefined ||
    localFilters.seasonId !== undefined ||
    localFilters.styleId !== undefined ||
    localFilters.occasionId !== undefined;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-[680px] max-w-[95vw] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background - More transparent */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-slate-900/85">
            <div className="absolute top-0 -right-32 w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-cyan-200/15 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    Filter Items
                  </h2>
                  <p className="font-bricolage text-sm text-gray-200 mt-0.5">
                    Refine your wardrobe view
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body - 2 Columns */}
            <div className="flex-1 px-6 py-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Category Filter with TreeSelect */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">
                      Category
                    </Label>
                    <TreeSelect
                      showSearch
                      placeholder="Select a category"
                      value={localFilters.categoryId}
                      onChange={(value) =>
                        setLocalFilters({ ...localFilters, categoryId: value || undefined })
                      }
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      treeData={categoryTreeData as unknown as any[]}
                      allowClear
                      loading={isLoading}
                      size="large"
                      className="w-full"
                      filterTreeNode={(search, item) =>
                        (item.title as string)
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      }
                      dropdownStyle={{
                        maxHeight: 300,
                        overflow: "auto",
                      }}
                    />
                  </div>

                  {/* Season Filter */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">
                      Season
                    </Label>
                    <Select
                      showSearch
                      placeholder="Select a season"
                      value={localFilters.seasonId}
                      onChange={(value) =>
                        setLocalFilters({ ...localFilters, seasonId: value || undefined })
                      }
                      allowClear
                      loading={isLoading}
                      size="large"
                      className="w-full"
                      options={seasons.map((season) => ({
                        value: season.id,
                        label: season.name,
                      }))}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Style Filter */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">
                      Style
                    </Label>
                    <Select
                      showSearch
                      placeholder="Select a style"
                      value={localFilters.styleId}
                      onChange={(value) =>
                        setLocalFilters({ ...localFilters, styleId: value || undefined })
                      }
                      allowClear
                      loading={isLoading}
                      size="large"
                      className="w-full"
                      options={styles.map((style) => ({
                        value: style.id,
                        label: style.name,
                      }))}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>

                  {/* Occasion Filter */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">
                      Occasion
                    </Label>
                    <Select
                      showSearch
                      placeholder="Select an occasion"
                      value={localFilters.occasionId}
                      onChange={(value) =>
                        setLocalFilters({ ...localFilters, occasionId: value || undefined })
                      }
                      allowClear
                      loading={isLoading}
                      size="large"
                      className="w-full"
                      options={occasions.map((occasion) => ({
                        value: occasion.id,
                        label: occasion.name,
                      }))}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-white/10">
              <div className="flex items-center justify-between gap-4">
                <GlassButton
                  variant="ghost"
                  size="md"
                  onClick={handleClearAll}
                  disabled={!hasActiveFilters}
                  className="text-gray-300 text-base"
                >
                  Clear All
                </GlassButton>
                <div className="flex gap-3">
                  <GlassButton
                    variant="outline"
                    size="md"
                    onClick={() => onOpenChange(false)}
                    className="text-base"
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="custom"
                    size="md"
                    onClick={handleApply}
                    backgroundColor="rgba(59, 130, 246, 0.8)"
                    borderColor="rgba(59, 130, 246, 1)"
                    className="min-w-[120px] text-base"
                  >
                    <FilterIcon className="w-4 h-4 mr-2" />
                    Apply Filters
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}
