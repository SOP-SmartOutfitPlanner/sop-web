"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { X, Upload, Sparkles, CheckCircle2, AlertCircle, Image as ImageIcon, Filter as FilterIcon, Search } from "lucide-react";
import { Image, TreeSelect, Select, Input } from "antd";
import type { DataNode } from "antd/es/tree";
import NextImage from "next/image";
import GlassButton from "@/components/ui/glass-button";
import { wardrobeAPI, ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { Outfit } from "@/types/outfit";
import { outfitAPI } from "@/lib/api/outfit-api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface VirtualTryOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOutfit?: Outfit | null;
  onSuccess?: (resultUrl: string) => void;
}

interface Filters {
  categoryId?: number;
  seasonId?: number;
  styleId?: number;
  occasionId?: number;
  searchQuery?: string;
}

export function VirtualTryOnDialog({
  open,
  onOpenChange,
  currentOutfit,
  onSuccess,
}: VirtualTryOnDialogProps) {
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [humanImagePreview, setHumanImagePreview] = useState<string>("");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<"wardrobe" | "outfit">("outfit");
  const [wardrobeItems, setWardrobeItems] = useState<ApiWardrobeItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 50;
  
  // Filter options
  const [categoryTreeData, setCategoryTreeData] = useState<DataNode[]>([]);
  const [seasons, setSeasons] = useState<{ id: number; name: string }[]>([]);
  const [styles, setStyles] = useState<{ id: number; name: string }[]>([]);
  const [occasions, setOccasions] = useState<{ id: number; name: string }[]>([]);

  // Fetch filter options
  useEffect(() => {
    if (open && view === "wardrobe") {
      const fetchOptions = async () => {
        try {
          const [rootCategories, seasonsData, stylesData, occasionsData] = await Promise.all([
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
        setIsLoadingItems(true);
        try {
          const response = await wardrobeAPI.getItems(currentPage, pageSize, {
            categoryId: filters.categoryId,
            seasonId: filters.seasonId,
            styleId: filters.styleId,
            occasionId: filters.occasionId,
            searchQuery: filters.searchQuery,
          });
          
          if (currentPage === 1) {
            setWardrobeItems(response.data || []);
          } else {
            setWardrobeItems((prev) => [...prev, ...(response.data || [])]);
          }
          
          setTotalItems(response.metaData?.totalCount || 0);
          setHasMoreItems(response.metaData?.hasNext || false);
        } catch (error) {
          console.error("Failed to fetch wardrobe items:", error);
          toast.error("Failed to load wardrobe items");
        } finally {
          setIsLoadingItems(false);
        }
      };
      fetchWardrobeItems();
    }
  }, [open, view, filters, currentPage, pageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    if (view === "wardrobe") {
      setCurrentPage(1);
      setWardrobeItems([]);
    }
  }, [filters, view]);

  // Get items from current outfit or wardrobe
  const availableItems = useMemo(() => {
    if (view === "outfit" && currentOutfit?.items) {
      // Transform outfit items to ApiWardrobeItem format
      return currentOutfit.items.map((item) => ({
        userId: currentOutfit.userId,
        userDisplayName: currentOutfit.userDisplayName,
        name: item.name,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        color: item.color,
        aiDescription: "", 
        brand: item.brand || undefined,
        frequencyWorn: item.frequencyWorn || undefined,
        lastWornAt: item.lastWornAt || undefined,
        imgUrl: item.imgUrl,
        weatherSuitable: item.weatherSuitable,
        condition: item.condition,
        pattern: item.pattern,
        fabric: item.fabric,
        id: item.itemId,
      })) as ApiWardrobeItem[];
    }
    return wardrobeItems;
  }, [view, currentOutfit, wardrobeItems]);

  // Handle human image upload
  const handleHumanImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setHumanImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setHumanImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Load more items
  const handleLoadMore = useCallback(() => {
    if (!isLoadingItems && hasMoreItems) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingItems, hasMoreItems]);

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

  // Get selected items details
  const selectedItems = useMemo(() => {
    return availableItems.filter((item) => item.id && selectedItemIds.includes(item.id));
  }, [availableItems, selectedItemIds]);

  // Handle close dialog (defined before handleGenerate to avoid initialization order issues)
  const handleClose = useCallback(() => {
    if (!isProcessing) {
      setHumanImage(null);
      setHumanImagePreview("");
      setSelectedItemIds([]);
      setView("outfit");
      onOpenChange(false);
    }
  }, [isProcessing, onOpenChange]);

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

    setIsProcessing(true);

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
        toast.success(response.message || "Virtual try-on generated successfully!");
        
        // Call success callback with result URL
        if (onSuccess) {
          onSuccess(response.data.url);
        }

        // Reset and close dialog
        handleClose();
      } else {
        throw new Error(response.message || "Invalid response from server");
      }
    } catch {
    } finally {
      setIsProcessing(false);
    }
  }, [humanImage, selectedItemIds, selectedItems, onSuccess, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog - Larger size */}
      <div className="relative w-full max-w-[90vw] h-[85vh] rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm">
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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white font-bricolage">
                  1. Upload Your Photo
                </h3>
                {humanImage && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
              </div>

              <label
                htmlFor="human-image-upload"
                className="block relative w-full h-100 rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden group"
              >
                {humanImagePreview ? (
                  <NextImage
                    src={humanImagePreview}
                    alt="Your photo"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                    <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-semibold text-base">Click to upload</p>
                      <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="human-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleHumanImageChange}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>

              {humanImage && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    For best results, use a clear full-body photo with good lighting
                  </p>
                </div>
              )}

              {/* Selected Items Preview */}
              {selectedItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white/90">Selected Items ({selectedItems.length}/5)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-cyan-400/40">
                          <Image
                            src={item.imgUrl}
                            alt={item.name}
                            width="100%"
                            height="100%"
                            className="object-cover"
                            preview={false}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <button
                          onClick={() => item.id && handleToggleItem(item.id)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="flex-shrink-0 flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                <button
                  onClick={() => {
                    setView("outfit");
                    setFilters({});
                    setShowFilters(false);
                  }}
                  disabled={isProcessing || !currentOutfit}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    view === "outfit"
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/60 hover:text-white/80"
                  } ${!currentOutfit ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={!currentOutfit ? "No outfit selected" : "Items from the outfit you're viewing"}
                >
                  From Current Outfit {currentOutfit ? `(${currentOutfit.items.length})` : "(0)"}
                </button>
                <button
                  onClick={() => setView("wardrobe")}
                  disabled={isProcessing}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    view === "wardrobe"
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/60 hover:text-white/80"
                  }`}
                  title="All items from your wardrobe with filters"
                >
                  From Wardrobe (All)
                </button>
              </div>

              {/* Filters for Wardrobe */}
              {view === "wardrobe" && (
                <div className="flex-shrink-0 space-y-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 text-white text-sm font-medium transition-all shadow-lg"
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
                          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
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
                            onChange={(value) => setFilters({ ...filters, categoryId: value })}
                            allowClear
                            showSearch
                            treeNodeFilterProp="title"
                            className="w-full"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 10000 }}
                            getPopupContainer={(trigger) => trigger.parentElement || document.body}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">Season</Label>
                          <Select
                            placeholder="All Seasons"
                            value={filters.seasonId}
                            onChange={(value) => setFilters({ ...filters, seasonId: value })}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            className="w-full"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 10000 }}
                            getPopupContainer={(trigger) => trigger.parentElement || document.body}
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
                            onChange={(value) => setFilters({ ...filters, styleId: value })}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            className="w-full"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 10000 }}
                            getPopupContainer={(trigger) => trigger.parentElement || document.body}
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
                            onChange={(value) => setFilters({ ...filters, occasionId: value })}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            className="w-full"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 10000 }}
                            getPopupContainer={(trigger) => trigger.parentElement || document.body}
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
                      {(filters.categoryId || filters.seasonId || filters.styleId || filters.occasionId || filters.searchQuery) && (
                        <button
                          onClick={() => setFilters({})}
                          className="w-full px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-medium transition-all"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Items Grid - This is the ONLY scrollable area */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingItems ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/60">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                    <p className="text-sm">Loading items...</p>
                  </div>
                ) : availableItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/60">
                    <ImageIcon className="w-12 h-12 mb-3" />
                    <p className="text-sm">
                      {view === "outfit"
                        ? currentOutfit ? "No items in current outfit" : "Please select an outfit first"
                        : "No items in wardrobe"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2 pb-2">
                      {availableItems.map((item) => {
                      const isSelected = item.id
                        ? selectedItemIds.includes(item.id)
                        : false;

                      return (
                        <button
                          key={item.id}
                          onClick={() => item.id && handleToggleItem(item.id)}
                          disabled={isProcessing}
                          className={`relative p-1.5 rounded-lg transition-all ${
                            isSelected
                              ? "bg-gradient-to-br from-cyan-400/30 via-blue-300/20 to-indigo-400/30 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40"
                              : "bg-white/5 border-2 border-white/20 hover:border-white/40"
                          }`}
                        >
                          {/* Selection Badge */}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Image */}
                          <div className="aspect-square rounded-md overflow-hidden bg-white/5">
                            <Image
                              src={item.imgUrl}
                              alt={item.name}
                              width="100%"
                              height="100%"
                              className="object-cover"
                              preview={{
                                mask: <span className="text-xs">View</span>,
                                getContainer: () => document.body,
                                zIndex: 10001,
                              }}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>

                          {/* Name - Only show on hover */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center p-1 rounded-lg">
                            <p className="text-xs font-medium text-white text-center line-clamp-2">
                              {item.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    </div>
                    
                    {/* Load More Button */}
                    {view === "wardrobe" && hasMoreItems && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoadingItems}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoadingItems ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                              Loading...
                            </>
                          ) : (
                            `Load More (${wardrobeItems.length}/${totalItems})`
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 border-t border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-xl">
          <div className="flex-1">
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/70">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>{selectedItems.length} items selected</span>
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
              disabled={!humanImage || selectedItemIds.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
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
  );
}
