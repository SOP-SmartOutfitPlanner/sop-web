"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Edit } from "lucide-react";
import { Image } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";

export interface ViewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  onEdit?: () => void;
}

interface ColorOption {
  name: string;
  hex: string;
}

interface ViewItemData {
  name: string;
  category: string;
  colors: ColorOption[];
  brand: string;
  frequencyWorn: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  styles: string[];
  occasions: string[];
  seasons: string[];
  aiDescription: string;
  aiConfidence?: number;
  isAnalyzed?: boolean;
}

export function ViewItemDialog({
  open,
  onOpenChange,
  itemId,
  onEdit,
}: ViewItemDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [itemData, setItemData] = useState<ViewItemData | null>(null);

  const fetchItemData = useCallback(async () => {
    setIsLoading(true);
    try {
      const item = await wardrobeAPI.getItem(itemId);

      // Parse colors from string to ColorOption array
      let parsedColors: ColorOption[] = [];
      if (item.color) {
        try {
          parsedColors = JSON.parse(item.color);
        } catch {
          // If parsing fails, treat as empty array
          parsedColors = [];
        }
      }

      setItemData({
        name: item.name || "",
        category: item.categoryName || "N/A",
        colors: parsedColors,
        brand: item.brand || "N/A",
        frequencyWorn: item.frequencyWorn || "N/A",
        imgUrl: item.imgUrl,
        weatherSuitable: item.weatherSuitable || "N/A",
        condition: item.condition || "N/A",
        pattern: item.pattern || "N/A",
        fabric: item.fabric || "N/A",
        styles: item.styles?.map((s) => s.name) || [],
        occasions: item.occasions?.map((o) => o.name) || [],
        seasons: item.seasons?.map((s) => s.name) || [],
        aiDescription: item.aiDescription || "",
        aiConfidence: item.aiConfidence,
        isAnalyzed: item.isAnalyzed,
      });
    } catch (error) {
      console.error("Failed to fetch item:", error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (open) {
      fetchItemData();
    }
  }, [open, fetchItemData]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-[1400px] max-w-[95vw] h-[95vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95">
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    Item Details
                  </h2>
                  <p className="font-bricolage text-sm text-gray-200 mt-0.5">
                    View your wardrobe item information
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <GlassButton
                      onClick={onEdit}
                      variant="custom"
                      size="sm"
                      borderRadius="12px"
                      blur="8px"
                      brightness={1.1}
                      glowColor="rgba(59, 130, 246, 0.4)"
                      glowIntensity={4}
                      borderColor="rgba(59, 130, 246, 0.3)"
                      borderWidth="1px"
                      textColor="#ffffff"
                      backgroundColor="rgba(59, 130, 246, 0.2)"
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </GlassButton>
                  )}
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white/70">Loading item details...</p>
                  </div>
                </div>
              ) : itemData ? (
                <div className="grid grid-cols-3 gap-3 h-full overflow-hidden">
                  {/* Column 1: Image, Name, Colors */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <p className="text-lg font-medium text-white mb-1.5">Image</p>
                      <div className="aspect-square rounded-xl overflow-hidden bg-white/5 relative">
                        <Image
                          src={itemData.imgUrl}
                          alt={itemData.name}
                          className="w-full h-full object-cover"
                          preview={{
                            mask: <div className="text-white">Click to preview</div>,
                          }}
                        />
                        {itemData.isAnalyzed && itemData.aiConfidence && itemData.aiConfidence > 50 && (
                          <div className="absolute top-2 right-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border border-white/50">
                              <span className="text-[10px] font-bold text-white">AI</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-shrink-0">
                      <p className="text-lg font-medium text-white mb-1.5">Name</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.name}</p>
                    </div>

                    {/* Colors */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      <p className="text-lg font-medium text-white mb-1.5 flex-shrink-0">Colors</p>
                      <div className="flex gap-2 flex-wrap overflow-y-auto custom-scrollbar">
                        {itemData.colors.length > 0 ? (
                          itemData.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-9 h-9 rounded-lg border-2 border-white/30 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                              title={color.hex}
                            />
                          ))
                        ) : (
                          <p className="text-white/50 text-sm">No colors</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Details */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 overflow-y-auto custom-scrollbar space-y-3">
                    {/* Category & Brand */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Category</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.category}</p>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Brand</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.brand}</p>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Frequency Worn</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.frequencyWorn}</p>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Fabric</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.fabric}</p>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Pattern</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.pattern}</p>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Condition</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.condition}</p>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Weather Suitable</p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">{itemData.weatherSuitable}</p>
                    </div>
                  </div>

                  {/* Column 3: Tags */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 overflow-y-auto custom-scrollbar space-y-3">
                    {/* Styles */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Styles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.styles.length > 0 ? (
                          itemData.styles.map((style, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-md"
                            >
                              {style}
                            </span>
                          ))
                        ) : (
                          <p className="text-white/50 text-xs">No styles</p>
                        )}
                      </div>
                    </div>

                    {/* Occasions */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Occasions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.occasions.length > 0 ? (
                          itemData.occasions.map((occasion, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-200 text-md"
                            >
                              {occasion}
                            </span>
                          ))
                        ) : (
                          <p className="text-white/50 text-xs">No occasions</p>
                        )}
                      </div>
                    </div>

                    {/* Seasons */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">Seasons</p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.seasons.length > 0 ? (
                          itemData.seasons.map((season, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-md"
                            >
                              {season}
                            </span>
                          ))
                        ) : (
                          <p className="text-white/50 text-xs">No seasons</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white/70">Failed to load item details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
