"use client";

import { useState, useCallback } from "react";
import NextImage from "next/image";
import { Image } from "antd";
import {
  Sparkles,
  Star,
  Flower2,
  Sun,
  Leaf,
  Snowflake,
  CheckCircle2,
  Download,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";
import { SuggestedItem } from "@/types/outfit";
import { outfitAPI } from "@/lib/api/outfit-api";
import { CalenderAPI } from "@/lib/api/calender-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ViewItemDialog } from "@/components/wardrobe/ViewItemDialog";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useSharePostStore } from "@/store/share-post-store";

interface SuggestionResultViewProps {
  items: SuggestedItem[];
  reason: string;
  selectedDate?: Date;
  selectedOccasionId?: number | null;
  onOutfitUsed?: () => void;
  onClose?: () => void;
  bodyImageUrl?: string | null;
  outfitIndex?: number;
  tryOnResult?: {
    success: boolean;
    url: string | null;
    error: string | null;
  };
  onTryOn?: (outfitIndex: number) => Promise<void>;
  isBatchProcessing?: boolean;
}

export function SuggestionResultView({
  items,
  reason,
  selectedDate,
  selectedOccasionId,
  onOutfitUsed,
  onClose,
  bodyImageUrl,
  outfitIndex = 0,
  tryOnResult,
  onTryOn,
  isBatchProcessing = false,
}: SuggestionResultViewProps) {
  const router = useRouter();
  const { setShareData } = useSharePostStore();
  const [isAddingToWardrobe, setIsAddingToWardrobe] = useState(false);
  const [isUsingOutfit, setIsUsingOutfit] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [createdOutfitId, setCreatedOutfitId] = useState<number | null>(null);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Combined loading state - either individual try-on or batch processing
  const isProcessingTryOn = isTryingOn || isBatchProcessing;

  // Lock scroll when dialog is open
  useScrollLock(isViewDialogOpen);

  // Handle download try-on image
  const handleDownload = useCallback(async () => {
    if (!tryOnResult?.url) return;

    setIsDownloading(true);
    try {
      const response = await fetch(tryOnResult.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `virtual-tryon-outfit-${outfitIndex + 1}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  }, [tryOnResult?.url, outfitIndex]);

  // Handle share try-on image to community
  const handleShare = useCallback(async () => {
    if (!tryOnResult?.url) return;

    setIsSharing(true);
    try {
      // Set share data in store with outfit items
      setShareData({
        imageUrl: tryOnResult.url,
        caption: "Experience with Virtual Try On on Smart Outfit Planner #VirtualTryOn #AIFashion",
        itemIds: items.map((item) => item.id),
      });

      // Navigate to community page with post creation modal
      router.push("/community?openPost=true");

      toast.success("Opening post creation...");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to open post creation");
    } finally {
      setIsSharing(false);
    }
  }, [tryOnResult?.url, items, setShareData, router]);

  // Handle individual try-on
  const handleTryOn = useCallback(async () => {
    if (!onTryOn) return;
    setIsTryingOn(true);
    try {
      await onTryOn(outfitIndex);
    } catch (error) {
      console.error("Try-on error:", error);
    } finally {
      setIsTryingOn(false);
    }
  }, [onTryOn, outfitIndex]);

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
    if (name === "spring")
      return {
        icon: Flower2,
        color: "text-pink-200",
        bg: "bg-pink-500/50",
        border: "border-pink-300/70",
        circleBg: "bg-pink-500",
      };
    if (name === "summer")
      return {
        icon: Sun,
        color: "text-yellow-200",
        bg: "bg-yellow-500/50",
        border: "border-yellow-300/70",
        circleBg: "bg-yellow-500",
      };
    if (name === "fall" || name === "autumn")
      return {
        icon: Leaf,
        color: "text-orange-200",
        bg: "bg-orange-500/50",
        border: "border-orange-300/70",
        circleBg: "bg-orange-500",
      };
    if (name === "winter")
      return {
        icon: Snowflake,
        color: "text-cyan-200",
        bg: "bg-cyan-500/50",
        border: "border-cyan-300/70",
        circleBg: "bg-cyan-500",
      };
    return {
      icon: null,
      color: "text-gray-200",
      bg: "bg-gray-500/50",
      border: "border-gray-300/70",
      circleBg: "bg-gray-500",
    };
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
        error instanceof Error
          ? error.message
          : "Failed to add outfit to wardrobe",
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
    const loadingToast = toast.loading(
      selectedOccasionId
        ? "Adding outfit to occasion..."
        : "Setting up outfit..."
    );

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
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");
      const startTime = `${year}-${month}-${day}T05:00:00`;
      const endTime = `${year}-${month}-${day}T17:00:00`;

      if (selectedOccasionId) {
        // Add to the selected occasion (time comes from the occasion itself)
        await CalenderAPI.createCalendarEntry({
          outfitIds: [outfitId],
          isDaily: false,
          userOccasionId: selectedOccasionId,
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

  // Check if we have a successful try-on result
  const hasTryOnSuccess = tryOnResult?.success && tryOnResult?.url;

  // Show side-by-side layout when body image is available (for try-on feature)
  const showSideBySideLayout = !!bodyImageUrl;

  return (
    <div className="space-y-4">
      {/* Try-On Failed Card - Show at top if failed */}
      {tryOnResult && !tryOnResult.success && !isTryingOn && (
        <GlassCard
          padding="20px"
          borderRadius="16px"
          blur="8px"
          brightness={1.05}
          glowColor="rgba(239, 68, 68, 0.3)"
          borderColor="rgba(239, 68, 68, 0.3)"
          className="bg-gradient-to-br from-red-500/20 via-orange-500/10 to-red-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-red-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Try-On Failed</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {tryOnResult.error || "Failed to generate virtual try-on"}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Main Content - Side by Side Layout when Try-On Success or Loading */}
      {showSideBySideLayout ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side: Vertical Items List - 2 columns */}
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 pt-3">
              {items.map((item) => {
                const colors = parseColor(item.color);

                return (
                  <div
                    key={item.id}
                    className="group relative pt-2 pr-2"
                  >
                    {/* System Item Badge */}
                    {item.itemType === "SYSTEM" && (
                      <div className="absolute top-0 right-0 z-20">
                        <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-2 border-white">
                          <Star className="w-3 h-3" />
                          AI Suggest
                        </span>
                      </div>
                    )}

                    <GlassCard
                      padding="10px"
                      borderRadius="14px"
                      blur="4px"
                      brightness={1.02}
                      glowColor="rgba(34, 211, 238, 0.2)"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      borderWidth="2px"
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        "relative h-full flex flex-col cursor-pointer transition-all duration-200",
                        "bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20",
                        "hover:shadow-lg hover:scale-[1.02]"
                      )}
                    >
                      <div className="w-full flex flex-col relative z-10">
                        {/* Image Container */}
                        <div className="bg-white/5 rounded-lg aspect-square flex items-center justify-center overflow-hidden relative">
                          <NextImage
                            src={item.imgUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 150px"
                          />
                        </div>

                        {/* Item Details - Compact */}
                        <div className="flex flex-col mt-2">
                          {/* Name */}
                          <h3 className="text-white font-semibold text-xs line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="text-white/60 text-[10px]">
                            {item.categoryName || "Uncategorized"}
                          </span>

                          {/* Colors */}
                          {colors && colors.length > 0 && (
                            <div className="flex items-center gap-0.5 mt-1">
                              {colors
                                .slice(0, 3)
                                .map(
                                  (
                                    color: { hex: string; name: string },
                                    index: number
                                  ) => (
                                    <div
                                      key={index}
                                      className="w-2.5 h-2.5 rounded-full border border-white/30 shadow-sm"
                                      style={{ backgroundColor: color.hex }}
                                      title={color.name}
                                    />
                                  )
                                )}
                              {colors.length > 3 && (
                                <span className="text-white/50 text-[9px]">
                                  +{colors.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Virtual Try-On Result + AI Recommendation */}
          <div className="lg:w-[320px] xl:w-[380px] flex-shrink-0 space-y-4">
            {/* Try-On Image Card - Placeholder, Loading Skeleton, or Result */}
            {isProcessingTryOn ? (
              /* Loading Skeleton - While generating */
              <GlassCard
                padding="16px"
                borderRadius="20px"
                blur="8px"
                brightness={1.05}
                glowColor="rgba(236, 72, 153, 0.3)"
                borderColor="rgba(236, 72, 153, 0.3)"
                className="bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-pink-500/20"
              >
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 border-2 border-pink-300/30 border-t-pink-300 rounded-full animate-spin" />
                    <h3 className="font-semibold text-white text-sm">
                      Generating Try-On...
                    </h3>
                  </div>

                  {/* Skeleton Image */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    {/* Animated skeleton */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-pink-500/10">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

                      {/* Center loading indicator */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          {/* Outer ring */}
                          <div className="w-16 h-16 rounded-full border-4 border-pink-500/20" />
                          {/* Spinning ring */}
                          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-pink-400 animate-spin" />
                          {/* Inner icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-pink-300 animate-pulse" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-white/80 text-sm font-medium">AI Processing</p>
                          <p className="text-white/50 text-xs mt-1">This may take a moment...</p>
                        </div>
                      </div>

                      {/* Decorative elements */}
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-pink-500/20 animate-pulse" />
                      <div className="absolute top-8 right-6 w-4 h-4 rounded-full bg-purple-500/20 animate-pulse delay-150" />
                      <div className="absolute bottom-12 left-8 w-6 h-6 rounded-full bg-pink-500/15 animate-pulse delay-300" />
                      <div className="absolute bottom-6 right-4 w-5 h-5 rounded-full bg-purple-500/15 animate-pulse delay-500" />
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Processing outfit...</span>
                      <span className="text-pink-300">Please wait</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-progress" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : hasTryOnSuccess ? (
              /* Actual Result - After successful generation */
              <GlassCard
                padding="16px"
                borderRadius="20px"
                blur="8px"
                brightness={1.05}
                glowColor="rgba(34, 197, 94, 0.3)"
                borderColor="rgba(34, 197, 94, 0.3)"
                className="bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/20"
              >
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Virtual Try-On
                      </h3>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                        title="Download image"
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                        title="Share to community"
                      >
                        {isSharing ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Share2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Try-On Image with antd Image Preview */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <Image
                      src={tryOnResult?.url || ""}
                      alt="Virtual try-on result"
                      className="w-full h-full object-cover"
                      style={{ maxHeight: "100%", objectFit: "cover" }}
                      preview={{
                        mask: (
                          <div className="flex flex-col items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            <span className="text-sm">Click to view full size</span>
                          </div>
                        ),
                        zIndex: 10001,
                      }}
                    />
                  </div>

                  {/* Helper text */}
                  <p className="text-white/50 text-xs text-center mt-3">
                    Click image to preview • Use buttons above to download or share
                  </p>
                </div>
              </GlassCard>
            ) : (
              /* Placeholder - Before clicking Virtual Try-On */
              <GlassCard
                padding="16px"
                borderRadius="20px"
                blur="8px"
                brightness={1.05}
                glowColor="rgba(148, 163, 184, 0.2)"
                borderColor="rgba(148, 163, 184, 0.3)"
                className="bg-gradient-to-br from-slate-500/10 via-gray-500/5 to-slate-500/10"
              >
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <h3 className="font-semibold text-white/70 text-sm">
                      Virtual Try-On
                    </h3>
                  </div>

                  {/* Placeholder Image Area */}
                  <div
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 cursor-pointer hover:border-pink-400/50 hover:bg-pink-500/5 transition-all duration-300 group"
                    onClick={handleTryOn}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                        <Sparkles className="w-8 h-8 text-pink-300/70 group-hover:text-pink-300 transition-colors" />
                      </div>

                      {/* Text */}
                      <div className="text-center">
                        <p className="text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors">
                          Click to Generate
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          See how this outfit looks on you
                        </p>
                      </div>

                      {/* Decorative skeleton lines */}
                      <div className="w-full space-y-2 mt-2 opacity-30">
                        <div className="h-2 bg-white/20 rounded-full w-3/4 mx-auto" />
                        <div className="h-2 bg-white/15 rounded-full w-1/2 mx-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Helper text */}
                  <p className="text-white/40 text-xs text-center mt-3">
                    Or use the button below
                  </p>
                </div>
              </GlassCard>
            )}

            {/* AI Recommendation Card */}
            <GlassCard
              padding="16px"
              borderRadius="16px"
              blur="8px"
              brightness={1.05}
              glowColor="rgba(139, 92, 246, 0.3)"
              borderColor="rgba(255, 255, 255, 0.2)"
              className="bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-purple-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm mb-1">AI Recommendation</h3>
                  <p className="text-white/80 text-xs leading-relaxed">{reason}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* Default Layout - No Try-On or Failed */
        <>
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

          {/* Items Grid - Original Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const colors = parseColor(item.color);
          const seasonItems =
            item.seasons?.map((s) => (typeof s === "string" ? s : s.name)) ||
            [];

          return (
            <div
              key={item.id}
              className="group relative w-full h-full flex flex-col"
            >
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
                    <NextImage
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
                            {colors
                              .slice(0, 6)
                              .map(
                                (
                                  color: { hex: string; name: string },
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="w-4 h-4 rounded-full border border-white/30 shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                  />
                                )
                              )}
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
                          <span className="text-white/70 truncate">
                            {item.fabric}
                          </span>
                        </div>
                      )}

                      {/* Weather */}
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 truncate">
                          {item.weatherSuitable || "N/A"}
                        </span>
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
                                  <span
                                    className={cn(
                                      "font-xs truncate",
                                      seasonData.color
                                    )}
                                  >
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
                                    <Icon
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        seasonData.color
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-white/50 text-xs col-span-2">
                            N/A
                          </span>
                        )}
                      </div>

                      {/* Styles */}
                      {item.styles && item.styles.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 truncate">
                            {item.styles
                              .map((s) => (typeof s === "string" ? s : s.name))
                              .join(", ")}
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
        </>
      )}

      {/* Action Buttons - Show for both layouts */}
      <div className="space-y-3 pt-6 mt-6 border-t border-white/10">
        {/* Button Row */}
        <div className="flex justify-center gap-3">
          {/* Add to My Outfit Button */}
          <GlassButton
            variant="custom"
            size="lg"
            onClick={handleAddToWardrobe}
            disabled={isAddingToWardrobe || isUsingOutfit || isTryingOn}
            fullWidth
            backgroundColor="rgba(59, 130, 246, 0.25)"
            borderColor="rgba(96, 165, 250, 0.5)"
            borderWidth="2px"
            glowColor="rgba(59, 130, 246, 0.4)"
            glowIntensity={12}
            className="font-poppins font-semibold h-14 hover:bg-blue-500/30 transition-all"
          >
            {isAddingToWardrobe && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            )}
            {isAddingToWardrobe ? "Adding..." : "Add to My Outfit"}
          </GlassButton>

          {/* Use This Outfit Button */}
          <GlassButton
            variant="custom"
            size="lg"
            onClick={handleUseThisOutfit}
            disabled={isAddingToWardrobe || isUsingOutfit || isTryingOn}
            fullWidth
            backgroundColor="rgba(34, 197, 94, 0.25)"
            borderColor="rgba(74, 222, 128, 0.5)"
            borderWidth="2px"
            glowColor="rgba(34, 197, 94, 0.4)"
            glowIntensity={12}
            className="font-poppins font-semibold h-14 hover:bg-green-500/30 transition-all"
          >
            {isUsingOutfit && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            )}
            {isUsingOutfit ? "Setting up..." : "Use This Outfit"}
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

      {/* View Item Dialog */}
      {selectedItemId && (
        <ViewItemDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          itemId={selectedItemId}
          zIndex={10000}
        />
      )}

      {/* Custom scrollbar and animation styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
}
