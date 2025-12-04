"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Edit, Sparkles, ArrowLeft, ExternalLink } from "lucide-react";
import { Image } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { wardrobeAPI, AIAnalysisData } from "@/lib/api/wardrobe-api";
import { ItemHistoryDialog } from "./ItemHistoryDialog";

export interface ViewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  onEdit?: () => void;
  savedFromPost?: {
    postId: number;
    postBody: string;
    postUserId: number;
    postUserDisplayName: string;
  };
  onOpenPost?: (postId: number) => void;
  isPostLoading?: boolean;
}

interface ColorOption {
  name: string;
  hex: string;
}

interface ViewItemData {
  name: string;
  category: string;
  colors: ColorOption[];
  brand: string;
  frequencyWorn: string;
  lastWornAt?: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  styles: string[];
  occasions: string[];
  seasons: string[];
  aiDescription: string;
  aiConfidence?: number;
  isAnalyzed?: boolean;
}

export function ViewItemDialog({
  open,
  onOpenChange,
  itemId,
  onEdit,
  savedFromPost,
  onOpenPost,
  isPostLoading = false,
  zIndex,
}: ViewItemDialogProps & { zIndex?: number }) {
  const [isLoading, setIsLoading] = useState(true);
  const [itemData, setItemData] = useState<ViewItemData | null>(null);
  const [originalData, setOriginalData] = useState<ViewItemData | null>(null);
  const [aiAnalysisData, setAiAnalysisData] = useState<AIAnalysisData | null>(
    null
  );
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchItemData = useCallback(async () => {
    setIsLoading(true);
    setShowAiAnalysis(false); // Reset AI analysis view when fetching new data
    try {
      const item = await wardrobeAPI.getItem(itemId);

      // Parse colors from string to ColorOption array
      let parsedColors: ColorOption[] = [];
      if (item.color) {
        try {
          parsedColors = JSON.parse(item.color);
        } catch {
          // If parsing fails, treat as empty array
          parsedColors = [];
        }
      }

      const originalItemData = {
        name: item.name || "",
        category: item.categoryName || "N/A",
        colors: parsedColors,
        brand: item.brand || "N/A",
        frequencyWorn: item.frequencyWorn || "N/A",
        lastWornAt: item.lastWornAt,
        imgUrl: item.imgUrl,
        weatherSuitable: item.weatherSuitable || "N/A",
        condition: item.condition || "N/A",
        pattern: item.pattern || "N/A",
        fabric: item.fabric || "N/A",
        styles: item.styles?.map((s) => s.name) || [],
        occasions: item.occasions?.map((o) => o.name) || [],
        seasons: item.seasons?.map((s) => s.name) || [],
        aiDescription: item.aiDescription || "",
        aiConfidence: item.aiConfidence,
        isAnalyzed: item.isAnalyzed,
      };

      setItemData(originalItemData);
      setOriginalData(originalItemData);

      // Parse AI analysis JSON if available
      if (item.aiAnalyzeJson) {
        try {
          const parsedAiData: AIAnalysisData = JSON.parse(item.aiAnalyzeJson);
          setAiAnalysisData(parsedAiData);
        } catch (error) {
          console.error("Failed to parse AI analysis JSON:", error);
          setAiAnalysisData(null);
        }
      } else {
        setAiAnalysisData(null);
      }
    } catch (error) {
      console.error("Failed to fetch item:", error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (open) {
      fetchItemData();
    }
  }, [open, fetchItemData]);

  const handleViewAiAnalysis = useCallback(() => {
    if (!aiAnalysisData || !originalData) return;

    // Override item data with AI analysis data
    setItemData({
      name: originalData.name, // Keep original name
      category: originalData.category, // We can map categoryId if needed
      colors: aiAnalysisData.colors,
      brand: originalData.brand, // Keep original brand
      frequencyWorn: originalData.frequencyWorn, // Keep original frequency
      lastWornAt: originalData.lastWornAt, // Keep original last worn
      imgUrl: originalData.imgUrl, // Keep original image
      weatherSuitable: aiAnalysisData.weatherSuitable,
      condition: aiAnalysisData.condition,
      pattern: aiAnalysisData.pattern,
      fabric: aiAnalysisData.fabric,
      styles: aiAnalysisData.styles.map((s) => s.name),
      occasions: aiAnalysisData.occasions.map((o) => o.name),
      seasons: aiAnalysisData.seasons.map((s) => s.name),
      aiDescription: aiAnalysisData.aiDescription,
      aiConfidence: aiAnalysisData.confidence,
      isAnalyzed: true,
    });
    setShowAiAnalysis(true);
  }, [aiAnalysisData, originalData]);

  const handleBackToOriginal = useCallback(() => {
    if (originalData) {
      setItemData(originalData);
      setShowAiAnalysis(false);
    }
  }, [originalData]);

  const renderField = (
    label: string,
    value: string | undefined,
    originalValue: string | undefined
  ) => {
    const hasChanged = showAiAnalysis && value !== originalValue;
    return (
      <div>
        <p className="text-lg font-medium text-white mb-1.5">{label}</p>
        <div className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">
          <p>{value || "N/A"}</p>
          {hasChanged && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/50 mb-0.5">Current Value:</p>
              <p className="text-yellow-200/90">{originalValue || "N/A"}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed h-full inset-0 bg-black/50 backdrop-blur-sm ${
          zIndex ? `z-[${zIndex}]` : "z-[60]"
        }`}
        style={zIndex ? { zIndex } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(false);
        }}
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-0 ${
          zIndex ? `z-[${zIndex + 1}]` : "z-[61]"
        } flex items-center justify-center p-4 pointer-events-none`}
        style={zIndex ? { zIndex: zIndex + 1 } : undefined}
      >
        <ItemHistoryDialog
          open={showHistory}
          onOpenChange={setShowHistory}
          itemId={itemId}
          itemName={itemData?.name || ""}
        />
        <div
          className="w-[1400px] max-w-[95vw] h-[95vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95">
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    {showAiAnalysis ? "AI Analysis View" : "Item Details"}
                  </h2>
                  <p className="font-bricolage text-sm text-gray-200 mt-0.5">
                    {showAiAnalysis
                      ? "Viewing AI-analyzed item attributes"
                      : "View your wardrobe item information"}
                  </p>
                </div>
                {itemData?.isAnalyzed &&
                  itemData?.aiConfidence &&
                  itemData.aiConfidence < 60 && (
                    <div
                      className="px-5 py-2 rounded-full bg-red-500/40 border border-red-400/50 backdrop-blur-md flex items-center gap-2 shadow-inner"
                      aria-live="polite"
                    >
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-300 animate-pulse" />
                      <div className="flex flex-col leading-tight">
                        <span className="text-red-100 text-sm font-semibold">
                          Unclear item – AI analysis may be inaccurate.
                        </span>
                      </div>
                    </div>
                  )}
                <div className="flex items-center gap-2">
                  {showAiAnalysis ? (
                    <GlassButton
                      onClick={handleBackToOriginal}
                      variant="custom"
                      size="sm"
                      borderRadius="12px"
                      blur="8px"
                      brightness={1.1}
                      glowColor="rgba(156, 163, 175, 0.4)"
                      glowIntensity={4}
                      borderColor="rgba(156, 163, 175, 0.3)"
                      borderWidth="1px"
                      textColor="#ffffff"
                      backgroundColor="rgba(156, 163, 175, 0.2)"
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Original
                    </GlassButton>
                  ) : (
                    <>
                      {aiAnalysisData && (
                        <GlassButton
                          onClick={handleViewAiAnalysis}
                          variant="custom"
                          size="sm"
                          borderRadius="12px"
                          blur="8px"
                          brightness={1.1}
                          glowColor="rgba(168, 85, 247, 0.4)"
                          glowIntensity={4}
                          borderColor="rgba(168, 85, 247, 0.3)"
                          borderWidth="1px"
                          textColor="#ffffff"
                          backgroundColor="rgba(168, 85, 247, 0.2)"
                          className="gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          View AI Analysis
                        </GlassButton>
                      )}
                      {savedFromPost && onOpenPost && (
                        <GlassButton
                          onClick={() => onOpenPost(savedFromPost.postId)}
                          disabled={isPostLoading}
                          variant="custom"
                          size="sm"
                          borderRadius="12px"
                          blur="8px"
                          brightness={1.1}
                          glowColor="rgba(34, 211, 238, 0.4)"
                          glowIntensity={4}
                          borderColor="rgba(34, 211, 238, 0.3)"
                          borderWidth="1px"
                          textColor="#ffffff"
                          backgroundColor="rgba(34, 211, 238, 0.2)"
                          className="gap-2"
                        >
                          {isPostLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                          View Post
                        </GlassButton>
                      )}
                      {!savedFromPost && onEdit && (
                        <GlassButton
                          onClick={onEdit}
                          variant="custom"
                          size="sm"
                          borderRadius="12px"
                          blur="8px"
                          brightness={1.1}
                          glowColor="rgba(59, 130, 246, 0.4)"
                          glowIntensity={4}
                          borderColor="rgba(59, 130, 246, 0.3)"
                          borderWidth="1px"
                          textColor="#ffffff"
                          backgroundColor="rgba(59, 130, 246, 0.2)"
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </GlassButton>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white/70">Loading item details...</p>
                  </div>
                </div>
              ) : itemData ? (
                <div className="grid grid-cols-3 gap-3 h-full overflow-hidden">
                  {/* Column 1: Image, Name, Colors */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <p className="text-lg font-medium text-white mb-1.5">
                        Image
                      </p>
                      <div className="aspect-square rounded-xl overflow-hidden bg-white/5 relative">
                        <Image
                          src={itemData.imgUrl}
                          alt={itemData.name}
                          className="w-full h-full object-cover"
                          preview={{
                            mask: (
                              <div className="text-white">Click to preview</div>
                            ),
                          }}
                        />
                        {itemData.isAnalyzed &&
                          itemData.aiConfidence &&
                          itemData.aiConfidence > 50 && (
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-white/50 ${
                                  showAiAnalysis
                                    ? "bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse"
                                    : "bg-gradient-to-br from-cyan-400 to-blue-500"
                                }`}
                              >
                                <span className="text-[10px] font-bold text-white">
                                  AI
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-shrink-0">
                      <p className="text-lg font-medium text-white mb-1.5">
                        Name
                      </p>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">
                        {itemData.name}
                      </p>
                    </div>

                    {/* Colors */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      <p className="text-lg font-medium text-white mb-1.5 flex-shrink-0">
                        Colors
                      </p>
                      <div className="flex gap-2 flex-wrap overflow-y-auto custom-scrollbar">
                        {itemData.colors.length > 0 ? (
                          itemData.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-9 h-9 rounded-lg border-2 border-white/30 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                              title={color.hex}
                            />
                          ))
                        ) : (
                          <p className="text-white/50 text-sm">No colors</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Details */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 overflow-y-auto custom-scrollbar space-y-3">
                    {/* Category */}
                    {renderField(
                      "Category",
                      itemData.category,
                      originalData?.category
                    )}

                    {/* Brand */}
                    {renderField("Brand", itemData.brand, originalData?.brand)}

                    {/* Pattern */}
                    {renderField(
                      "Pattern",
                      itemData.pattern,
                      originalData?.pattern
                    )}

                    {/* Fabric */}
                    {renderField(
                      "Fabric",
                      itemData.fabric,
                      originalData?.fabric
                    )}

                    {/* Condition */}
                    {renderField(
                      "Condition",
                      itemData.condition,
                      originalData?.condition
                    )}

                    {/* Last Worn */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-lg font-medium text-white">
                          Last Worn
                        </p>
                        <button
                          onClick={() => setShowHistory(true)}
                          className="text-xs text-blue-300 hover:text-blue-200 underline"
                        >
                          View History
                        </button>
                      </div>
                      <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm">
                        {itemData.lastWornAt
                          ? new Date(itemData.lastWornAt).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Never worn"}
                      </p>
                    </div>

                    {/* AI Analysis Data */}
                    {showAiAnalysis && (
                      <>
                        {/* AI Confidence */}
                        {itemData.aiConfidence !== undefined && (
                          <div className="flex items-center gap-4 mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="20"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="transparent"
                                  className="text-white/10"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="20"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 20}
                                  strokeDashoffset={
                                    2 *
                                    Math.PI *
                                    20 *
                                    (1 - itemData.aiConfidence / 100)
                                  }
                                  className={
                                    itemData.aiConfidence >= 80
                                      ? "text-green-400"
                                      : itemData.aiConfidence >= 60
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {itemData.aiConfidence}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                AI Confidence
                              </p>
                              <p className="text-xs text-white/60">
                                {itemData.aiConfidence >= 80
                                  ? "High confidence"
                                  : itemData.aiConfidence >= 60
                                  ? "Moderate confidence"
                                  : "Low confidence"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* AI Description */}
                        {itemData.aiDescription && (
                          <div>
                            <p className="text-lg font-medium text-white mb-1.5">
                              AI Description
                            </p>
                            <p className="text-white/90 bg-white/10 rounded-lg px-3 py-2 text-sm italic leading-relaxed">
                              {itemData.aiDescription}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Column 3: Tags */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 overflow-y-auto custom-scrollbar space-y-3">
                    {/* Weather Suitable */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">
                        Weather Suitable
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.weatherSuitable ? (
                          itemData.weatherSuitable
                            .split(", ")
                            .map((weather, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 rounded-md bg-orange-500/20 border border-orange-400/30 text-orange-200 text-md"
                              >
                                {weather}
                              </span>
                            ))
                        ) : (
                          <p className="text-white/50 text-xs">
                            No weather info
                          </p>
                        )}
                      </div>
                      {showAiAnalysis &&
                        itemData.weatherSuitable !==
                          originalData?.weatherSuitable && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-white/50 mb-0.5">
                              Current Value:
                            </p>
                            <p className="text-yellow-200/90 text-sm">
                              {originalData?.weatherSuitable || "N/A"}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Styles */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">
                        Styles
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.styles.length > 0 ? (
                          itemData.styles.map((style, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-md"
                            >
                              {style}
                            </span>
                          ))
                        ) : (
                          <p className="text-white/50 text-xs">No styles</p>
                        )}
                      </div>
                      {showAiAnalysis &&
                        JSON.stringify(itemData.styles.slice().sort()) !==
                          JSON.stringify(
                            originalData?.styles.slice().sort()
                          ) && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-white/50 mb-0.5">
                              Current Value:
                            </p>
                            <p className="text-yellow-200/90 text-sm">
                              {originalData?.styles.join(", ") || "N/A"}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Occasions */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">
                        Occasions
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.occasions.length > 0 ? (
                          itemData.occasions.map((occasion, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-200 text-md"
                            >
                              {occasion}
                            </span>
                          ))
                        ) : (
                          <p className="text-white/50 text-xs">No occasions</p>
                        )}
                      </div>
                      {showAiAnalysis &&
                        JSON.stringify(itemData.occasions.slice().sort()) !==
                          JSON.stringify(
                            originalData?.occasions.slice().sort()
                          ) && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-white/50 mb-0.5">
                              Current Value:
                            </p>
                            <p className="text-yellow-200/90 text-sm">
                              {originalData?.occasions.join(", ") || "N/A"}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Seasons */}
                    <div>
                      <p className="text-lg font-medium text-white mb-1.5">
                        Seasons
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {itemData.seasons.length > 0 ? (
                          itemData.seasons.map((season, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-md"
                            >
                              {season}
                            </span>
                          ))
                        ) : (
                          <p className="text-white/50 text-xs">No seasons</p>
                        )}
                      </div>
                      {showAiAnalysis &&
                        JSON.stringify(itemData.seasons.slice().sort()) !==
                          JSON.stringify(
                            originalData?.seasons.slice().sort()
                          ) && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-white/50 mb-0.5">
                              Current Value:
                            </p>
                            <p className="text-yellow-200/90 text-sm">
                              {originalData?.seasons.join(", ") || "N/A"}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white/70">Failed to load item details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
