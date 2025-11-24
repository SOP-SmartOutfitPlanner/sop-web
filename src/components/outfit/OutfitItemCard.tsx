"use client";

import { memo } from "react";
import GlassCard from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Star } from "lucide-react";

interface OutfitItem {
  itemId: number;
  id?: number;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string; // JSON string: [{"name":"Red","hex":"#FF0000"}]
  imgUrl: string;
  fabric: string;
  brand?: string | null;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  aiDescription?: string;
  itemType?: string;
}

interface OutfitItemCardProps {
  item: OutfitItem;
  onClick?: () => void;
}

// Parse color JSON string
const parseColors = (
  colorString: string
): Array<{ name: string; hex: string }> => {
  try {
    if (colorString.startsWith("[")) {
      return JSON.parse(colorString);
    }
    // Fallback for comma-separated
    return colorString.split(",").map((c) => ({
      name: c.trim(),
      hex: "#808080",
    }));
  } catch {
    return [];
  }
};

export const OutfitItemCard = memo(function OutfitItemCard({
  item,
  onClick,
}: OutfitItemCardProps) {
  const colors = parseColors(item.color).slice(0, 4);
  const hasAiDescription = !!item.aiDescription;
  return (
    <div className="group relative w-full h-full flex flex-col">
      {/* AI Badge - Top Left Corner */}
      {hasAiDescription && (
        <div className="absolute -top-2 -left-2 z-20">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 blur-md opacity-75 animate-pulse" />

            {/* Main badge */}
            <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-xl border-2 border-white">
              <span className="text-xs font-black text-white drop-shadow-lg">
                AI
              </span>
            </div>
          </div>
        </div>
      )}

      {item.itemType === "SYSTEM" && (
        <div className="absolute -top-2 -right-2 z-20">
          <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-2 border-white">
            <Star className="w-3 h-3" />
            AI Suggest
          </span>
        </div>
      )}

      <GlassCard
        padding="16px"
        borderRadius="24px"
        blur="4px"
        brightness={1.02}
        glowColor="rgba(34, 211, 238, 0.2)"
        borderColor="rgba(255, 255, 255, 0.2)"
        borderWidth="2px"
        className={cn(
          "relative h-full flex flex-col item-card-transition",
          "bg-linear-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20",
          onClick &&
          "cursor-pointer hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200"
        )}
        onClick={onClick}
      >
        <div className="w-full flex flex-col h-full relative z-10">
          {/* Image Container - Fixed aspect ratio */}
          <div className="bg-white/5 rounded-xl aspect-square flex items-center justify-center overflow-hidden relative shrink-0">
            <Image
              src={item.imgUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              loading="lazy"
            />
          </div>

          {/* Item Details - Fixed height */}
          <div className="flex flex-col mt-3 space-y-2 flex-1 min-h-0">
            {/* Name and Category */}
            <div className="flex items-start gap-2">
              <h3 className="text-white font-semibold text-sm line-clamp-1 flex-1">
                {item.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] font-medium whitespace-nowrap shrink-0">
                {item.categoryName}
              </span>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full border-2 border-white/40 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            )}

            {/* Info Grid - Fixed min height to ensure consistency */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-white/70 min-h-[72px]">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-white/50 shrink-0">
                  Fabric:
                </span>
                <span className="truncate">{item.fabric}</span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-white/50 shrink-0">
                  Pattern:
                </span>
                <span className="truncate">{item.pattern}</span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-white/50 shrink-0">
                  Weather:
                </span>
                <span className="truncate">{item.weatherSuitable}</span>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-white/50 shrink-0">
                  Condition:
                </span>
                <span className="truncate">{item.condition}</span>
              </div>

              <div className="col-span-2 flex items-center gap-1 min-w-0">
                <span className="font-medium text-white/50 shrink-0">
                  Brand:
                </span>
                <span className="truncate">{item.brand || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
});
