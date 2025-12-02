"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  User,
  Calendar,
  Tag,
  Shirt,
  Palette,
  Sun,
  Leaf,
  Flower2,
  Snowflake,
  Star,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { wardrobeAPI, AIAnalysisData } from "@/lib/api/wardrobe-api";
import { useQuery } from "@tanstack/react-query";

interface ViewItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number | null;
}

interface ColorOption {
  name: string;
  hex: string;
}

export function ViewItemModal({
  open,
  onOpenChange,
  itemId,
}: ViewItemModalProps) {
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  // Fetch item data
  const { data: item, isLoading } = useQuery({
    queryKey: ["admin-wardrobe-item", itemId],
    queryFn: () => (itemId ? wardrobeAPI.getItem(itemId) : null),
    enabled: open && !!itemId,
    staleTime: 0,
  });

  // Parse colors
  const parseColors = useCallback((colorString?: string): ColorOption[] => {
    if (!colorString) return [];
    try {
      const parsed = JSON.parse(colorString);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  // Parse AI analysis
  const aiAnalysisData: AIAnalysisData | null = (() => {
    if (!item?.aiAnalyzeJson) return null;
    try {
      return JSON.parse(item.aiAnalyzeJson);
    } catch {
      return null;
    }
  })();

  const colors = parseColors(item?.color);

  // Get season icon
  const getSeasonIcon = (seasonName: string) => {
    const name = seasonName.toLowerCase();
    if (name === "spring") return Flower2;
    if (name === "summer") return Sun;
    if (name === "fall" || name === "autumn") return Leaf;
    if (name === "winter") return Snowflake;
    return Tag;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Item Details
            </span>
            {item?.isAnalyzed && aiAnalysisData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAiAnalysis(!showAiAnalysis)}
                className={`${
                  showAiAnalysis
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-white/10"
                } hover:bg-white/20`}
              >
                {showAiAnalysis ? (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Original
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    View AI Analysis
                  </>
                )}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : item ? (
          <div className="space-y-6 py-4">
            {/* Image */}
            <div className="relative w-full h-96 rounded-xl overflow-hidden bg-white/5">
              <Image
                src={item.imgUrl}
                alt={item.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              {item.isAnalyzed && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Analyzed
                    {item.aiConfidence && (
                      <span className="ml-1">
                        ({Math.round(item.aiConfidence * 100)}%)
                      </span>
                    )}
                  </Badge>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {item.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="border-cyan-400/30 text-cyan-300"
                >
                  <Shirt className="w-3 h-3 mr-1" />
                  {item.categoryName || "N/A"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/20 text-white/70"
                >
                  <User className="w-3 h-3 mr-1" />
                  {item.userDisplayName || `User #${item.userId}`}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/20 text-white/70"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.createdAt)}
                </Badge>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Colors */}
                {colors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Colors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm text-white">
                            {color.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Description */}
                {(showAiAnalysis ? aiAnalysisData?.aiDescription : item.aiDescription) && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">
                      Description
                    </h4>
                    <p className="text-white/80 text-sm leading-relaxed p-4 rounded-lg bg-white/5 border border-white/10">
                      {showAiAnalysis
                        ? aiAnalysisData?.aiDescription
                        : item.aiDescription}
                    </p>
                  </div>
                )}

                {/* Brand */}
                {item.brand && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">
                      Brand
                    </h4>
                    <p className="text-white/80">{item.brand}</p>
                  </div>
                )}
              </TabsContent>

              {/* Attributes Tab */}
              <TabsContent value="attributes" className="space-y-4 mt-4">
                {/* Seasons */}
                {(showAiAnalysis ? aiAnalysisData?.seasons : item.seasons) &&
                  (showAiAnalysis ? aiAnalysisData?.seasons : item.seasons)!
                    .length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Seasons
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(showAiAnalysis
                          ? aiAnalysisData?.seasons
                          : item.seasons
                        )!.map((season: string | { name: string }, index: number) => {
                          const seasonName =
                            typeof season === "string" ? season : season.name;
                          const SeasonIcon = getSeasonIcon(seasonName);
                          return (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-white/20 text-white"
                            >
                              <SeasonIcon className="w-3 h-3 mr-1" />
                              {seasonName}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Styles */}
                {(showAiAnalysis ? aiAnalysisData?.styles : item.styles) &&
                  (showAiAnalysis ? aiAnalysisData?.styles : item.styles)!
                    .length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Styles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(showAiAnalysis
                          ? aiAnalysisData?.styles
                          : item.styles
                        )!.map((style: string | { name: string }, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-purple-400/30 text-purple-300"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {typeof style === "string" ? style : style.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Occasions */}
                {(showAiAnalysis ? aiAnalysisData?.occasions : item.occasions) &&
                  (showAiAnalysis ? aiAnalysisData?.occasions : item.occasions)!
                    .length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Occasions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(showAiAnalysis
                          ? aiAnalysisData?.occasions
                          : item.occasions
                        )!.map((occasion: string | { name: string }, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-pink-400/30 text-pink-300"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {typeof occasion === "string"
                              ? occasion
                              : occasion.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Pattern & Fabric */}
                <div className="grid grid-cols-2 gap-4">
                  {(showAiAnalysis ? aiAnalysisData?.pattern : item.pattern) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Pattern
                      </h4>
                      <p className="text-white/80">
                        {showAiAnalysis
                          ? aiAnalysisData?.pattern
                          : item.pattern}
                      </p>
                    </div>
                  )}
                  {(showAiAnalysis ? aiAnalysisData?.fabric : item.fabric) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Fabric
                      </h4>
                      <p className="text-white/80">
                        {showAiAnalysis ? aiAnalysisData?.fabric : item.fabric}
                      </p>
                    </div>
                  )}
                </div>

                {/* Weather & Condition */}
                <div className="grid grid-cols-2 gap-4">
                  {(showAiAnalysis
                    ? aiAnalysisData?.weatherSuitable
                    : item.weatherSuitable) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Weather Suitable
                      </h4>
                      <p className="text-white/80">
                        {showAiAnalysis
                          ? aiAnalysisData?.weatherSuitable
                          : item.weatherSuitable}
                      </p>
                    </div>
                  )}
                  {(showAiAnalysis ? aiAnalysisData?.condition : item.condition) && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Condition
                      </h4>
                      <p className="text-white/80">
                        {showAiAnalysis
                          ? aiAnalysisData?.condition
                          : item.condition}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Metadata Tab */}
              <TabsContent value="metadata" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">
                      Item ID
                    </h4>
                    <p className="text-white/80">#{item.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">
                      User ID
                    </h4>
                    <p className="text-white/80">#{item.userId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">
                      Created Date
                    </h4>
                    <p className="text-white/80">{formatDate(item.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 mb-2">
                      Updated Date
                    </h4>
                    <p className="text-white/80">{formatDate(item.updatedAt)}</p>
                  </div>
                  {item.frequencyWorn && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Frequency Worn
                      </h4>
                      <p className="text-white/80">{item.frequencyWorn}</p>
                    </div>
                  )}
                  {item.lastWornAt && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">
                        Last Worn At
                      </h4>
                      <p className="text-white/80">
                        {formatDate(item.lastWornAt)}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/70">Item not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
