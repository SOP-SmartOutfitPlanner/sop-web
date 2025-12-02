"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { MoreVertical, Eye, Trash2, Sparkles, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import { ApiWardrobeItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdminItemCardProps {
  item: ApiWardrobeItem;
  onView?: (item: ApiWardrobeItem) => void;
  onDelete?: (id: string) => void;
}

export const AdminItemCard = memo(function AdminItemCard({
  item,
  onView,
  onDelete,
}: AdminItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = useCallback(() => onView?.(item), [item, onView]);
  const handleDeleteClick = useCallback(() => onDelete?.(item.id), [item.id, onDelete]);

  // Parse colors
  const colors = item.color?.split(",").map((c) => c.trim()).filter(Boolean) || [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full h-full flex flex-col"
    >
      {/* AI Badge */}
      {item.isAnalyzed && (
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

      {/* Menu */}
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
            <DropdownMenuItem onClick={handleView} className="hover:bg-white/60">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
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
        glowColor="rgba(34, 211, 238, 0.2)"
        borderColor="rgba(255, 255, 255, 0.2)"
        borderWidth="2px"
        className={cn(
          "relative h-full flex flex-col item-card-transition cursor-pointer",
          "bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20",
          isHovered && "item-card-hovered"
        )}
        onClick={handleView}
      >
        <div className="w-full flex flex-col flex-1 relative z-10">
          {/* Image */}
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
          <div className="flex flex-col mt-3 space-y-3">
            {/* Name and Category */}
            <div>
              <div className="flex items-start gap-2 mb-1">
                <h3 className="text-white font-semibold text-base line-clamp-2 flex-1 overflow-hidden">
                  {item.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] font-medium whitespace-nowrap flex-shrink-0">
                  {item.categoryName || "Uncategorized"}
                </span>
              </div>
            </div>

            {/* User Badge */}
            {item.user && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/10 border border-white/20">
                <User className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs text-white/90 font-medium">
                  {item.user.firstName} {item.user.lastName}
                </span>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {colors.slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/80 text-[10px] font-medium"
                  >
                    {color}
                  </div>
                ))}
                {colors.length > 5 && (
                  <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/60 text-[10px] font-medium">
                    +{colors.length - 5}
                  </div>
                )}
              </div>
            )}

            {/* AI Status */}
            <div className="flex items-center justify-between pt-1">
              {item.isAnalyzed ? (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Analyzed
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/20 text-xs">
                  Not Analyzed
                </Badge>
              )}
            </div>

            {/* Created Date */}
            {item.createdAt && (
              <div className="text-[10px] text-white/50 pt-1">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
});
