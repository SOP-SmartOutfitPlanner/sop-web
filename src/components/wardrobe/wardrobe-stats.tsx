"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Shirt } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { Skeleton } from "../ui/skeleton";

interface WardrobeStats {
  totalItems: number;
  categoryCounts: Record<string, number>;
}

export function WardrobeStats() {
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await wardrobeAPI.getUserStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Wardrobe Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} padding="16px" className="h-32">
              <Skeleton className="h-full w-full" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const categoryEntries = Object.entries(stats.categoryCounts);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Wardrobe Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Items Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <GlassCard
            padding="16px"
            borderRadius="12px"
            className="h-full hover:scale-105 transition-transform duration-200"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {stats.totalItems}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Items
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Category Cards */}
        {categoryEntries.map(([category, count], index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index + 1) * 0.05 }}
          >
            <GlassCard
              padding="16px"
              borderRadius="12px"
              className="h-full hover:scale-105 transition-transform duration-200"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Shirt className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {category}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
