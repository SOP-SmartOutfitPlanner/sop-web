"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Sparkles,
  ShirtIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WardrobeItem } from "@/types";
import { cn } from "@/lib/utils";
import { getColorHex } from "@/lib/utils/color-mapper";
import { formatDistanceToNow } from "date-fns";

interface ItemCardProps {
  item: WardrobeItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: WardrobeItem) => void;
  onUseInOutfit?: (item: WardrobeItem) => void;
  showCheckbox?: boolean;
}

export function ItemCard({
  item,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onView,
  onUseInOutfit,
  showCheckbox = false,
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(item.id, checked);
  };

  const handleEdit = () => onEdit?.(item);
  const handleDelete = () => onDelete?.(item.id);
  const handleUseInOutfit = () => onUseInOutfit?.(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-300 rounded-2xl",
          "bg-white/80 backdrop-blur-sm border border-gray-200/50",
          "shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)]",
          isHovered && [
            "shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.25)]",
            "border-primary/40",
          ],
          isSelected && [
            "border-primary ring-2 ring-primary/20",
            "shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.3)]",
          ],
          !isSelected && !isHovered && "hover:shadow-lg"
        )}
      >
        <CardContent className="p-0">
          {/* Image Container - Larger, more fashionable ratio */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                isHovered && "scale-105"
              )}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `
                <div class="flex h-full w-full items-center justify-center bg-gray-100">
                  <div class="text-center">
                    <div class="mx-auto h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                      <span class="text-gray-400 text-lg font-medium">
                        ${item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500">No image</p>
                  </div>
                </div>
              `;
              }}
            />

            {/* Checkbox */}
            {showCheckbox && (
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                  className="bg-background/80 border-2"
                />
              </div>
            )}

            {/* Hover Actions */}
            <div
              className={cn(
                "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
                showCheckbox
                  ? "opacity-0"
                  : isHovered
                  ? "opacity-100"
                  : "opacity-0"
              )}
            >
              {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleView}
                    className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0"
                  >
                    <MoreHorizontal className="w-4 h-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Item
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleUseInOutfit}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use in Outfit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header - Updated typography */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate text-gray-900 font-[Inter,Poppins] tracking-tight">
                  {item.name}
                </h3>
                {item.brand && (
                  <p className="text-sm text-gray-500 truncate font-medium">
                    {item.brand}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-xs font-medium bg-gray-50 border-gray-200"
              >
                {item.type}
              </Badge>
            </div>

            {/* Color Swatches */}
            {item.color && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200"
                          style={{ backgroundColor: getColorHex(item.color) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{item.color}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
            {/* Seasons & Occasions */}
            <div className="flex items-center gap-4 text-xs">
              {/* Seasons */}
              {item.seasons && item.seasons.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Seasons:</span>
                  <div className="flex gap-1">
                    {item.seasons.slice(0, 2).map((season) => (
                      <TooltipProvider key={season}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {season}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="capitalize">{season}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {item.seasons.length > 2 && (
                      <span className="text-muted-foreground">
                        +{item.seasons.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Occasions */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-xs">For:</span>
                <div className="flex gap-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <TooltipProvider key={tag}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {tag}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="capitalize">{tag}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-muted-foreground">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Usage Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.frequencyWorn ?? 0} wears
                </Badge>
                {item.lastWorn && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-muted-foreground">
                          Last:{" "}
                          {formatDistanceToNow(new Date(item.lastWorn), {
                            addSuffix: true,
                          })}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Last worn:{" "}
                          {new Date(item.lastWorn).toLocaleDateString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseInOutfit}
                className="w-full text-xs"
              >
                <ShirtIcon className="w-3 h-3 mr-1" />
                Use in Outfit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
