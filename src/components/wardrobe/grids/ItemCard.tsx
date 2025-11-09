"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { MoreVertical, Edit, Trash2, Sparkles, Flower2, Sun, Leaf, Snowflake, Wand2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";
import { WardrobeItem } from "@/types";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: WardrobeItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  onUseInOutfit?: (item: WardrobeItem) => void;
  onAnalyze?: (id: string) => void;
  onView?: (item: WardrobeItem) => void;
  showCheckbox?: boolean;
}

export const ItemCard = memo(function ItemCard({
  item,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onUseInOutfit,
  onAnalyze,
  onView,
  showCheckbox = false,
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelect?.(item.id, checked);
  }, [item.id, onSelect]);

  const handleEdit = useCallback(() => onEdit?.(item), [item, onEdit]);
  const handleDelete = useCallback(() => onDelete?.(item.id), [item.id, onDelete]);
  const handleUseInOutfit = useCallback(() => onUseInOutfit?.(item), [item, onUseInOutfit]);
  const handleView = useCallback(() => onView?.(item), [item, onView]);
  const handleAnalyze = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      await onAnalyze?.(item.id);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, item.id, onAnalyze]);

  const handleUseInOutfitClick = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onUseInOutfit?.(item);
  }, [item, onUseInOutfit]);

  // Get unique colors from item
  const colors = item.colors?.slice(0, 4) || [];

  // Helper function to format season/occasion/style names
  const formatNames = (items: Array<string | { id: number; name: string }> | undefined): string => {
    if (!items || items.length === 0) return "N/A";
    return items.map((s) => (typeof s === 'string' ? s : s.name)).join(", ");
  };

  const styles = formatNames(item.styles);

  // Get season data for badges
  const getSeasonData = (seasonName: string) => {
    const name = seasonName.toLowerCase();
    if (name === 'spring') return { icon: Flower2, color: 'text-pink-200', bg: 'bg-pink-500/50', border: 'border-pink-300/70' };
    if (name === 'summer') return { icon: Sun, color: 'text-yellow-200', bg: 'bg-yellow-500/50', border: 'border-yellow-300/70' };
    if (name === 'fall' || name === 'autumn') return { icon: Leaf, color: 'text-orange-200', bg: 'bg-orange-500/50', border: 'border-orange-300/70' };
    if (name === 'winter') return { icon: Snowflake, color: 'text-cyan-200', bg: 'bg-cyan-500/50', border: 'border-cyan-300/70' };
    return { icon: null, color: 'text-gray-200', bg: 'bg-gray-500/50', border: 'border-gray-300/70' };
  };

  const seasonItems = item.seasons?.map(s => typeof s === 'string' ? s : s.name) || [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full h-full flex flex-col"
    >
      {/* AI Badge - Top Left Corner - Only show if confidence > 50 */}
      {item.isAnalyzed && item.aiConfidence && item.aiConfidence > 50 && (
        <div className="absolute -top-2 -left-2 z-20">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 blur-md opacity-75 animate-pulse" />

            {/* Main badge */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-xl border-2 border-white">
              <span className="text-xs font-black text-white drop-shadow-lg">AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu - Positioned outside the card */}
      <div className="absolute top-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-2 rounded-lg",
                "bg-white/30 border border-white/30",
                "text-white hover:bg-white/40 hover:border-white/40",
                "shadow-lg shadow-white/10",
                "transition-all duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-xl border-white/50">
            <DropdownMenuItem onClick={handleEdit} className="hover:bg-white/60">
              <Edit className="w-4 h-4 mr-2" />
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUseInOutfit} className="hover:bg-white/60">
              <Sparkles className="w-4 h-4 mr-2" />
              Use in Outfit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600 hover:bg-red-50/60"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlassCard
        padding="16px"
        borderRadius="24px"
        blur="4px"
        brightness={1.02}
        glowColor={isSelected ? "rgba(34, 211, 238, 0.4)" : "rgba(34, 211, 238, 0.2)"}
        borderColor={isSelected ? "rgba(34, 211, 238, 0.5)" : "rgba(255, 255, 255, 0.2)"}
        borderWidth="2px"
        className={cn(
          "relative h-full flex flex-col item-card-transition cursor-pointer",
          "bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20",
          isHovered && "item-card-hovered",
          isSelected && "ring-2 ring-cyan-400/50"
        )}
        onClick={handleView}
      >

        <div className="w-full flex flex-col flex-1 relative z-10">
          {/* Image Container */}
          {/* Checkbox - Top Left */}

          {showCheckbox && (
            <div
              className={cn(
                "absolute top-4 left-4 z-10",
                "rounded-lg bg-black/70 p-1.5",
                "transition-opacity duration-200",
                isHovered || isSelected ? "opacity-100" : "opacity-0"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                className="bg-white border-0 data-[state=checked]:bg-blue-500"
              />
            </div>
          )}
          {/* Image with aspect ratio */}
          <div className="bg-white/5 rounded-xl aspect-square flex items-center justify-center overflow-hidden relative">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              loading="lazy"
            />
          </div>

          {/* Item Details */}
          <div className="flex flex-col h-[160px] my-3">
            {/* Name and Category */}
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-white font-semibold text-base truncate">
                {item.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] font-medium whitespace-nowrap">
                {item.category?.name || "Uncategorized"}
              </span>
            </div>

            {/* Info Lines - Each field in one line */}
            <div className="space-y-1 text-xs flex-1 overflow-hidden">
              {/* Colors - Only show color circles */}
              {colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fabric */}
              <div className="flex items-center gap-2">
                <span className="text-white/70 truncate">{item.fabric || "N/A"}</span>
              </div>

              {/* Weather */}
              <div className="flex items-center gap-2">
                <span className="text-white/70 truncate">{item.weatherSuitable || "N/A"}</span>
              </div>

              {/* Seasons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {seasonItems.length > 0 ? (
                  seasonItems.slice(0, 4).map((season, index) => {
                    const seasonData = getSeasonData(season);
                    const Icon = seasonData.icon;
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full border",
                          seasonData.bg,
                          seasonData.border
                        )}
                      >
                        {Icon && (
                          <Icon className={cn("w-3 h-3", seasonData.color)} />
                        )}
                        <span className={cn("text-[10px] font-medium", seasonData.color)}>
                          {season}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-white/50 text-xs">N/A</span>
                )}
              </div>

              {/* Styles */}
              <div className="flex items-center gap-2">
                <span className="text-white/70 truncate">{styles}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {!item.isAnalyzed ? (
              <GlassButton
                className="font-semibold w-full"
                size="sm"
                variant="primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                borderRadius="10px"
                blur="4px"
                brightness={1.1}
                glowColor="rgba(147, 51, 234, 0.3)"
                glowIntensity={4}
                borderColor="rgba(168, 85, 247, 0.3)"
                borderWidth="1px"
                textColor="rgba(19, 19, 19, 1)"
                backgroundColor="rgb(233, 213, 255)"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-900/20 border-t-purple-900 rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    AI Analysis
                  </>
                )}
              </GlassButton>
            ) : (
              <GlassButton
                className="font-semibold w-full"
                size="sm"
                variant="primary"
                onClick={handleUseInOutfitClick}
                borderRadius="10px"
                blur="4px"
                brightness={1.1}
                glowColor="rgba(59, 130, 246, 0.3)"
                glowIntensity={4}
                borderColor="rgba(148, 163, 184, 0.3)"
                borderWidth="1px"
                textColor="rgba(19, 19, 19, 1)"
                backgroundColor="rgb(216, 234, 254)"
              >
                <Sparkles className="w-4 h-4" />
                Use in Outfit
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>

      <style jsx>{`
        :global(.item-card-transition) {
          transition: box-shadow 0.2s ease;
          will-change: box-shadow;
        }
        :global(.item-card-hovered) {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
});
