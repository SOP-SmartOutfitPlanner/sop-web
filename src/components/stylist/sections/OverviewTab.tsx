"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyPulseChart } from "../components/MonthlyPulseChart";
import {
  StylistCollectionsMonthlyStat,
  StylistCollectionsStats,
  StylistPostsMonthlyStat,
  StylistPostsStats,
} from "@/lib/api";
import { StatCardConfig } from "../types";
import { Layers, FileText } from "lucide-react";

interface OverviewTabProps {
  isLoading: boolean;
  collectionCards: StatCardConfig[];
  postsCards: StatCardConfig[];
  collectionsStats?: StylistCollectionsStats;
  postsStats?: StylistPostsStats;
}

export function OverviewTab({
  isLoading,
  collectionsStats,
  postsStats,
}: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-3xl bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <MonthlyPulseChart
        title="Collections activity"
        icon={<Layers className="h-5 w-5 text-cyan-400" />}
        stats={collectionsStats?.monthlyStats}
        emptyMessage="No collection activity for the selected period."
        extraLabel="💾 Saves:"
        color={{
          stroke: "#22d3ee",
          gradientFrom: "rgba(34, 211, 238, 0.9)",
          gradientTo: "rgba(34, 211, 238, 0.1)",
        }}
        mapExtra={(stat) =>
          (stat as StylistCollectionsMonthlyStat).savesReceived
        }
      />
      <MonthlyPulseChart
        title="Community activity"
        icon={<FileText className="h-5 w-5 text-purple-400" />}
        stats={postsStats?.monthlyStats}
        emptyMessage="No posts were published during this time range."
        extraLabel="📝 Posts:"
        color={{
          stroke: "#c084fc",
          gradientFrom: "rgba(192, 132, 252, 0.9)",
          gradientTo: "rgba(192, 132, 252, 0.1)",
        }}
        mapExtra={(stat) => (stat as StylistPostsMonthlyStat).postsCreated}
      />
    </section>
  );
}

