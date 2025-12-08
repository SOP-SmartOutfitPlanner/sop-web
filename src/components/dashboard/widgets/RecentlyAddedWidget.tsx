"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shirt, ChevronRight, Clock, Sparkles, Plus } from "lucide-react";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";

interface RecentlyAddedWidgetProps {
  items: ApiWardrobeItem[];
  isLoading: boolean;
}

function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentlyAddedWidget({
  items,
  isLoading,
}: RecentlyAddedWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(99, 102, 241, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5 h-full"
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              <div>
                <Skeleton className="h-5 w-40 bg-white/10 mb-1" />
                <Skeleton className="h-3 w-24 bg-white/10" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 bg-white/10 mb-1" />
                  <Skeleton className="h-3 w-16 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="h-full"
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(99, 102, 241, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5 h-full"
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recently Added</h2>
                <p className="text-xs text-white/50">Latest wardrobe items</p>
              </div>
            </div>
            <Link href="/wardrobe">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
                <Plus className="h-8 w-8 text-white/30" />
              </div>
              <p className="text-white/60 mb-2">No items yet</p>
              <p className="text-sm text-white/40 mb-4">
                Add your first item to get started
              </p>
              <Link href="/wardrobe">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2 transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/10"
                >
                  {/* Item Image */}
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-white/5 flex-shrink-0">
                    {item.imgUrl ? (
                      <Image
                        src={item.imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Shirt className="h-6 w-6 text-white/20" />
                      </div>
                    )}

                    {/* AI Badge */}
                    {item.isAnalyzed && (
                      <div className="absolute -right-1 -top-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                          <Sparkles className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40 capitalize">
                        {item.categoryName || "Uncategorized"}
                      </span>
                      {item.createdAt && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-xs text-white/40">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Colors Preview */}
                  {item.color && (
                    <div className="flex -space-x-1">
                      {(() => {
                        try {
                          const colors = JSON.parse(item.color as unknown as string);
                          if (Array.isArray(colors)) {
                            return colors.slice(0, 3).map((c: { hex?: string }, i: number) => (
                              <div
                                key={i}
                                className="h-4 w-4 rounded-full border border-white/20"
                                style={{ backgroundColor: c?.hex || "#808080" }}
                              />
                            ));
                          }
                        } catch {
                          return null;
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
