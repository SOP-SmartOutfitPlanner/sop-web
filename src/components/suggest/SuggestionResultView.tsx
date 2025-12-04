"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Star, Flower2, Sun, Leaf, Snowflake } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";
import { SuggestedItem } from "@/types/outfit";
import { outfitAPI } from "@/lib/api/outfit-api";
import { CalenderAPI } from "@/lib/api/calender-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";
import { useScrollLock } from "@/hooks/useScrollLock";

interface SuggestionResultViewProps {
  items: SuggestedItem[];
  reason: string;
  selectedDate?: Date;
  selectedOccasionId?: number | null;
  onOutfitUsed?: () => void;
  onClose?: () => void;
}

export function SuggestionResultView({
  items,
  reason,
  selectedDate,
  selectedOccasionId,
  onOutfitUsed,
  onClose,
}: SuggestionResultViewProps) {
  const [isAddingToWardrobe, setIsAddingToWardrobe] = useState(false);
  const [isUsingOutfit, setIsUsingOutfit] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [createdOutfitId, setCreatedOutfitId] = useState<number | null>(null);

  // Lock scroll when dialog is open
  useScrollLock(isViewDialogOpen);

  const handleItemClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setIsViewDialogOpen(true);
  };

  // Parse color from JSON string
  const parseColor = (colorStr: string) => {
    try {
      const colors = JSON.parse(colorStr);
      if (Array.isArray(colors) && colors.length > 0) {
        return colors;
      }
    } catch {
      return [];
    }
    return [];
  };

  // Get season data for badges
  const getSeasonData = (seasonName: string) => {
    const name = seasonName.toLowerCase();
    if (name === 'spring') return { icon: Flower2, color: 'text-pink-200', bg: 'bg-pink-500/50', border: 'border-pink-300/70', circleBg: 'bg-pink-500' };
    if (name === 'summer') return { icon: Sun, color: 'text-yellow-200', bg: 'bg-yellow-500/50', border: 'border-yellow-300/70', circleBg: 'bg-yellow-500' };
    if (name === 'fall' || name === 'autumn') return { icon: Leaf, color: 'text-orange-200', bg: 'bg-orange-500/50', border: 'border-orange-300/70', circleBg: 'bg-orange-500' };
    if (name === 'winter') return { icon: Snowflake, color: 'text-cyan-200', bg: 'bg-cyan-500/50', border: 'border-cyan-300/70', circleBg: 'bg-cyan-500' };
    return { icon: null, color: 'text-gray-200', bg: 'bg-gray-500/50', border: 'border-gray-300/70', circleBg: 'bg-gray-500' };
  };

  // Handle Add to Wardrobe - Create outfit only
  const handleAddToWardrobe = async () => {
    if (items.length === 0) {
      toast.error("No items to add");
      return;
    }

    // If outfit already created, don't create again
    if (createdOutfitId) {
      toast.success("Outfit already added!");
      onClose?.();
      return;
    }

    setIsAddingToWardrobe(true);
    const loadingToast = toast.loading("Adding to your outfit...");

    try {
      const itemIds = items.map((item) => item.id);
      const outfitResponse = await outfitAPI.createOutfit({
        name: `AI Suggested Outfit - ${new Date().toLocaleDateString()}`,
        description: reason,
        itemIds: itemIds,
      });

      // Save the created outfit ID for later use
      setCreatedOutfitId(outfitResponse.data.id);

      toast.success("Added successfully to your outfit!", { id: loadingToast });
    } catch (error) {
      console.error("Error adding outfit to wardrobe:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add outfit to wardrobe",
        { id: loadingToast }
      );
    } finally {
      setIsAddingToWardrobe(false);
    }
  };

  // Handle Use This Outfit - Create outfit + Add to occasion or selected date
  const handleUseThisOutfit = async () => {
    if (items.length === 0) {
      toast.error("No items to add");
      return;
    }

    setIsUsingOutfit(true);
    const loadingToast = toast.loading(selectedOccasionId ? "Adding outfit to occasion..." : "Setting up outfit...");

    try {
      // Step 1: Create the outfit (or reuse existing one)
      let outfitId: number;
      const targetDate = selectedDate || new Date();
      
      if (createdOutfitId) {
        // Reuse existing outfit ID
        outfitId = createdOutfitId;
      } else {
        // Create new outfit
        const itemIds = items.map((item) => item.id);
        const outfitResponse = await outfitAPI.createOutfit({
          name: `AI Suggested Outfit - ${targetDate.toLocaleDateString()}`,
          description: reason,
          itemIds: itemIds,
        });
        outfitId = outfitResponse.data.id;
        setCreatedOutfitId(outfitId);
      }

      // Step 2: Add to calendar - either to occasion or to selected date
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const startTime = `${year}-${month}-${day}T05:00:00`;
      const endTime = `${year}-${month}-${day}T17:00:00`;

      if (selectedOccasionId) {
        // Add to the selected occasion
        await CalenderAPI.createCalendarEntry({
          outfitIds: [outfitId],
          isDaily: false,
          userOccasionId: selectedOccasionId,
          time: startTime,
          endTime: endTime,
        });
        toast.success("Outfit added to the occasion!", { id: loadingToast });
        onOutfitUsed?.();
      } else {
        // Add to the selected date at 5:00 AM - 17:00 PM
        await CalenderAPI.createCalendarEntry({
          outfitIds: [outfitId],
          isDaily: true,
          time: startTime,
          endTime: endTime,
        });
        toast.success("Outfit scheduled successfully!", { id: loadingToast });
        onOutfitUsed?.();
      }
      onClose?.();
    } catch (error) {
      console.error("Error using outfit:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to set up outfit",
        { id: loadingToast }
      );
    } finally {
      setIsUsingOutfit(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Reason Card */}
      <GlassCard
        padding="20px"
        borderRadius="16px"
        blur="8px"
        brightness={1.05}
        glowColor="rgba(139, 92, 246, 0.3)"
        borderColor="rgba(255, 255, 255, 0.2)"
        className="bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-purple-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">AI Recommendation</h3>
            <p className="text-white/80 text-sm leading-relaxed">{reason}</p>
          </div>
        </div>
      </GlassCard>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const colors = parseColor(item.color);
          const seasonItems = item.seasons?.map(s => typeof s === 'string' ? s : s.name) || [];

          return (
            <div key={item.id} className="group relative w-full h-full flex flex-col">
              {/* System Item Badge */}
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
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "relative h-full flex flex-col cursor-pointer transition-all duration-200",
                  "bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20",
                  "hover:shadow-lg"
                )}
              >
                <div className="w-full flex flex-col flex-1 relative z-10">
                  {/* Image Container */}
                  <div className="bg-white/5 rounded-xl aspect-square flex items-center justify-center overflow-hidden relative">
                    <Image
                      src={item.imgUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col h-[200px] my-3">
                    {/* Name and Category */}
                    <div className="mb-2">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="text-white font-semibold text-base line-clamp-2 flex-1 overflow-hidden h-12">
                          {item.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] font-medium whitespace-nowrap flex-shrink-0">
                          {item.categoryName || "Uncategorized"}
                        </span>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-1 text-xs flex-1 overflow-hidden">
                      {/* Colors */}
                      {colors && colors.length > 0 && (
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {colors.slice(0, 6).map((color: { hex: string; name: string }, index: number) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-white/30 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                            {colors.length > 6 && (
                              <span className="text-white/50 text-[10px] ml-0.5">
                                +{colors.length - 6}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Fabric */}
                      {item.fabric && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 truncate">{item.fabric}</span>
                        </div>
                      )}

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
                                {/* Pill background */}
                                <div
                                  className={cn(
                                    "px-5 py-2 rounded-full border flex items-center justify-center ml-3 h-4",
                                    seasonData.bg,
                                    seasonData.border
                                  )}
                                >
                                  <span className={cn("font-xs truncate", seasonData.color)}>
                                    {season}
                                  </span>
                                </div>
                                {/* Circle icon on top of pill */}
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
                      {item.styles && item.styles.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 truncate">
                            {item.styles.map(s => typeof s === 'string' ? s : s.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-6 mt-6 border-t border-white/10">
        {/* Bottom Row: Add to Wardrobe & Use Outfit Today */}
        <div className="flex justify-center gap-4">
            {/* Add to Wardrobe Button */}
            <div className=" group/btn">
              <div className="relative">
                <GlassButton
                  variant="custom"
                  borderRadius="18px"
                  blur="20px"
                  brightness={1.2}
                  glowColor="rgba(200, 214, 238, 0.5)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.35)"
                  borderWidth="2px"
                  textColor="#ffffff"
                  backgroundColor="rgba(0, 98, 255, 0.9)"
                  onClick={handleAddToWardrobe}
                  disabled={isAddingToWardrobe || isUsingOutfit}
                  className={cn(
                    "relative w-full h-16 font-bold text-base tracking-wide",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !isAddingToWardrobe && !isUsingOutfit && "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isAddingToWardrobe && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isAddingToWardrobe ? "Adding to My Outfit..." : "Add to My Outfit"}
                  </span>
                </GlassButton>
              </div>
            </div>

            {/* Use This Outfit Button */}
            <div className=" group/btn">
              <div className="relative">
                <GlassButton
                  variant="custom"
                  borderRadius="18px"
                  blur="16px"
                  brightness={1.2}
                  glowColor="rgba(200, 238, 200, 0.5)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.35)"
                  borderWidth="2px"
                  textColor="#ffffff"
                  backgroundColor="rgba(9, 133, 28, 0.91)"
                  onClick={handleUseThisOutfit}
                  disabled={isAddingToWardrobe || isUsingOutfit}
                  className={cn(
                    "relative w-full h-16 font-bold text-base tracking-wide",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !isAddingToWardrobe && !isUsingOutfit && "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isUsingOutfit && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isUsingOutfit ? "Setting up..." : "Use This Outfit"}
                  </span>
                </GlassButton>
              </div>
            </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/60">No outfit suggestions available</p>
          <p className="text-white/40 text-sm mt-2">
            Try adding more items to your wardrobe
          </p>
        </div>
      )}

      {/* View Item Dialog */}
      {selectedItemId && (
        <ViewItemDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          itemId={selectedItemId}
        />
      )}
    </div>
  );
}
