"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Sparkles, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import { wardrobeAPI, ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ItemDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number | null;
}

export function ItemDetailView({ open, onOpenChange, itemId }: ItemDetailViewProps) {
  const [item, setItem] = useState<ApiWardrobeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageScale, setImageScale] = useState(1);

  // Fetch item details when dialog opens
  useEffect(() => {
    if (open && itemId) {
      fetchItemDetails(itemId);
    }
  }, [open, itemId]);

  const fetchItemDetails = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await wardrobeAPI.getItem(id);
      setItem(data);
    } catch (error) {
      console.error("Failed to fetch item:", error);
      toast.error("Failed to load item details");
    } finally {
      setIsLoading(false);
    }
  };

  // Parse colors from comma-separated string
  const colors = item?.color
    ? item.color.split(",").map((c) => c.trim())
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden bg-white border-gray-200">
        <DialogTitle className="sr-only">Item Details</DialogTitle>

        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-gray-50/30" />

        {/* Header */}
        <div className="relative border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 ring-1 ring-blue-400/20"
              >
                <Sparkles className="w-5 h-5 text-blue-600" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
                <p className="text-sm text-gray-600">AI-analyzed wardrobe item</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-5rem)] custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : item ? (
            <div className="p-6 space-y-6">
              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Image */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-xl cursor-zoom-in"
                    onMouseEnter={() => setImageScale(1.1)}
                    onMouseLeave={() => setImageScale(1)}
                  >
                    <Image
                      src={item.imgUrl}
                      alt={item.name}
                      fill
                      className="object-contain transition-transform duration-300"
                      style={{ transform: `scale(${imageScale})` }}
                    />
                  </div>
                  
                  {/* Item Name */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.categoryName}</p>
                  </div>
                </motion.div>

                {/* Right: Details Grid */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  {/* 2x2 Grid for Key Info */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Color Card */}
                    <InfoCard
                      title="Colors"
                      icon={<div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-purple-400" />}
                    >
                      <div className="flex flex-wrap gap-2 mt-2">
                        {colors.map((color, idx) => (
                          <TooltipProvider key={idx}>
                            <Tooltip>
                              <TooltipTrigger>
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-md cursor-pointer hover:scale-110 transition-transform"
                                  style={{ backgroundColor: getColorHex(color) }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{color}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </InfoCard>

                    {/* Fabric Card */}
                    <InfoCard
                      title="Material"
                      icon={<Tag className="w-5 h-5 text-green-400" />}
                    >
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-900 font-medium">{item.fabric}</p>
                        <p className="text-xs text-gray-600">{item.pattern} pattern</p>
                      </div>
                    </InfoCard>

                    {/* Style Card */}
                    <InfoCard
                      title="Style & Occasion"
                      icon={<Sparkles className="w-5 h-5 text-blue-600" />}
                    >
                      <div className="mt-2 space-y-2">
                        {item.styles && item.styles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.styles.map((style) => (
                              <span
                                key={style.id}
                                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200"
                              >
                                {style.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.occasions && item.occasions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.occasions.map((occasion) => (
                              <span
                                key={occasion.id}
                                className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200"
                              >
                                {occasion.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </InfoCard>

                    {/* Season & Weather Card */}
                    <InfoCard
                      title="Season & Weather"
                      icon={<Calendar className="w-5 h-5 text-amber-600" />}
                    >
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-900 font-medium">{item.weatherSuitable}</p>
                        {item.seasons && item.seasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.seasons.map((season) => (
                              <span
                                key={season.id}
                                className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                              >
                                {season.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </InfoCard>
                  </div>

                  {/* AI Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">AI Summary</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.aiDescription}
                    </p>
                  </motion.div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                      <p className="text-gray-600 text-xs mb-1">Condition</p>
                      <p className="text-gray-900 font-medium">{item.condition}</p>
                    </div>
                    {item.brand && (
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-gray-600 text-xs mb-1">Brand</p>
                        <p className="text-gray-900 font-medium">{item.brand}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-white/60">Item not found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for info cards
function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/80 border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// Extended color mapping to handle more color variations
const COLOR_MAP: Record<string, string> = {
  // Basic colors
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
  purple: "#A855F7",
  pink: "#EC4899",
  orange: "#F97316",
  gray: "#6B7280",
  grey: "#6B7280",
  black: "#1F2937",
  white: "#F9FAFB",
  brown: "#92400E",
  
  // Light variations
  "light red": "#FCA5A5",
  "light blue": "#93C5FD",
  "light green": "#6EE7B7",
  "light yellow": "#FCD34D",
  "light purple": "#C4B5FD",
  "light pink": "#F9A8D4",
  "light orange": "#FDBA74",
  "light gray": "#D1D5DB",
  "light grey": "#D1D5DB",
  
  // Dark variations
  "dark red": "#991B1B",
  "dark blue": "#1E3A8A",
  "dark green": "#065F46",
  "dark yellow": "#78350F",
  "dark purple": "#581C87",
  "dark pink": "#831843",
  "dark orange": "#9A3412",
  "dark gray": "#374151",
  "dark grey": "#374151",
  
  // Additional common colors
  navy: "#1E3A8A",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  indigo: "#6366F1",
  violet: "#8B5CF6",
  magenta: "#D946EF",
  lime: "#84CC16",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B",
  beige: "#D4C5B9",
  cream: "#FFFDD0",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  maroon: "#800000",
  burgundy: "#800020",
};

const DEFAULT_COLOR = "#94A3B8"; // Slate-400 fallback

// Helper to get color hex from color name
function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  
  // Direct match
  if (COLOR_MAP[normalized]) {
    return COLOR_MAP[normalized];
  }
  
  // Try partial match (e.g., "Blue Navy" -> "blue" or "navy")
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (COLOR_MAP[word]) {
      return COLOR_MAP[word];
    }
  }
  
  // Return color as-is if it looks like a hex code
  if (/^#[0-9A-F]{6}$/i.test(normalized)) {
    return normalized;
  }
  
  return DEFAULT_COLOR;
}
