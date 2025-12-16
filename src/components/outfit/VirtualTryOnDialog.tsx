"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { X, Sparkles, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Image } from "antd";
import type { DataNode } from "antd/es/tree";
import NextImage from "next/image";
import GlassButton from "@/components/ui/glass-button";
import { wardrobeAPI, ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { communityAPI } from "@/lib/api/community-api";
import { Outfit } from "@/types/outfit";
import { outfitAPI } from "@/lib/api/outfit-api";
import { toast } from "sonner";
import { VirtualTryOnResultDialog } from "./VirtualTryOnResultDialog";
import {
  HumanImageUpload,
  SelectedItemsPreview,
  ViewToggle,
  WardrobeFilters,
  OutfitFilters,
  OutfitSelectionGrid,
  ItemSelectionGrid,
} from "./virtual-try-on";

interface VirtualTryOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (resultUrl: string) => void;
}

interface WardrobeFilters {
  categoryId?: number;
  seasonId?: number;
  styleId?: number;
  occasionId?: number;
  searchQuery?: string;
  isSaved?: boolean;
}

interface OutfitFilters {
  search?: string;
  isFavorite?: boolean;
  isSaved?: boolean;
}

export function VirtualTryOnDialog({
  open,
  onOpenChange,
  onSuccess,
}: VirtualTryOnDialogProps) {
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [humanImagePreview, setHumanImagePreview] = useState<string>("");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<"wardrobe" | "outfit">("outfit");

  // Wardrobe states
  const [wardrobeItems, setWardrobeItems] = useState<ApiWardrobeItem[]>([]);
  const [isLoadingWardrobeItems, setIsLoadingWardrobeItems] = useState(false);
  const [wardrobeFilters, setWardrobeFilters] = useState<WardrobeFilters>({});
  const [showWardrobeFilters, setShowWardrobeFilters] = useState(false);
  const [wardrobeCurrentPage, setWardrobeCurrentPage] = useState(1);
  const [hasMoreWardrobeItems, setHasMoreWardrobeItems] = useState(true);
  const [totalWardrobeItems, setTotalWardrobeItems] = useState(0);
  const wardrobePageSize = 50;

  // Outfit states
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false);
  const [outfitFilters, setOutfitFilters] = useState<OutfitFilters>({});
  const [outfitCurrentPage, setOutfitCurrentPage] = useState(1);
  const [hasMoreOutfits, setHasMoreOutfits] = useState(true);
  const [totalOutfits, setTotalOutfits] = useState(0);
  const [selectedOutfitId, setSelectedOutfitId] = useState<number | null>(null);
  const outfitPageSize = 12;

  // Result modal states
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Filter options
  const [categoryTreeData, setCategoryTreeData] = useState<DataNode[]>([]);
  const [seasons, setSeasons] = useState<{ id: number; name: string }[]>([]);
  const [styles, setStyles] = useState<{ id: number; name: string }[]>([]);
  const [occasions, setOccasions] = useState<{ id: number; name: string }[]>(
    []
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch filter options for wardrobe
  useEffect(() => {
    if (open && view === "wardrobe") {
      const fetchOptions = async () => {
        try {
          const [rootCategories, seasonsData, stylesData, occasionsData] =
            await Promise.all([
              wardrobeAPI.getRootCategories(),
              wardrobeAPI.getSeasons(),
              wardrobeAPI.getStyles(),
              wardrobeAPI.getOccasions(),
            ]);

          const treeDataPromises = rootCategories.map(async (cat) => {
            const children = await wardrobeAPI.getCategoriesByParent(cat.id);
            return {
              key: cat.id,
              value: cat.id,
              title: cat.name,
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
        }
      };
      fetchOptions();
    }
  }, [open, view]);

  // Fetch wardrobe items with filters and pagination
  useEffect(() => {
    if (open && view === "wardrobe") {
      const fetchWardrobeItems = async () => {
        setIsLoadingWardrobeItems(true);
        try {
          let items: ApiWardrobeItem[] = [];
          let total = 0;
          let hasNext = false;

          if (wardrobeFilters.isSaved) {
            const response = await communityAPI.getSavedItemsPaginated(
              wardrobeCurrentPage,
              wardrobePageSize,
              {
                categoryId: wardrobeFilters.categoryId,
                seasonId: wardrobeFilters.seasonId,
                styleId: wardrobeFilters.styleId,
                occasionId: wardrobeFilters.occasionId,
                search: wardrobeFilters.searchQuery,
              }
            );

            items = response.data.data.map((savedItem) => {
              const item = savedItem.item;
              return {
                id: item.id,
                userId: item.userId,
                name: item.name,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                color: item.color,
                brand: item.brand || undefined,
                imgUrl: item.imgUrl,
                aiDescription: item.aiDescription || "",
                weatherSuitable: item.weatherSuitable,
                condition: item.condition,
                pattern: item.pattern,
                fabric: item.fabric,
                isAnalyzed: item.isAnalyzed,
                aiConfidence: item.aiConfidence,
                usageCount: item.usageCount,
                lastWornAt: item.lastWornAt,
                itemType: item.itemType,
                occasions: item.occasions,
                seasons: item.seasons,
                styles: item.styles,
              } as ApiWardrobeItem;
            });
            total = response.data.metaData.totalCount;
            hasNext = response.data.metaData.hasNext;
          } else {
            const response = await wardrobeAPI.getItems(
              wardrobeCurrentPage,
              wardrobePageSize,
              {
                categoryId: wardrobeFilters.categoryId,
                seasonId: wardrobeFilters.seasonId,
                styleId: wardrobeFilters.styleId,
                occasionId: wardrobeFilters.occasionId,
                searchQuery: wardrobeFilters.searchQuery,
              }
            );
            items = response.data || [];
            total = response.metaData?.totalCount || 0;
            hasNext = response.metaData?.hasNext || false;
          }

          if (wardrobeCurrentPage === 1) {
            setWardrobeItems(items);
          } else {
            setWardrobeItems((prev) => [...prev, ...items]);
          }

          setTotalWardrobeItems(total);
          setHasMoreWardrobeItems(hasNext);
        } catch (error) {
          console.error("Failed to fetch wardrobe items:", error);
          toast.error("Failed to load wardrobe items");
        } finally {
          setIsLoadingWardrobeItems(false);
        }
      };
      fetchWardrobeItems();
    }
  }, [open, view, wardrobeFilters, wardrobeCurrentPage, wardrobePageSize]);

  // Fetch user outfits with filters and pagination
  useEffect(() => {
    if (open && view === "outfit") {
      const fetchOutfits = async () => {
        setIsLoadingOutfits(true);
        try {
          let items: Outfit[] = [];
          let total = 0;
          let hasNext = false;

          if (outfitFilters.isSaved) {
            const response = await outfitAPI.getSavedOutfits({
              pageIndex: outfitCurrentPage,
              pageSize: outfitPageSize,
              search: outfitFilters.search,
            });

            items = response.data.data.map((saved) => ({
              id: saved.outfitId,
              userId: saved.sourceOwnerId || 0,
              userDisplayName: saved.sourceOwnerDisplayName || "Unknown",
              name: saved.outfitName || "Untitled Outfit",
              description: saved.outfitDescription || "",
              isFavorite: false,
              isSaved: true,
              createdDate: saved.savedDate,
              updatedDate: null,
              items: saved.items.map((item) => ({
                id: item.itemId, // Using itemId as id since we don't have link id
                itemId: item.itemId,
                name: item.name,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                color: item.color,
                brand: item.brand,
                frequencyWorn: item.frequencyWorn,
                lastWornAt: item.lastWornAt || "",
                imgUrl: item.imgUrl,
                weatherSuitable: item.weatherSuitable,
                condition: item.condition,
                pattern: item.pattern,
                fabric: item.fabric,
              })),
            }));
            total = response.data.metaData.totalCount;
            hasNext = response.data.metaData.hasNext;
          } else {
            const response = await outfitAPI.getOutfits({
              pageIndex: outfitCurrentPage,
              pageSize: outfitPageSize,
              takeAll: false,
              search: outfitFilters.search,
              isFavorite: outfitFilters.isFavorite,
              isSaved: outfitFilters.isSaved,
            });

            items = response.data?.data || [];
            total = response.data?.metaData?.totalCount || 0;
            hasNext = response.data?.metaData?.hasNext || false;
          }

          if (outfitCurrentPage === 1) {
            setOutfits(items);
          } else {
            setOutfits((prev) => [...prev, ...items]);
          }

          setTotalOutfits(total);
          setHasMoreOutfits(hasNext);
        } catch (error) {
          console.error("Failed to fetch outfits:", error);
          toast.error("Failed to load outfits");
        } finally {
          setIsLoadingOutfits(false);
        }
      };
      fetchOutfits();
    }
  }, [open, view, outfitFilters, outfitCurrentPage, outfitPageSize]);

  // Reset wardrobe pagination when filters change
  useEffect(() => {
    if (view === "wardrobe") {
      setWardrobeCurrentPage(1);
      setWardrobeItems([]);
    }
  }, [wardrobeFilters, view]);

  // Reset outfit pagination when filters change
  useEffect(() => {
    if (view === "outfit") {
      setOutfitCurrentPage(1);
      setOutfits([]);
    }
  }, [outfitFilters, view]);

  // Intersection Observer for infinite scroll (wardrobe)
  useEffect(() => {
    if (
      !loadMoreRef.current ||
      view !== "wardrobe" ||
      !hasMoreWardrobeItems ||
      isLoadingWardrobeItems
    ) {
      return;
    }

    const currentRef = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreWardrobeItems &&
          !isLoadingWardrobeItems
        ) {
          setWardrobeCurrentPage((prev) => prev + 1);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [view, hasMoreWardrobeItems, isLoadingWardrobeItems]);

  // Intersection Observer for infinite scroll (outfits)
  useEffect(() => {
    if (
      !loadMoreRef.current ||
      view !== "outfit" ||
      !hasMoreOutfits ||
      isLoadingOutfits
    ) {
      return;
    }

    const currentRef = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreOutfits && !isLoadingOutfits) {
          setOutfitCurrentPage((prev) => prev + 1);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [view, hasMoreOutfits, isLoadingOutfits]);

  // Get items from selected outfit or wardrobe (with deduplication)
  const availableItems = useMemo(() => {
    let items: ApiWardrobeItem[];

    if (view === "outfit" && selectedOutfitId) {
      const selectedOutfit = outfits.find((o) => o.id === selectedOutfitId);
      if (selectedOutfit?.items) {
        // Transform outfit items to ApiWardrobeItem format
        items = selectedOutfit.items.map((item) => ({
          userId: selectedOutfit.userId,
          userDisplayName: selectedOutfit.userDisplayName,
          name: item.name,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          color: item.color,
          aiDescription: "",
          brand: item.brand || undefined,
          frequencyWorn: item.frequencyWorn
            ? Number(item.frequencyWorn)
            : undefined,
          lastWornAt: item.lastWornAt || undefined,
          imgUrl: item.imgUrl,
          weatherSuitable: item.weatherSuitable,
          condition: item.condition,
          pattern: item.pattern,
          fabric: item.fabric,
          id: item.itemId,
        })) as ApiWardrobeItem[];
      } else {
        items = [];
      }
    } else {
      items = wardrobeItems;
    }

    // Deduplicate by ID to prevent React key warnings
    const seenIds = new Set<number>();
    return items.filter((item) => {
      if (!item.id) return true;
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  }, [view, selectedOutfitId, outfits, wardrobeItems]);

  // Handle human image upload
  const handleHumanImageChange = useCallback(
    (file: File | null, preview: string) => {
      setHumanImage(file);
      setHumanImagePreview(preview);
    },
    []
  );

  // Toggle item selection
  const handleToggleItem = useCallback((itemId: number) => {
    setSelectedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }

      if (prev.length >= 5) {
        toast.warning("You can select maximum 5 items");
        return prev;
      }

      return [...prev, itemId];
    });
  }, []);

  // Handle outfit selection - auto select all items from outfit
  const handleSelectOutfit = useCallback(
    (outfitId: number | null) => {
      setSelectedOutfitId(outfitId);

      if (outfitId === null) {
        setSelectedItemIds([]);
        return;
      }

      // Get items from selected outfit
      const selectedOutfit = outfits.find((o) => o.id === outfitId);
      if (selectedOutfit?.items) {
        const itemIds = selectedOutfit.items
          .map((item) => item.itemId)
          .filter((id): id is number => id !== undefined);

        if (itemIds.length > 5) {
          toast.warning(
            `This outfit has ${itemIds.length} items. Please remove ${
              itemIds.length - 5
            } item(s) to continue (max 5 items).`
          );
        }

        setSelectedItemIds(itemIds);
      }
    },
    [outfits]
  );

  // Get selected items details
  const selectedItems = useMemo(() => {
    return availableItems.filter(
      (item) => item.id && selectedItemIds.includes(item.id)
    );
  }, [availableItems, selectedItemIds]);

  // Handle close dialog (defined before handleGenerate to avoid initialization order issues)
  const handleClose = useCallback(() => {
    if (!isProcessing) {
      setHumanImage(null);
      setHumanImagePreview("");
      setSelectedItemIds([]);
      setView("outfit");
      setResultUrl(null);
      setShowResultModal(false);
      onOpenChange(false);
    }
  }, [isProcessing, onOpenChange]);

  // Handle regenerate - call API again with same data
  const handleRegenerate = useCallback(async () => {
    if (!humanImage || selectedItemIds.length === 0) {
      toast.error("Cannot regenerate without image and items");
      return;
    }

    // Reset result and start processing
    setResultUrl(null);
    setIsProcessing(true);

    try {
      // Get image URLs from selected items
      const itemUrls = selectedItems
        .map((item) => item.imgUrl)
        .filter((url): url is string => !!url);

      if (itemUrls.length === 0) {
        throw new Error("No valid item images found");
      }

      console.log("🔄 Regenerating virtual try-on...");
      console.log("Human image:", humanImage.name);
      console.log("Item URLs:", itemUrls);

      // Call virtual try-on API
      const response = await outfitAPI.virtualTryOn(humanImage, itemUrls);

      console.log("✅ Regeneration response:", response);

      if (response.statusCode === 200 && response.data?.url) {
        setResultUrl(response.data.url);
        toast.success(
          response.message || "Virtual try-on regenerated successfully!"
        );

        if (onSuccess) {
          onSuccess(response.data.url);
        }
      } else {
        throw new Error(response.message || "Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Regeneration error:", error);
      toast.error("Failed to regenerate. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [humanImage, selectedItemIds, selectedItems, onSuccess]);

  // Handle generate try-on
  const handleGenerate = useCallback(async () => {
    if (!humanImage) {
      toast.error("Please upload your photo");
      return;
    }

    if (selectedItemIds.length === 0) {
      toast.error("Please select at least 1 item");
      return;
    }

    if (selectedItemIds.length > 5) {
      toast.error(
        `You have ${selectedItemIds.length} items selected. Please remove ${
          selectedItemIds.length - 5
        } item(s) (max 5 items)`
      );
      return;
    }

    // Open result modal first, then close selection dialog
    setResultUrl(null);
    setIsProcessing(true);
    setShowResultModal(true);

    // Small delay to ensure result modal is mounted before closing selection
    setTimeout(() => {
      onOpenChange(false);
    }, 50);

    try {
      // Get image URLs from selected items
      const itemUrls = selectedItems
        .map((item) => item.imgUrl)
        .filter((url): url is string => !!url);

      if (itemUrls.length === 0) {
        throw new Error("No valid item images found");
      }

      console.log("🚀 Starting virtual try-on...");
      console.log("Human image:", humanImage.name, humanImage.size, "bytes");
      console.log("Item URLs:", itemUrls);

      // Call virtual try-on API
      const response = await outfitAPI.virtualTryOn(humanImage, itemUrls);

      console.log("✅ Virtual try-on response:", response);

      if (response.statusCode === 200 && response.data?.url) {
        setResultUrl(response.data.url);
        toast.success(
          response.message || "Virtual try-on generated successfully!"
        );

        // Call success callback with result URL
        if (onSuccess) {
          onSuccess(response.data.url);
        }
      } else {
        throw new Error(response.message || "Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Virtual try-on error:", error);
      toast.error("Failed to generate virtual try-on. Please try again.");
      setShowResultModal(false);
      onOpenChange(true); // Reopen selection dialog on error
    } finally {
      setIsProcessing(false);
    }
  }, [humanImage, selectedItemIds, selectedItems, onSuccess, onOpenChange]);

  // Lock body scroll ONLY for selection dialog (result modal handles its own lock)
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Prevent scrollbar shift
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        // Restore scroll position when modal closes
        const scrollTop = Math.abs(parseInt(document.body.style.top || "0"));
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, scrollTop);
      };
    }
  }, [open]);

  // Prevent all scroll events from propagating to background
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      {/* Selection Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ overflow: "hidden", touchAction: "none" }}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog - Larger size */}
          <div
            className="relative w-full max-w-[90vw] h-[85vh] rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-br from-[#4A90E2]/20 via-[#5BA3F5]/10 to-[#4A90E2]/20 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#4A90E2]/30 to-[#5BA3F5]/30 backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-bricolage">
                    Virtual Try-On
                  </h2>
                  <p className="text-xs text-white/70 mt-0.5">
                    Upload your photo and select items to try on
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content - No overflow here */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
                {/* Left Column: Human Image Upload + Selected Items */}
                <div className="space-y-3 xl:col-span-1 overflow-y-auto custom-scrollbar pr-2">
                  <HumanImageUpload
                    humanImage={humanImage}
                    humanImagePreview={humanImagePreview}
                    isProcessing={isProcessing}
                    onImageChange={handleHumanImageChange}
                  />

                  <SelectedItemsPreview
                    selectedItems={selectedItems}
                    onRemoveItem={handleToggleItem}
                  />
                </div>

                {/* Right Column: Item Selection */}
                <div className="flex flex-col space-y-3 xl:col-span-2 h-full overflow-hidden">
                  <div className="flex-shrink-0 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white font-bricolage">
                      2. Select Items (Max 5)
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium">
                      {selectedItemIds.length}/5
                    </span>
                  </div>

                  {/* View Toggle */}
                  <ViewToggle
                    view={view}
                    totalOutfits={totalOutfits}
                    totalWardrobeItems={totalWardrobeItems}
                    isProcessing={isProcessing}
                    onViewChange={(newView) => {
                      setView(newView);
                      setSelectedItemIds([]);
                      if (newView === "outfit") {
                        setWardrobeFilters({});
                        setShowWardrobeFilters(false);
                        setSelectedOutfitId(null);
                      } else {
                        setSelectedOutfitId(null);
                      }
                    }}
                  />

                  {/* Filters for Wardrobe */}
                  {view === "wardrobe" && (
                    <WardrobeFilters
                      filters={wardrobeFilters}
                      showFilters={showWardrobeFilters}
                      categoryTreeData={categoryTreeData}
                      seasons={seasons}
                      styles={styles}
                      occasions={occasions}
                      onFiltersChange={setWardrobeFilters}
                      onToggleFilters={() =>
                        setShowWardrobeFilters(!showWardrobeFilters)
                      }
                    />
                  )}

                  {/* Filters for Outfits */}
                  {view === "outfit" && (
                    <OutfitFilters
                      filters={outfitFilters}
                      showFilters={true}
                      onFiltersChange={setOutfitFilters}
                      onToggleFilters={() => {}}
                    />
                  )}

                  {/* Content Area - Outfits Grid or Items Grid */}
                  <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {view === "outfit" ? (
                      <OutfitSelectionGrid
                        outfits={outfits}
                        selectedOutfitId={selectedOutfitId}
                        isLoading={isLoadingOutfits}
                        hasMore={hasMoreOutfits}
                        loadMoreRef={loadMoreRef}
                        onSelectOutfit={handleSelectOutfit}
                      />
                    ) : (
                      <ItemSelectionGrid
                        items={availableItems}
                        selectedItemIds={selectedItemIds}
                        isLoading={isLoadingWardrobeItems}
                        hasMore={hasMoreWardrobeItems}
                        loadMoreRef={loadMoreRef}
                        isProcessing={isProcessing}
                        view="wardrobe"
                        totalItems={totalWardrobeItems}
                        onToggleItem={handleToggleItem}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 border-t border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-xl">
                <div className="flex-1">
                  {selectedItems.length > 0 && (
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        selectedItems.length > 5
                          ? "text-red-300"
                          : "text-white/70"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          selectedItems.length > 5
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      />
                      <span className="font-medium">
                        {selectedItems.length} / 5 items selected
                        {selectedItems.length > 5 && (
                          <span className="ml-2 text-red-400">
                            (Remove {selectedItems.length - 5})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={handleClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={
                      !humanImage ||
                      selectedItemIds.length === 0 ||
                      selectedItemIds.length > 5 ||
                      isProcessing
                    }
                    className={
                      selectedItemIds.length > 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : selectedItemIds.length > 5 ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Too Many Items ({selectedItemIds.length}/5)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Try-On</span>
                      </>
                    )}
                  </GlassButton>
                </div>
              </div>
          </div>

          {/* Custom scrollbar styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>
        </div>
      )}

      {/* Result Modal - Rendered outside selection dialog */}
      <VirtualTryOnResultDialog
        open={showResultModal}
        onOpenChange={(open) => {
          setShowResultModal(open);
          if (!open) {
            // Reset states when closing result modal
            setHumanImage(null);
            setHumanImagePreview("");
            setSelectedItemIds([]);
            setResultUrl(null);
          }
        }}
        resultUrl={resultUrl}
        isGenerating={isProcessing}
        onRegenerate={handleRegenerate}
        selectedItemIds={selectedItemIds}
        selectedOutfitId={selectedOutfitId}
      />
    </>
  );
}
