"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Image, Select, ColorPicker, TreeSelect } from "antd";
import type { Color } from "antd/es/color-picker";
import type { DataNode } from "antd/es/tree";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface TreeNodeData extends DataNode {
  value?: number;
  children?: TreeNodeData[];
}
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { cn } from "@/lib/utils";

export interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  onItemUpdated?: () => void;
}

interface ColorOption {
  name: string;
  hex: string;
}

interface EditFormData {
  name: string;
  categoryId: number;
  categoryName?: string;
  colors: ColorOption[];
  brand: string;
  frequencyWorn: string;
  lastWornAt?: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  styleIds: number[];
  occasionIds: number[];
  seasonIds: number[];
  aiDescription: string; // Keep unchanged, not displayed
}

const WEATHER_OPTIONS = [
  "Hot Weather",
  "Cold Weather",
  "Rainy",
  "Mild",
  "Windy",
  "Transitional",
  "Humid",
  "Dry Heat",
  "Snowy",
  "Indoor",
];

const PATTERN_OPTIONS = [
  "Solid",
  "Striped",
  "Plaid",
  "Floral",
  "Graphic",
  "Logo",
  "Checkered",
  "Polka dot",
];

const FABRIC_OPTIONS = [
  "Cotton",
  "Silk",
  "Denim",
  "Wool",
  "Leather",
  "Polyester",
  "Linen",
  "Nylon",
  "Blend",
];

