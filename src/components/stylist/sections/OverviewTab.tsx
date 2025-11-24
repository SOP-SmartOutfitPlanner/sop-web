"use client";

import GlassCard from "@/components/ui/glass-card";
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
import { formatNumber } from "../utils";

interface OverviewTabProps {
  isLoading: boolean;
  collectionCards: StatCardConfig[];
  postsCards: StatCardConfig[];
  collectionsStats?: StylistCollectionsStats;
  postsStats?: StylistPostsStats;
}

export function OverviewTab({
  isLoading,
  collectionCards,
  postsCards,
  collectionsStats,
  postsStats,
}: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-3xl bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2">
        {collectionCards.map((card) => (
          <GlassCard
            key={card.label}
            padding="1.75rem"
            blur="16px"
            glowColor="rgba(59, 130, 246, 0.2)"
            className="border border-white/10 bg-slate-950/50 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-3">{card.icon}</div>
              <div>
                <p className="text-sm text-white/60">{card.label}</p>
                <p className="text-3xl font-semibold">
                  {formatNumber(card.value)}
                </p>
                {card.subLabel && (
                  <p className="text-xs text-white/60">{card.subLabel}</p>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
        {postsCards.map((card) => (
          <GlassCard
            key={card.label}
            padding="1.75rem"
            blur="16px"
            glowColor="rgba(59, 130, 246, 0.2)"
            className="border border-white/10 bg-slate-950/50 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-3">{card.icon}</div>
              <div>
                <p className="text-sm text-white/60">{card.label}</p>
                <p className="text-3xl font-semibold">
                  {formatNumber(card.value)}
                </p>
                {card.subLabel && (
                  <p className="text-xs text-white/60">{card.subLabel}</p>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <MonthlyPulseChart
          title="Collections pulse"
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
          title="Posts pulse"
          icon={<FileText className="h-5 w-5 text-sky-400" />}
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
    </>
  );
}

