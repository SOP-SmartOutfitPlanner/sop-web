"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, RotateCcw, Plus, CalendarCheck, Loader2, Star } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";
import { SuggestedItem } from "@/types/outfit";
import { outfitAPI } from "@/lib/api/outfit-api";
import { CalenderAPI } from "@/lib/api/calender-api";
import { toast } from "sonner";

interface SuggestionResultViewProps {
  items: SuggestedItem[];
  reason: string;
  onRechooseLocation: () => void;
  onClose: () => void;
}

export function SuggestionResultView({
  items,
  reason,
  onRechooseLocation,
  onClose,
}: SuggestionResultViewProps) {
  const [isAddingToWardrobe, setIsAddingToWardrobe] = useState(false);
  const [isUsingToday, setIsUsingToday] = useState(false);

  // Parse color from JSON string
  const parseColor = (colorStr: string) => {
    try {
      const colors = JSON.parse(colorStr);
      if (Array.isArray(colors) && colors.length > 0) {
        return colors[0].hex;
      }
    } catch {
      return "#94a3b8";
    }
    return "#94a3b8";
  };

  // Handle Add to Wardrobe - Create outfit only
  const handleAddToWardrobe = async () => {
    if (items.length === 0) {
      toast.error("No items to add");
      return;
    }

    setIsAddingToWardrobe(true);
    const loadingToast = toast.loading("Adding outfit to wardrobe...");

    try {
      const itemIds = items.map((item) => item.id);
      await outfitAPI.createOutfit({
        name: `AI Suggested Outfit - ${new Date().toLocaleDateString()}`,
        description: reason,
        itemIds: itemIds,
      });

      toast.success("Outfit added to wardrobe!", { id: loadingToast });
      onClose();
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

  // Handle Use Outfit Today - Create outfit + Add to calendar for today
  const handleUseOutfitToday = async () => {
    if (items.length === 0) {
      toast.error("No items to add");
      return;
    }

    setIsUsingToday(true);
    const loadingToast = toast.loading("Setting up outfit for today...");

    try {
      // Step 1: Create the outfit
      const itemIds = items.map((item) => item.id);
      const outfitResponse = await outfitAPI.createOutfit({
        name: `Today's Outfit - ${new Date().toLocaleDateString()}`,
        description: reason,
        itemIds: itemIds,
      });

      const outfitId = outfitResponse.data.id;

      // Step 2: Add to calendar for today
      const today = new Date();
      const todayString = today.toISOString().split('T')[0] + 'T' + 
        today.toTimeString().split(' ')[0]; // Format: yyyy-MM-ddTHH:mm:ss

      await CalenderAPI.createCalendarEntry({
        outfitIds: [outfitId],
        isDaily: true,
        time: todayString,
      });

      toast.success("Outfit added and scheduled for today!", { id: loadingToast });
      onClose();
    } catch (error) {
      console.error("Error using outfit today:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to set up outfit for today",
        { id: loadingToast }
      );
    } finally {
      setIsUsingToday(false);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const primaryColor = parseColor(item.color);

          return (
            <GlassCard
              key={item.id}
              padding="16px"
              borderRadius="16px"
              blur="8px"
              brightness={1.05}
              glowColor="rgba(59, 130, 246, 0.2)"
              borderColor="rgba(255, 255, 255, 0.2)"
              className="hover:scale-[1.02] transition-transform"
            >
              <div className="flex gap-4">
                {/* Item Image */}
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  <Image
                    src={item.imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {/* AI Badge */}
                  {item.isAnalyzed && item.aiConfidence && (
                    <div className="absolute top-1 left-1">
                      <div className="relative">
                        <div className="absolute inset-0 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 blur-sm opacity-75" />
                        <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center border border-white/50">
                          <span className="text-[10px] font-black text-white">AI</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {item.name}
                    </h4>
                    {/* System Item Badge */}
                    {item.itemType === "SYSTEM" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white whitespace-nowrap flex-shrink-0 border border-purple-300/30">
                        <Star className="w-3 h-3" />
                        AI Suggest Item
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mb-2">{item.categoryName}</p>

                  {/* Color Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-xs text-white/70">
                      {item.weatherSuitable} • {item.condition}
                    </span>
                  </div>

                  {/* Occasions */}
                  {item.occasions && item.occasions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.occasions.slice(0, 2).map((occasion) => (
                        <span
                          key={occasion.id}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/70"
                        >
                          {occasion.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        {/* Top Row: Try Another Location */}
        <GlassButton
          variant="outline"
          size="md"
          onClick={onRechooseLocation}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4" />
          Try Another Location
        </GlassButton>

        {/* Bottom Row: Add to Wardrobe & Use Outfit Today */}
        <div className="flex gap-3">
          <GlassButton
            variant="custom"
            size="md"
            onClick={handleAddToWardrobe}
            disabled={isAddingToWardrobe || isUsingToday}
            backgroundColor="rgba(59, 130, 246, 0.8)"
            borderColor="rgba(59, 130, 246, 1)"
            className="flex-1"
          >
            {isAddingToWardrobe ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Wardrobe
              </>
            )}
          </GlassButton>
          <GlassButton
            variant="custom"
            size="md"
            onClick={handleUseOutfitToday}
            disabled={isAddingToWardrobe || isUsingToday}
            backgroundColor="rgba(34, 197, 94, 0.8)"
            borderColor="rgba(34, 197, 94, 1)"
            className="flex-1"
          >
            {isUsingToday ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                Use Outfit Today
              </>
            )}
          </GlassButton>
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
    </div>
  );
}
