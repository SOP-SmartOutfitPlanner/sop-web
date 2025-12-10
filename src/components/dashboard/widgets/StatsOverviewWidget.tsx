"use client";

import { motion } from "framer-motion";
import {
  Shirt,
  TrendingUp,
  Sparkles,
  Layers,
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";

interface StatsOverviewWidgetProps {
  totalItems: number;
  analyzedItems: number;
  totalWornCount: number;
  categoryCount: number;
  isLoading: boolean;
}

interface StatCardProps {
  icon: typeof Shirt;
  label: string;
  value: string | number;
  subtext?: string;
  gradient: string;
  glowColor: string;
  delay: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  gradient,
  glowColor,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <GlassCard
        padding="1.25rem"
        blur="12px"
        brightness={1.1}
        glowColor={glowColor}
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1rem"
        className="bg-white/5 h-full"
      >
        <div className="flex items-center gap-4 w-full">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">
              {label}
            </p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtext && (
              <p className="text-xs text-white/40 truncate">{subtext}</p>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function StatsOverviewWidget({
  totalItems,
  analyzedItems,
  totalWornCount,
  categoryCount,
  isLoading,
}: StatsOverviewWidgetProps) {
  const analyzedPercentage =
    totalItems > 0 ? Math.round((analyzedItems / totalItems) * 100) : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard
            key={i}
            padding="1.25rem"
            blur="12px"
            brightness={1.1}
            glowColor="rgba(255, 255, 255, 0.1)"
            glowIntensity={6}
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="1rem"
            className="bg-white/5"
          >
            <div className="flex items-center gap-4 w-full">
              <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16 bg-white/10 mb-2" />
                <Skeleton className="h-7 w-12 bg-white/10" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Shirt}
        label="Total Items"
        value={totalItems}
        subtext="in your wardrobe"
        gradient="from-cyan-500 to-blue-600"
        glowColor="rgba(6, 182, 212, 0.3)"
        delay={0}
      />
      <StatCard
        icon={Layers}
        label="Categories"
        value={categoryCount}
        subtext="item categories"
        gradient="from-amber-500 to-orange-600"
        glowColor="rgba(245, 158, 11, 0.3)"
        delay={0.05}
      />
      <StatCard
        icon={Sparkles}
        label="AI Analyzed"
        value={`${analyzedPercentage}%`}
        subtext={`${analyzedItems} of ${totalItems}`}
        gradient="from-indigo-500 to-purple-600"
        glowColor="rgba(99, 102, 241, 0.3)"
        delay={0.1}
      />
      <StatCard
        icon={TrendingUp}
        label="Times Worn"
        value={totalWornCount}
        subtext="total wears"
        gradient="from-fuchsia-500 to-pink-600"
        glowColor="rgba(217, 70, 239, 0.3)"
        delay={0.15}
      />
    </div>
  );
}

// Helper function to calculate stats from items
export function calculateStatsFromItems(items: ApiWardrobeItem[]) {
  const totalItems = items.length;
  const analyzedItems = items.filter((item) => item.isAnalyzed).length;
  const totalWornCount = items.reduce((acc, item) => {
    const worn = item.frequencyWorn ? parseInt(item.frequencyWorn) : 0;
    return acc + worn;
  }, 0);

  // Calculate unique categories
  const categorySet = new Set<string>();
  items.forEach((item) => {
    if (item.categoryName) {
      categorySet.add(item.categoryName);
    }
  });
  const categoryCount = categorySet.size;

  return {
    totalItems,
    analyzedItems,
    totalWornCount,
    categoryCount,
  };
}
