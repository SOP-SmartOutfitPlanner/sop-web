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
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10">
        <DialogTitle className="sr-only">Item Details</DialogTitle>

        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.1),transparent_50%)]" />

        {/* Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="p-2 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 ring-1 ring-blue-400/40"
              >
                <Sparkles className="w-5 h-5 text-blue-300" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Item Details</h2>
                <p className="text-sm text-white/50">AI-analyzed wardrobe item</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white/90" />
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
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 shadow-2xl cursor-zoom-in"
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
                    <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-white/60 mt-1">{item.categoryName}</p>
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
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg cursor-pointer hover:scale-110 transition-transform"
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
                        <p className="text-white font-medium">{item.fabric}</p>
                        <p className="text-xs text-white/50">{item.pattern} pattern</p>
                      </div>
                    </InfoCard>

                    {/* Style Card */}
                    <InfoCard
                      title="Style & Occasion"
                      icon={<Sparkles className="w-5 h-5 text-blue-400" />}
                    >
                      <div className="mt-2 space-y-2">
                        {item.styles && item.styles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.styles.map((style) => (
                              <span
                                key={style.id}
                                className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30"
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
                                className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30"
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
                      icon={<Calendar className="w-5 h-5 text-yellow-400" />}
                    >
                      <div className="mt-2 space-y-1">
                        <p className="text-white font-medium">{item.weatherSuitable}</p>
                        {item.seasons && item.seasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.seasons.map((season) => (
                              <span
                                key={season.id}
                                className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
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
                    className="rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white">AI Summary</h4>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {item.aiDescription}
                    </p>
                  </motion.div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-800/30 border border-white/10 p-3">
                      <p className="text-white/50 text-xs mb-1">Condition</p>
                      <p className="text-white font-medium">{item.condition}</p>
                    </div>
                    {item.brand && (
                      <div className="rounded-lg bg-slate-800/30 border border-white/10 p-3">
                        <p className="text-white/50 text-xs mb-1">Brand</p>
                        <p className="text-white font-medium">{item.brand}</p>
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
    <div className="rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// Color mapping constants
const COLOR_MAP: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
  purple: "#A855F7",
  pink: "#EC4899",
  orange: "#F97316",
  gray: "#6B7280",
  black: "#000000",
  white: "#FFFFFF",
  brown: "#92400E",
};

const DEFAULT_COLOR = "#6B7280"; // Gray fallback

// Helper to get color hex from color name
function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_MAP[normalized] || DEFAULT_COLOR;
}