export function EditItemDialog({
  open,
  onOpenChange,
  itemId,
  onItemUpdated,
}: EditItemDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EditFormData | null>(null);

  // Options from API
  const [categoryTreeData, setCategoryTreeData] = useState<TreeNodeData[]>([]);
  const [styles, setStyles] = useState<{ id: number; name: string }[]>([]);
  const [occasions, setOccasions] = useState<{ id: number; name: string }[]>(
    []
  );
  const [seasons, setSeasons] = useState<{ id: number; name: string }[]>([]);

  const fetchItemData = useCallback(async () => {
    setIsLoading(true);
    try {
      const item = await wardrobeAPI.getItem(itemId);

      // Parse colors from API response
      let colors: ColorOption[] = [];
      if (item.color) {
        try {
          const parsed = JSON.parse(item.color);
          if (Array.isArray(parsed)) {
            colors = parsed;
          } else {
            colors = [parsed];
          }
        } catch {
          colors = [{ name: item.color, hex: item.color }];
        }
      }

      setFormData({
        name: item.name,
        categoryId: item.categoryId || item.category?.id || 0,
        colors,
        categoryName: item.categoryName || "",
        brand: item.brand || "",
        frequencyWorn: item.frequencyWorn || "",
        lastWornAt: item.lastWornAt,
        imgUrl: item.imgUrl,
        weatherSuitable: item.weatherSuitable || "",
        condition: item.condition || "",
        pattern: item.pattern || "",
        fabric: item.fabric || "",
        styleIds: item.styles?.map((s) => s.id) || [],
        occasionIds: item.occasions?.map((o) => o.id) || [],
        seasonIds: item.seasons?.map((s) => s.id) || [],
        aiDescription: item.aiDescription || "", // Keep unchanged
      });
    } catch (error) {
      console.error("Failed to fetch item:", error);
      toast.error("Failed to load item details");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, onOpenChange]);

  // Fetch item data and options
  useEffect(() => {
    if (open && itemId) {
      fetchItemData();
      fetchOptions();
    }
  }, [open, itemId, fetchItemData]);

  const fetchOptions = async () => {
    try {
      const [rootCategories, stylesData, occasionsData, seasonsData] =
        await Promise.all([
          wardrobeAPI.getRootCategories(),
          wardrobeAPI.getStyles(),
          wardrobeAPI.getOccasions(),
          wardrobeAPI.getSeasons(),
        ]);

      // Build tree structure for categories - load all children for proper display
      const treeDataPromises = rootCategories.map(async (cat) => {
        const children = await wardrobeAPI.getCategoriesByParent(cat.id);
        return {
          key: cat.id,
          value: cat.id,
          title: cat.name,
          isLeaf: children.length === 0,
          selectable: false, // Disable selection for parent categories
          children: children.map((child) => ({
            key: child.id,
            value: child.id,
            title: child.name,
            isLeaf: true,
            selectable: true, // Allow selection for child categories
          })),
        };
      });

      const treeData = await Promise.all(treeDataPromises);

      setCategoryTreeData(treeData);
      setStyles(stylesData);
      setOccasions(occasionsData);
      setSeasons(seasonsData);
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading("Updating item...");

    try {
      const token = localStorage.getItem("accessToken");
      let userId = 0;
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload?.UserId
          ? parseInt(payload.UserId)
          : payload?.id
          ? parseInt(payload.id)
          : 0;
      }

      const updatePayload = {
        userId,
        name: formData.name,
        categoryId: formData.categoryId,
        colors: formData.colors, // Send as array of {name, hex} objects
        brand: formData.brand || undefined,
        frequencyWorn: formData.frequencyWorn || undefined,
        imgUrl: formData.imgUrl,
        weatherSuitable: formData.weatherSuitable || undefined,
        condition: formData.condition || undefined,
        pattern: formData.pattern || undefined,
        fabric: formData.fabric || undefined,
        styleIds: formData.styleIds,
        occasionIds: formData.occasionIds,
        seasonIds: formData.seasonIds,
      };

      await wardrobeAPI.updateItem(itemId, updatePayload);

      toast.success("Item updated successfully!", { id: loadingToast });
      onItemUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update item",
        { id: loadingToast }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArraySelection = (
    field: "styleIds" | "occasionIds" | "seasonIds",
    id: number
  ) => {
    if (!formData) return;
    const current = formData[field] || [];
    const updated = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    setFormData({ ...formData, [field]: updated });
  };

  const toggleWeatherOption = (weather: string) => {
    if (!formData) return;
    const currentWeathers = formData.weatherSuitable
      ? formData.weatherSuitable.split(", ")
      : [];
    const updated = currentWeathers.includes(weather)
      ? currentWeathers.filter((w) => w !== weather)
      : [...currentWeathers, weather];
    setFormData({ ...formData, weatherSuitable: updated.join(", ") });
  };

  const handleAddColor = (color: Color) => {
    if (!formData) return;
    const hexColor = color.toHexString();
    const newColor: ColorOption = { name: hexColor, hex: hexColor };
    setFormData({ ...formData, colors: [...formData.colors, newColor] });
  };

  const handleRemoveColor = (index: number) => {
    if (!formData) return;
    const updatedColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: updatedColors });
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleSave}
      title="Edit Item"
      subtitle="Update your wardrobe item details"
      maxWidth="1400px"
      maxHeight="95vh"
      isLoading={isSaving || isLoading}
      loadingText="Saving changes..."
      confirmButtonText="Save Changes"
      confirmButtonColor="rgba(59, 130, 246, 0.6)"
      confirmButtonBorderColor="rgba(59, 130, 246, 0.8)"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white/70">Loading item details...</p>
          </div>
        </div>
      ) : formData ? (
        <div className="grid grid-cols-3 gap-3 h-full overflow-hidden">
          {/* Column 1: Image, Name, Colors */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 overflow-hidden">
            {/* Image */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium text-white mb-1.5 block">
                Image
              </Label>
              <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                <Image
                  src={formData.imgUrl}
                  alt={formData.name}
                  width="100%"
                  height="100%"
                  className="object-cover"
                  preview={true}
                />
              </div>
            </div>

            {/* Name */}
            <div className="flex-shrink-0">
              <Label
                htmlFor="name"
                className="text-lg font-medium text-white mb-1.5 block"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Item name"
                className="bg-white border-white/30 text-gray-900 placeholder:text-gray-400 h-9"
              />
            </div>

            {/* Colors */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <Label className="text-lg font-medium text-white mb-1.5 block flex-shrink-0">
                Colors
              </Label>
              <div className="flex gap-2 flex-wrap overflow-y-auto wizard-scrollbar">
                {formData.colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="group relative w-9 h-9 rounded-lg border-2 border-white/30 shadow-sm hover:scale-105 transition-all duration-200 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                    title={`${color.hex} (click to remove)`}
                  >
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 rounded-lg transition-opacity" />
                    <X
                      className="w-4 h-4 text-white drop-shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      strokeWidth={3}
                    />
                  </button>
                ))}
                <ColorPicker
                  disabledAlpha
                  format="hex"
                  onChangeComplete={handleAddColor}
                  presets={[]}
                >
                  <button
                    type="button"
                    className="w-9 h-9 rounded-lg bg-white/10 border-2 border-dashed border-white/30 text-white hover:bg-white/20 hover:border-white/50 flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </ColorPicker>
              </div>
            </div>
          </div>

          {/* Column 2: Category, Brand, Pattern, Fabric, Condition, Frequency */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto wizard-scrollbar">
            {/* Category */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Category
              </Label>
              <TreeSelect
                showSearch
                value={formData.categoryId}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    categoryId: value,
                  });
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                treeData={categoryTreeData as unknown as any[]}
                className="w-full"
                size="large"
                placeholder="Select category"
                popupMatchSelectWidth={false}
                filterTreeNode={(search, item) =>
                  (item.title as string)
                    .toLowerCase()
                    .includes(search.toLowerCase())
                }
              />
            </div>

            {/* Brand */}
            <div className="flex-shrink-0">
              <Label
                htmlFor="brand"
                className="text-lg font-medium text-white mb-1.5 block"
              >
                Brand (Optional)
              </Label>
              <Input
                id="brand"
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g., Nike, Zara, Uniqlo"
                className="bg-white border-white/30 text-gray-900 placeholder:text-gray-400 h-9"
              />
            </div>

            {/* Pattern */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Pattern
              </Label>
              <Select
                value={formData.pattern}
                onChange={(value) =>
                  setFormData({ ...formData, pattern: value })
                }
                className="w-full"
                size="large"
                placeholder="Select pattern"
                options={PATTERN_OPTIONS.map((p) => ({
                  label: p,
                  value: p,
                }))}
              />
            </div>

            {/* Fabric */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Fabric
              </Label>
              <Select
                value={formData.fabric}
                onChange={(value) =>
                  setFormData({ ...formData, fabric: value })
                }
                className="w-full"
                size="large"
                placeholder="Select fabric"
                options={FABRIC_OPTIONS.map((f) => ({
                  label: f,
                  value: f,
                }))}
              />
            </div>

            {/* Condition */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Condition
              </Label>
              <Input
                id="condition"
                type="text"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value,
                  })
                }
                placeholder="e.g., New, Laundry"
                className="bg-white border-white/30 text-gray-900 placeholder:text-gray-400 h-9"
              />
            </div>

            {/* Last Worn (Read-only) */}
            <div className="flex-shrink-0">
              <Label
                htmlFor="lastWorn"
                className="text-lg font-medium text-white mb-1.5 block"
              >
                Last Worn
              </Label>
              <Input
                id="lastWorn"
                type="text"
                value={
                  formData.lastWornAt
                    ? new Date(formData.lastWornAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never worn"
                }
                readOnly
                disabled
                className="bg-white/10 border-white/20 text-gray-300 placeholder:text-gray-500 h-9 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Column 3: Weather, Styles, Occasions, Seasons */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto wizard-scrollbar">
            {/* Weather Suitable */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Weather Suitable
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {WEATHER_OPTIONS.map((weather) => (
                  <button
                    key={weather}
                    type="button"
                    onClick={() => toggleWeatherOption(weather)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text- font-medium transition-all",
                      formData.weatherSuitable.includes(weather)
                        ? "bg-gradient-to-br from-orange-600 to-orange-500 text-white shadow-md"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    {weather}
                  </button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Styles
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => toggleArraySelection("styleIds", style.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-sm font-medium transition-all",
                      formData.styleIds.includes(style.id)
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasions */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Occasions
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {occasions.map((occasion) => (
                  <button
                    key={occasion.id}
                    type="button"
                    onClick={() =>
                      toggleArraySelection("occasionIds", occasion.id)
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-md text-sm font-medium transition-all",
                      formData.occasionIds.includes(occasion.id)
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    {occasion.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Seasons */}
            <div className="flex-shrink-0">
              <Label className="text-lg font-medium text-white mb-1.5 block">
                Seasons
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    type="button"
                    onClick={() => toggleArraySelection("seasonIds", season.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-sm font-medium transition-all",
                      formData.seasonIds.includes(season.id)
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmModal>
  );
}
