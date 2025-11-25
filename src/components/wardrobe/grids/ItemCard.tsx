"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { Tooltip } from "antd";
import { MoreVertical, Edit, Trash2, Flower2, Sun, Leaf, Snowflake, Wand2, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GlassCard from "@/components/ui/glass-card";
import { DeleteItemModal } from "@/components/wardrobe/DeleteItemModal";
import { WardrobeItem } from "@/types";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: WardrobeItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
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
  onAnalyze,
  onView
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = useCallback(() => onEdit?.(item), [item, onEdit]);
  const handleDeleteClick = useCallback(() => setShowDeleteModal(true), []);
  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(item.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [item.id, onDelete]);
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

  // Helper function to format season/occasion/style names
  const formatNames = (items: Array<string | { id: number; name: string }> | undefined): string => {
    if (!items || items.length === 0) return "N/A";
    return items.map((s) => (typeof s === 'string' ? s : s.name)).join(", ");
  };

  const styles = formatNames(item.styles);

  // Get season data for badges
  const getSeasonData = (seasonName: string) => {
    const name = seasonName.toLowerCase();
    if (name === 'spring') return { icon: Flower2, color: 'text-pink-200', bg: 'bg-pink-500/50', border: 'border-pink-300/70', circleBg: 'bg-pink-500' };
    if (name === 'summer') return { icon: Sun, color: 'text-yellow-200', bg: 'bg-yellow-500/50', border: 'border-yellow-300/70', circleBg: 'bg-yellow-500' };
    if (name === 'fall' || name === 'autumn') return { icon: Leaf, color: 'text-orange-200', bg: 'bg-orange-500/50', border: 'border-orange-300/70', circleBg: 'bg-orange-500' };
    if (name === 'winter') return { icon: Snowflake, color: 'text-cyan-200', bg: 'bg-cyan-500/50', border: 'border-cyan-300/70', circleBg: 'bg-cyan-500' };
    return { icon: null, color: 'text-gray-200', bg: 'bg-gray-500/50', border: 'border-gray-300/70', circleBg: 'bg-gray-500' };
  };

  const seasonItems = item.seasons?.map(s => typeof s === 'string' ? s : s.name) || [];

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteItemModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={item.name}
        itemImageUrl={item.imageUrl}
        isDeleting={isDeleting}
      />

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-full h-full flex flex-col"
      >
        {/* AI Badge*/}
        {item.isAnalyzed && item.aiConfidence && (
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
            <div className="flex flex-col h-[200px] mt-3">
              {/* Name and Category */}
              <div className="mb-2">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-white font-semibold text-base line-clamp-2 flex-1 overflow-hidden h-12">
                    {item.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] font-medium whitespace-nowrap flex-shrink-0">
                    {item.category?.name || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* No data display for unanalyzed item - center the button */}
              {!item.isAnalyzed ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-5">

                  {/* Magic Button with Tooltip */}
                  <Tooltip
                    title={isAnalyzing ? "Analyzing..." : "AI Analysis"}
                    placement="bottom"
                    mouseEnterDelay={0.3}
                    color="purple"
                    overlayClassName="custom-ai-tooltip"
                  >
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={cn(
                        "relative group/magic",
                        "transition-all duration-300",
                        "background-gradient-to-br from-purple-500/30 to-violet-500/30",
                        isAnalyzing && "pointer-events-none"
                      )}
                      aria-label={isAnalyzing ? "Analyzing..." : "AI Analysis"}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 blur-xl opacity-0 group-hover/magic:opacity-60 transition-opacity duration-300" />

                      {/* Outer rotating ring when analyzing */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-purple-400/30 border-t-purple-400 animate-spin" />
                      )}

                      {/* Image button */}
                      <div className={cn(
                        "relative w-20 h-20 rounded-full overflow-hidden",
                        "bg-white/10 backdrop-blur-sm",
                        "border-2 border-white/20",
                        "shadow-xl",
                        "transition-all duration-300",
                        "group-hover/magic:scale-110 group-hover/magic:border-purple-400/50",
                        "active:scale-95",
                        isAnalyzing && "opacity-30"
                      )}>
                        <Image
                          src="/icon/ai-icon.png"
                          alt=""
                          width={80}
                          height={80}
                          className="w-full h-full object-contain p-3"
                          draggable={false}
                        />
                      </div>

                      {/* Pulse effect when not analyzing */}
                      {!isAnalyzing && (
                        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-purple-400/50 animate-pulse" />
                      )}
                    </button>
                  </Tooltip>
                </div>
              ) : (
                <div className="space-y-1 text-xs overflow-hidden">
                  {item.colors && item.colors.length > 0 && (
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.colors.slice(0, 6).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-white/30 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                        {item.colors.length > 6 && (
                          <span className="text-white/50 text-[10px] ml-0.5">
                            +{item.colors.length - 6}
                          </span>
                        )}
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
                  <div className="h-12 grid grid-cols-2 grid-rows-2 gap-x-2 gap-y-1 grid-flow-col">
                    {seasonItems.length > 0 ? (
                      seasonItems.slice(0, 4).map((season, index) => {
                        const seasonData = getSeasonData(season);
                        const Icon = seasonData.icon;
                        return (
                          <div
                            key={index}
                            className="relative flex items-center"
                          >
                            {/* Pill background - smaller height, farther from circle */}
                            <div
                              className={cn(
                                "px-5 py-2 rounded-full border flex items-center justify-center ml-3 h-4",
                                seasonData.bg,
                                seasonData.border
                              )}
                            >
                              <span className={cn(" font-xs truncate", seasonData.color)}>
                                {season}
                              </span>
                            </div>
                            {/* Circle icon on top of pill - fully opaque background */}
                            {Icon && (
                              <div
                                className={cn(
                                  "absolute left-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md",
                                  seasonData.circleBg
                                )}
                              >
                                <Icon className={cn("w-3.5 h-3.5", seasonData.color)} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-white/50 text-xs col-span-2">N/A</span>
                    )}
                  </div>

                  {/* Styles */}
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 truncate">{styles}</span>
                  </div>
                </div>
              )}
            </div>


          </div>
        </GlassCard>

        <style jsx global>{`
          .item-card-transition {
            transition: box-shadow 0.2s ease;
            will-change: box-shadow;
          }
          .item-card-hovered {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .custom-ai-tooltip .ant-tooltip-inner {
            background: linear-gradient(135deg, rgb(147 51 234 / 0.95), rgb(109 40 217 / 0.95)) !important;
            backdrop-filter: blur(12px);
            border: 2px solid rgba(168, 85, 247, 0.5);
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            padding: 8px 12px;
            font-size: 14px;
          }
          .custom-ai-tooltip .ant-tooltip-arrow::before {
            background: rgb(147 51 234 / 0.95) !important;
          }
        `}</style>
      </div>
    </>
  );
});
