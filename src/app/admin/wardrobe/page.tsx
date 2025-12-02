"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Pagination, Input as AntInput, ConfigProvider, Badge, Tooltip } from "antd";
import { Plus, Filter, SortAsc, SortDesc } from "lucide-react";
import { ItemCard } from "@/components/wardrobe/grids/ItemCard";
import { FilterModal } from "@/components/wardrobe/FilterModal";
import { useAdminWardrobeItems } from "@/hooks/admin/useAdminWardrobe";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import GlassButton from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { WardrobeItem, ColorInfo } from "@/types";
import { WardrobeFilters } from "@/types/wardrobe";

const { Search } = AntInput;

// Dynamic import for heavy wizard component
const AddItemWizard = dynamic(
  () =>
    import("@/components/wardrobe/wizard").then((mod) => ({
      default: mod.AddItemWizard,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading wizard...
        </span>
      </div>
    ),
  }
);

// Dynamic import for edit item dialog
const EditItemDialog = dynamic(
  () =>
    import("@/components/wardrobe/EditItemDialog").then((mod) => ({
      default: mod.EditItemDialog,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

// Dynamic import for view item dialog
const ViewItemDialog = dynamic(
  () =>
    import("@/components/wardrobe/ViewItemDialog").then((mod) => ({
      default: mod.ViewItemDialog,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

// Loading skeleton for cards
const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 space-y-3">
      <div className="bg-white/20 aspect-square rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-white/20 rounded w-3/4" />
        <div className="h-3 bg-white/20 rounded w-1/2" />
      </div>
    </div>
  </div>
);

// Helper function to parse colors from AI analysis JSON or color string
function parseColors(apiItem: ApiWardrobeItem): ColorInfo[] {
  // First, try to parse from aiAnalyzeJson which has hex codes
  if (apiItem.aiAnalyzeJson) {
    try {
      const aiData = JSON.parse(apiItem.aiAnalyzeJson);
      if (aiData.colors && Array.isArray(aiData.colors)) {
        return aiData.colors.map((color: { name: string; hex: string }) => ({
          name: color.name,
          hex: color.hex || "#808080",
        }));
      }
    } catch (e) {
      console.error("Failed to parse aiAnalyzeJson:", e);
    }
  }
  
  // Fallback: parse from color string with color mapping
  if (!apiItem.color) return [];
  
  const colorStrings = apiItem.color.split(",").map((c: string) => c.trim()).filter(Boolean);
  
  // Map common color names to hex codes
  const colorMap: Record<string, string> = {
    // Neutrals
    "white": "#FFFFFF", "black": "#000000", "gray": "#808080", "grey": "#808080",
    "beige": "#F5F5DC", "cream": "#FFFDD0", "ivory": "#FFFFF0",
    // Reds
    "red": "#FF0000", "crimson": "#DC143C", "maroon": "#800000", "burgundy": "#800020",
    // Blues
    "blue": "#0000FF", "navy": "#000080", "teal": "#008080", "cyan": "#00FFFF",
    "sky blue": "#87CEEB", "royal blue": "#4169E1",
    // Greens
    "green": "#008000", "olive": "#808000", "lime": "#00FF00", "forest green": "#228B22",
    "olive green": "#556B2F", "khaki": "#F0E68C",
    // Yellows/Golds
    "yellow": "#FFFF00", "gold": "#FFD700", "ochre": "#CC7722",
    // Oranges
    "orange": "#FFA500", "coral": "#FF7F50", "peach": "#FFDAB9",
    // Purples/Pinks
    "purple": "#800080", "violet": "#EE82EE", "pink": "#FFC0CB", "magenta": "#FF00FF",
    "lavender": "#E6E6FA",
    // Browns
    "brown": "#A52A2A", "tan": "#D2B48C", "chocolate": "#D2691E", "sienna": "#A0522D",
    // Others
    "silver": "#C0C0C0", "bronze": "#CD7F32", "indigo": "#4B0082",
  };
  
  return colorStrings.map((colorName) => {
    const lowerName = colorName.toLowerCase();
    const hex = colorMap[lowerName] || "#808080";
    return { name: colorName, hex };
  });
}

// Helper function to transform API item to WardrobeItem
function apiItemToWardrobeItem(apiItem: ApiWardrobeItem): WardrobeItem {
  // Parse colors with proper hex codes from AI analysis
  const colors = parseColors(apiItem);

  // Map category
  const categoryId = apiItem.categoryId || apiItem.category?.id || 1;
  const categoryName = apiItem.categoryName || apiItem.category?.name || "Uncategorized";

  // Ensure imageUrl is not empty
  const imageUrl = apiItem.imgUrl || "/placeholder-item.png";

  // Get first season if available
  const firstSeason = apiItem.seasons?.[0];
  const seasonName = typeof firstSeason === "string" ? firstSeason : firstSeason?.name;

  return {
    id: apiItem.id?.toString() || String(apiItem.userId),
    userId: apiItem.userId?.toString(),
    name: apiItem.name || "Unnamed Item",
    type: "top",
    imageUrl,
    brand: apiItem.brand,
    description: apiItem.aiDescription,
    colors,
    seasons: apiItem.seasons || [],
    occasions: apiItem.occasions || [],
    status: "active",
    timesWorn: 0,
    frequencyWorn: apiItem.frequencyWorn,
    lastWorn: apiItem.lastWornAt,
    tags: apiItem.tag?.split(",").map((t: string) => t.trim()).filter(Boolean) || [],
    createdAt: apiItem.createdAt || new Date().toISOString(),
    updatedAt: apiItem.updatedAt || new Date().toISOString(),
    aiDescription: apiItem.aiDescription,
    weatherSuitable: apiItem.weatherSuitable,
    condition: apiItem.condition,
    pattern: apiItem.pattern,
    fabric: apiItem.fabric,
    isAnalyzed: apiItem.isAnalyzed,
    aiConfidence: apiItem.aiConfidence,
    styles: apiItem.styles,
    category: { id: categoryId, name: categoryName },
    color: colors[0]?.name,
    season: seasonName?.toLowerCase() as "spring" | "summer" | "fall" | "winter" | undefined,
  };
}

export default function AdminWardrobePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<WardrobeFilters>({
    q: undefined,
    categoryId: undefined,
    seasonId: undefined,
    styleId: undefined,
    occasionId: undefined,
    isAnalyzed: undefined,
    sortByDate: undefined,
  });

  // Modal states
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [isViewItemOpen, setIsViewItemOpen] = useState(false);
  const [viewItemId, setViewItemId] = useState<number | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items using the hook
  const { data, isLoading, isFetching } = useAdminWardrobeItems({
    pageIndex: currentPage,
    pageSize: pageSize,
    searchQuery: debouncedSearch || undefined,
    categoryId: filters.categoryId,
    isAnalyzed: filters.isAnalyzed,
  });

  const items = useMemo(() => data?.data || [], [data?.data]);
  const metaData = data?.metaData;

  // Filter items based on filters
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply client-side filters for season, style, occasion
    if (filters.seasonId) {
      result = result.filter((item) =>
        item.seasons?.some((s) => (typeof s === "object" ? s.id === filters.seasonId : false))
      );
    }

    if (filters.styleId) {
      result = result.filter((item) =>
        item.styles?.some((s) => s.id === filters.styleId)
      );
    }

    if (filters.occasionId) {
      result = result.filter((item) =>
        item.occasions?.some((o) => (typeof o === "object" ? o.id === filters.occasionId : false))
      );
    }

    // Sort by date if specified
    if (filters.sortByDate) {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return filters.sortByDate === "desc" ? dateB - dateA : dateA - dateB;
      });
    }

    return result;
  }, [items, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = metaData?.totalCount || 0;

    return {
      totalItems,
    };
  }, [metaData]);

  // Auto-reset to page 1 if current page returns empty array and we're not on page 1
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      filteredItems.length === 0 &&
      currentPage > 1 &&
      metaData
    ) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetching, filteredItems.length, currentPage, metaData]);

  // Transform API items to WardrobeItem format
  const transformedItems = useMemo(() => {
    return filteredItems.map(apiItemToWardrobeItem);
  }, [filteredItems]);

  // Handlers
  const handleViewItem = useCallback((item: WardrobeItem) => {
    const itemId = parseInt(item.id);
    if (itemId) {
      setViewItemId(itemId);
      setIsViewItemOpen(true);
    }
  }, []);

  const handleEditItem = useCallback((item: WardrobeItem) => {
    const itemId = parseInt(item.id);
    if (itemId) {
      setEditItemId(itemId);
      setIsEditItemOpen(true);
    }
  }, []);

  const handleEditFromView = useCallback(() => {
    if (viewItemId) {
      setIsViewItemOpen(false);
      setTimeout(() => {
        setEditItemId(viewItemId);
        setIsEditItemOpen(true);
      }, 100);
    }
  }, [viewItemId]);

  const handleDeleteItem = useCallback((id: string) => {
    // TODO: Implement delete functionality with confirmation modal
    console.log("Delete item:", id);
  }, []);

  const handleItemUpdated = useCallback(async () => {
    // Refresh items after edit
    setCurrentPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: WardrobeFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.categoryId !== undefined ? 1 : 0,
      filters.seasonId !== undefined ? 1 : 0,
      filters.styleId !== undefined ? 1 : 0,
      filters.occasionId !== undefined ? 1 : 0,
      filters.isAnalyzed !== undefined ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
  }, [filters.categoryId, filters.seasonId, filters.styleId, filters.occasionId, filters.isAnalyzed]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Stats */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl blur-3xl -z-10" />
        
        {/* Header Content */}
        <div className="relative backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-dela-gothic text-3xl md:text-4xl lg:text-5xl leading-tight mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                  Wardrobe System
                </span>
              </h1>
              <p className="text-white/60 text-sm md:text-base">
                Manage all item system
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.totalItems}</div>
                <div className="text-xs text-white/60">Total Items</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{metaData?.analyzedPercentage ?? 0}%</div>
                <div className="text-xs text-white/60">AI Analyzed</div>
              </div>
            </div>
          </div>

          {/* Search Bar and Actions */}
          <div className="flex items-center gap-3">
            <ConfigProvider
              theme={{
                components: {
                  Input: {
                    colorBgContainer: 'rgba(255, 255, 255, 0.95)',
                    colorBorder: 'rgba(255, 255, 255, 0.3)',
                    colorPrimaryHover: '#60a5fa',
                    colorPrimary: '#3b82f6',
                  },
                },
              }}
            >
              <Search
                placeholder="Search by item name, brand, color..."
                allowClear
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(value) => setDebouncedSearch(value)}
                style={{
                  flex: 1,
                  height: '48px',
                }}
              />
            </ConfigProvider>

            {/* Sort Buttons */}
            <Tooltip title="Sort by date (Descending)">
              <div className="glass-button-hover">
                <GlassButton
                  onClick={() => handleFiltersChange({
                    ...filters,
                    sortByDate: filters.sortByDate === "desc" ? undefined : "desc"
                  })}
                  variant="custom"
                  borderRadius="12px"
                  blur="10px"
                  brightness={filters.sortByDate === "desc" ? 1.3 : 1.1}
                  glowColor={filters.sortByDate === "desc" ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.2)"}
                  glowIntensity={filters.sortByDate === "desc" ? 8 : 4}
                  borderColor={filters.sortByDate === "desc" ? "rgba(59,130,246,0.8)" : "rgba(255,255,255,0.2)"}
                  borderWidth={filters.sortByDate === "desc" ? "2px" : "1px"}
                  backgroundColor={filters.sortByDate === "desc" ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.05)"}
                  textColor="#ffffff"
                  className="px-3 h-12"
                  displacementScale={5}
                >
                  <SortDesc className="h-4 w-4" />
                </GlassButton>
              </div>
            </Tooltip>

            <Tooltip title="Sort by date (Ascending)">
              <div className="glass-button-hover">
                <GlassButton
                  onClick={() => handleFiltersChange({
                    ...filters,
                    sortByDate: filters.sortByDate === "asc" ? undefined : "asc"
                  })}
                  variant="custom"
                  borderRadius="12px"
                  blur="10px"
                  brightness={filters.sortByDate === "asc" ? 1.3 : 1.1}
                  glowColor={filters.sortByDate === "asc" ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.2)"}
                  glowIntensity={filters.sortByDate === "asc" ? 8 : 4}
                  borderColor={filters.sortByDate === "asc" ? "rgba(59,130,246,0.8)" : "rgba(255,255,255,0.2)"}
                  borderWidth={filters.sortByDate === "asc" ? "2px" : "1px"}
                  backgroundColor={filters.sortByDate === "asc" ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.05)"}
                  textColor="#ffffff"
                  className="px-3 h-12"
                  displacementScale={5}
                >
                  <SortAsc className="h-4 w-4" />
                </GlassButton>
              </div>
            </Tooltip>

            {/* Filter Button */}
            <div className="glass-button-hover">
              <GlassButton
                onClick={() => setIsFilterModalOpen(true)}
                variant="custom"
                borderRadius="12px"
                blur="10px"
                brightness={1.1}
                glowColor={activeFiltersCount > 0 ? "rgba(147, 51, 234, 0.5)" : "rgba(255,255,255,0.2)"}
                glowIntensity={activeFiltersCount > 0 ? 6 : 4}
                borderColor={activeFiltersCount > 0 ? "rgba(147, 51, 234, 0.6)" : "rgba(255,255,255,0.2)"}
                borderWidth="1px"
                backgroundColor={activeFiltersCount > 0 ? "rgba(147, 51, 234, 0.3)" : "rgba(255,255,255,0.05)"}
                textColor="#ffffff"
                className="px-4 h-12 relative"
                displacementScale={5}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge
                    count={activeFiltersCount}
                    className="ml-2"
                    style={{ backgroundColor: '#9333ea' }}
                  />
                )}
              </GlassButton>
            </div>

            {/* Add Item Button */}
            <div className="glass-button-hover">
              <GlassButton
                onClick={() => setIsAddItemOpen(true)}
                variant="custom"
                borderRadius="12px"
                blur="10px"
                brightness={1.2}
                glowColor="rgba(34, 211, 238, 0.5)"
                glowIntensity={8}
                borderColor="rgba(34, 211, 238, 0.6)"
                borderWidth="2px"
                backgroundColor="rgba(34, 211, 238, 0.2)"
                textColor="#ffffff"
                className="px-5 h-12 font-semibold"
                displacementScale={5}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .glass-button-hover {
          transition: transform 0.2s ease;
        }
        .glass-button-hover:hover {
          transform: scale(1.04);
        }
        .glass-button-hover:active {
          transform: scale(0.98);
        }
        
        .custom-admin-pagination .ant-pagination-item {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(10px);
        }
        
        .custom-admin-pagination .ant-pagination-item a {
          color: #ffffff !important;
        }
        
        .custom-admin-pagination .ant-pagination-item-active {
          background: rgba(59, 130, 246, 0.8) !important;
          border-color: rgba(59, 130, 246, 1) !important;
        }
        
        .custom-admin-pagination .ant-pagination-item:hover {
          background: rgba(59, 130, 246, 0.6) !important;
          border-color: rgba(59, 130, 246, 0.8) !important;
        }
        
        .custom-admin-pagination .ant-pagination-prev button,
        .custom-admin-pagination .ant-pagination-next button {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(10px);
        }
        
        .custom-admin-pagination .ant-pagination-prev:hover button,
        .custom-admin-pagination .ant-pagination-next:hover button {
          background: rgba(59, 130, 246, 0.6) !important;
          border-color: rgba(59, 130, 246, 0.8) !important;
        }
        
        .custom-admin-pagination .ant-pagination-options {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px);
        }
        
        .custom-admin-pagination .ant-select-selector {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        )}>
          {Array.from({ length: 24 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isFetching && transformedItems.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
          <div className="text-white/60 text-lg font-medium">No items found</div>
          <p className="text-white/40 mt-2">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !isFetching && transformedItems.length > 0 && (
        <>
          <div className={cn(
            "grid gap-6",
            "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          )}>
            {transformedItems.map((item: WardrobeItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                className="h-full"
              >
                <ItemCard
                  item={item}
                  onView={handleViewItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  showCheckbox={false}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {metaData && metaData.totalCount > 0 && (
            <div className="flex justify-center pt-8">
              <ConfigProvider
                theme={{
                  components: {
                    Pagination: {
                      itemActiveBg: 'rgba(59, 130, 246, 0.8)',
                      itemBg: 'rgba(255, 255, 255, 0.1)',
                      itemLinkBg: 'rgba(255, 255, 255, 0.1)',
                      colorPrimary: '#3b82f6',
                      colorPrimaryHover: '#60a5fa',
                      colorText: '#ffffff',
                      colorTextDisabled: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                }}
              >
                <Pagination
                  current={currentPage}
                  total={metaData.totalCount}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={(_, size) => {
                    handlePageSizeChange(size);
                  }}
                  showSizeChanger
                  pageSizeOptions={["12", "24", "36", "48", "60"]}
                  showTotal={(total, range) => (
                    <span className="text-white/80">
                      {range[0]}-{range[1]} of {total} items
                    </span>
                  )}
                  className="custom-admin-pagination"
                />
              </ConfigProvider>
            </div>
          )}
        </>
      )}

      {/* Filter Modal */}
      <FilterModal
        open={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filters={filters}
        onApplyFilters={handleFiltersChange}
      />

      {/* View Item Dialog */}
      {isViewItemOpen && viewItemId && (
        <ViewItemDialog
          open={isViewItemOpen}
          onOpenChange={setIsViewItemOpen}
          itemId={viewItemId}
          onEdit={handleEditFromView}
        />
      )}

      {/* Edit Item Dialog */}
      {isEditItemOpen && editItemId && (
        <EditItemDialog
          open={isEditItemOpen}
          onOpenChange={setIsEditItemOpen}
          itemId={editItemId}
          onItemUpdated={handleItemUpdated}
        />
      )}
      
      {/* Add Item Wizard */}
      {isAddItemOpen && (
        <AddItemWizard
          open={isAddItemOpen}
          onOpenChange={(open) => {
            setIsAddItemOpen(open);
            if (!open) {
              handleItemUpdated();
            }
          }}
        />
      )}
    </div>
  );
}
