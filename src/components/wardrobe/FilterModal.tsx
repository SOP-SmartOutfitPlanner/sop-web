"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter as FilterIcon } from "lucide-react";
import { TreeSelect, Select } from "antd";
import type { DataNode } from "antd/es/tree";
import GlassButton from "@/components/ui/glass-button";
import { Label } from "@/components/ui/label";
import { WardrobeFilters } from "@/types/wardrobe";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { ConfirmModal } from "@/components/common/ConfirmModal";

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
              // Allow selection of parent categories for filtering
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
    localFilters.occasionId !== undefined ||
    localFilters.isAnalyzed !== undefined;

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleApply}
      title="Filter Items"
      subtitle="Refine your wardrobe view"
      maxWidth="680px"
      confirmButtonText="Apply Filters"
      confirmButtonIcon={<FilterIcon className="w-4 h-4 mr-2" />}
      confirmButtonColor="rgba(59, 130, 246, 0.8)"
      confirmButtonBorderColor="rgba(59, 130, 246, 1)"
      customFooter={
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
      }
    >
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
              popupMatchSelectWidth={false}
              filterTreeNode={(search, item) =>
                (item.title as string)
                  .toLowerCase()
                  .includes(search.toLowerCase())
              }
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

        {/* AI Analysis Filter - Full width */}
        <div className="col-span-2 space-y-2">
          <Label className="text-white font-semibold text-base">
            AI Analysis Status
          </Label>
          <Select
            placeholder="All items"
            value={localFilters.isAnalyzed}
            onChange={(value) =>
              setLocalFilters({ ...localFilters, isAnalyzed: value })
            }
            allowClear
            size="large"
            className="w-full"
            options={[
              { value: true, label: '✨ AI Analyzed' },
              { value: false, label: 'Not Analyzed' },
            ]}
          />
        </div>
      </div>
    </ConfirmModal>
  );
}
