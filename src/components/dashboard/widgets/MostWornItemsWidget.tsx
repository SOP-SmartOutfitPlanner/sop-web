"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shirt, ChevronRight, TrendingUp, Sparkles } from "lucide-react";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";

interface MostWornItemsWidgetProps {
  items: ApiWardrobeItem[];
  isLoading: boolean;
}

export function MostWornItemsWidget({
  items,
  isLoading,
}: MostWornItemsWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(217, 70, 239, 0.2)"
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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="aspect-square rounded-xl bg-white/10"
              />
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
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-full"
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(217, 70, 239, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5 h-full"
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Most Worn</h2>
                <p className="text-xs text-white/50">Your favorite items</p>
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

          {/* Items Grid */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
                <Shirt className="h-8 w-8 text-white/30" />
              </div>
              <p className="text-white/60 mb-2">No items worn yet</p>
              <p className="text-sm text-white/40 mb-4">
                Start wearing your outfits to see stats
              </p>
              <Link href="/wardrobe">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40"
                >
                  <Shirt className="h-4 w-4 mr-2" />
                  View Wardrobe
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-fuchsia-500/30 group-hover:shadow-lg group-hover:shadow-fuchsia-500/20 backdrop-blur-sm">
                    {item.imgUrl ? (
                      <Image
                        src={item.imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Shirt className="h-8 w-8 text-white/20" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Worn count badge */}
                    <div className="absolute bottom-1 left-1 right-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex items-center justify-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3 text-fuchsia-400" />
                        <span className="text-xs font-medium text-white">
                          {item.frequencyWorn || 0}x
                        </span>
                      </div>
                    </div>

                    {/* AI analyzed badge */}
                    {item.isAnalyzed && (
                      <div className="absolute right-1 top-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item name on hover */}
                  <p className="mt-2 truncate text-xs text-white/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.name}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
