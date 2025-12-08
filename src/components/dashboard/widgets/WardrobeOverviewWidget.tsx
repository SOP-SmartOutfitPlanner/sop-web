"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, ChevronRight, Layers, Footprints, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";

interface WardrobeOverviewWidgetProps {
  stats: {
    totalItems: number;
    categoryCounts: Record<string, number>;
  };
  isLoading: boolean;
}

const categoryConfig: Record<
  string,
  { icon: typeof Shirt; color: string; gradient: string; chartColor: string }
> = {
  Top: {
    icon: Shirt,
    color: "text-blue-400",
    gradient: "from-blue-500 to-blue-600",
    chartColor: "#3B82F6",
  },
  Bottom: {
    icon: Layers,
    color: "text-green-400",
    gradient: "from-green-500 to-green-600",
    chartColor: "#22C55E",
  },
  Shoe: {
    icon: Footprints,
    color: "text-purple-400",
    gradient: "from-purple-500 to-purple-600",
    chartColor: "#A855F7",
  },
  Accessory: {
    icon: Watch,
    color: "text-amber-400",
    gradient: "from-amber-500 to-amber-600",
    chartColor: "#F59E0B",
  },
  "Full-Body": {
    icon: Shirt,
    color: "text-cyan-400",
    gradient: "from-cyan-500 to-cyan-600",
    chartColor: "#06B6D4",
  },
};

// Simple Donut Chart Component
function DonutChart({
  data,
  totalItems,
}: {
  data: { name: string; value: number; color: string }[];
  totalItems: number;
}) {
  const size = 140;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = 0;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Data segments */}
        {data.map((segment, index) => {
          const percentage = totalItems > 0 ? segment.value / totalItems : 0;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -currentAngle * circumference;
          currentAngle += percentage;

          return (
            <motion.circle
              key={segment.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{totalItems}</span>
        <span className="text-xs text-white/50">items</span>
      </div>
    </div>
  );
}

export function WardrobeOverviewWidget({
  stats,
  isLoading,
}: WardrobeOverviewWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(6, 182, 212, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
            <div>
              <Skeleton className="h-5 w-32 bg-white/10 mb-1" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <Skeleton className="h-32 w-32 rounded-full bg-white/10" />
          </div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-full rounded bg-white/10" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  const categories = Object.entries(stats.categoryCounts || {});
  const totalItems = stats.totalItems || 0;

  // Prepare chart data
  const chartData = categories.map(([category, count]) => ({
    name: category,
    value: count,
    color: categoryConfig[category]?.chartColor || "#64748B",
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(6, 182, 212, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                <Shirt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Wardrobe</h2>
                <p className="text-xs text-white/50">Category breakdown</p>
              </div>
            </div>
            <Link href="/wardrobe">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Chart and Legend */}
          {categories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <Shirt className="h-6 w-6 text-white/30" />
              </div>
              <p className="text-sm text-white/60 mb-1">No items yet</p>
              <p className="text-xs text-white/40">Add your first item</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Donut Chart */}
              <div className="flex justify-center py-2">
                <DonutChart data={chartData} totalItems={totalItems} />
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2">
                {categories.map(([category, count], index) => {
                  const config = categoryConfig[category] || {
                    icon: Shirt,
                    color: "text-slate-400",
                    chartColor: "#64748B",
                  };
                  const percentage =
                    totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;

                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.chartColor }}
                        />
                        <span className="text-white/70">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs">{count}</span>
                        <span className="text-white/30 text-xs">({percentage}%)</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
