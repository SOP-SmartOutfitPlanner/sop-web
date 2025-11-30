"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
} from "lucide-react";
import { TreeSelect } from "antd";
import type { DataNode } from "antd/es/tree";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { useQuery } from "@tanstack/react-query";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";
import { toast } from "sonner";
import Image from "next/image";
import GlassButton from "@/components/ui/glass-button";

interface TreeNodeData extends DataNode {
  value?: number;
  children?: TreeNodeData[];
}

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemIds: number[]) => void;
  selectedItemIds: number[];
  maxSelection: number;
  excludeItemIds?: number[];
  preSelectedCategoryId?: number;
  title?: string;
  description?: string;
}

const ITEMS_PER_PAGE = 20;

export function ItemSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedItemIds,
  maxSelection,
  excludeItemIds = [],
  preSelectedCategoryId,
  title = "Select Items",
  description,
}: ItemSelectorModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    preSelectedCategoryId
  );
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
  const [categoryTreeData, setCategoryTreeData] = useState<TreeNodeData[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // Sync with parent when modal opens and reset filters
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedItemIds);
      setSelectedCategory(preSelectedCategoryId);
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [isOpen, selectedItemIds, preSelectedCategoryId]);

  // Fetch categories for filter dropdown (same as FilterModal)
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setIsCategoriesLoading(true);
        try {
          const rootCategories = await wardrobeAPI.getRootCategories();

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
        } catch (error) {
          console.error("Failed to fetch categories:", error);
        } finally {
          setIsCategoriesLoading(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  // Fetch wardrobe items
  const { data, isLoading } = useQuery({
    queryKey: [
      "wardrobe",
      "selector",
      currentPage,
      selectedCategory,
      searchQuery,
    ],
    queryFn: () =>
      wardrobeAPI.getItems(currentPage, ITEMS_PER_PAGE, {
        categoryId: selectedCategory,
        searchQuery: searchQuery || undefined,
      }),
    enabled: isOpen,
    staleTime: 2 * 60 * 1000,
  });

  const items =
    data?.data?.filter((item) => !excludeItemIds.includes(item.id || 0)) || [];
  const totalPages = data?.metaData?.totalPages || 1;
  const totalCount = data?.metaData?.totalCount || 0;

  const handleItemToggle = useCallback(
    (itemId: number) => {
      setLocalSelectedIds((prev) => {
        if (prev.includes(itemId)) {
          return prev.filter((id) => id !== itemId);
        } else if (prev.length < maxSelection) {
          return [...prev, itemId];
        } else {
          toast.warning(`You can select up to ${maxSelection} items only`);
          return prev;
        }
      });
    },
    [maxSelection]
  );

  const handleConfirm = useCallback(() => {
    onSelect(localSelectedIds);
  }, [localSelectedIds, onSelect]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] p-0 gap-0 backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-cyan-400/10 flex-shrink-0">
          <DialogTitle className="text-2xl font-bricolage font-bold text-white">
            {title}
          </DialogTitle>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-white/60">
              {description ||
                `Select up to ${maxSelection} items from your wardrobe`}
            </p>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
              <span className="text-cyan-400 font-bold text-sm">
                {localSelectedIds.length}
              </span>
              <span className="text-white/40 text-sm">/</span>
              <span className="text-white/60 text-sm">{maxSelection}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Search Bar and Category Filter */}
        <div className="px-6 py-4 border-b border-cyan-400/10 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="sm:w-[220px]">
              <TreeSelect
                showSearch
                placeholder="All Categories"
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value || undefined);
                  setCurrentPage(1);
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                treeData={categoryTreeData as unknown as any[]}
                allowClear
                loading={isCategoriesLoading}
                size="large"
                className="w-full item-selector-tree-select"
                popupMatchSelectWidth={false}
                popupClassName="item-selector-tree-dropdown"
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                filterTreeNode={(search, item) =>
                  (item.title as string)
                    .toLowerCase()
                    .includes(search.toLowerCase())
                }
              />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-cyan-400"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-lg font-bricolage font-bold text-white mb-2">
                No items found
              </h3>
              <p className="text-sm text-white/60">
                {searchQuery || selectedCategory
                  ? "Try adjusting your filters"
                  : "Add items to your wardrobe to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => {
                const itemId = item.id || 0;
                const isSelected = localSelectedIds.includes(itemId);
                const CategoryIcon = getCategoryIcon(item.categoryId || 1);
                const categoryColor = getCategoryColor(item.categoryId || 1);

                return (
                  <button
                    key={itemId}
                    onClick={() => handleItemToggle(itemId)}
                    className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30 scale-[1.02]"
                        : "ring-1 ring-white/10 hover:ring-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02]"
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-square relative bg-white/5 overflow-hidden">
                      <Image
                        src={item.imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {/* Hover overlay */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          isSelected
                            ? "bg-cyan-500/10"
                            : "bg-transparent group-hover:bg-cyan-500/5"
                        }`}
                      />
                    </div>

                    {/* Category Badge */}
                    <div
                      className={`absolute top-2 left-2 flex items-center gap-1.5 ${categoryColor} text-white rounded-lg px-2 py-1 text-xs font-medium`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* Selection Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Item Name */}
                    <div className="p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs text-white truncate font-medium">
                        {item.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Pagination and Actions */}
        <div className="flex-shrink-0 border-t border-cyan-400/10 bg-gradient-to-t from-cyan-950/40 to-transparent">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-cyan-400/10">
              <p className="text-sm text-white/60">
                Page {currentPage} of {totalPages} ({totalCount} items)
              </p>
              <div className="flex gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 px-6 py-4">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={localSelectedIds.length === 0}
              className="flex-1"
            >
              Confirm Selection ({localSelectedIds.length})
            </GlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
