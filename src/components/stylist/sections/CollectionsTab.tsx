"use client";

import GlassCard from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyPulseChart } from "../components/MonthlyPulseChart";
import {
  StylistCollectionHighlight,
  StylistCollectionsMonthlyStat,
  StylistCollectionsStats,
} from "@/lib/api";
import { Layers } from "lucide-react";
import { formatNumber } from "../utils";
import { UserCollectionsScreen } from "@/components/collections/UserCollectionsScreen";

interface CollectionsTabProps {
  isLoading: boolean;
  collectionsStats?: StylistCollectionsStats;
  collectionsActivityLabel: string;
  userId: number | null;
}

export function CollectionsTab({
  isLoading,
  collectionsStats,
  collectionsActivityLabel,
  userId,
}: CollectionsTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-3xl bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2">
        <MonthlyPulseChart
          title="Collections monthly pulse"
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
        <GlassCard
          padding="1.75rem"
          blur="16px"
          glowColor="rgba(59, 130, 246, 0.2)"
          className="border border-white/10 bg-slate-950/60 text-white"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Quick insight
          </p>
          <h3 className="mt-2 text-3xl font-semibold">
            {collectionsActivityLabel}
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Followers gained this period:{" "}
            {formatNumber(collectionsStats?.followersThisMonth)}
          </p>
        </GlassCard>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">Top collections</h3>
            <p className="text-sm text-white/70">
              Highlighted by engagement during the selected period.
            </p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {(collectionsStats?.topCollections ?? []).length === 0 && (
            <GlassCard
              padding="2rem"
              blur="12px"
              className="border border-dashed border-white/20 bg-transparent text-center text-white"
            >
              <p>No standout collections yet.</p>
              <p className="text-sm text-white/70">
                Publish a new collection and drive engagement to show up here.
              </p>
            </GlassCard>
          )}
          {(collectionsStats?.topCollections ?? []).map(
            (collection: StylistCollectionHighlight) => (
              <GlassCard
                key={collection.id}
                padding="1.5rem"
                blur="14px"
                className="border border-white/10 bg-slate-900/70 text-white"
              >
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl">
                    <div
                      className="h-44 w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${collection.thumbnailURL})`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-semibold">{collection.title}</h4>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        collection.isPublished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      {collection.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">
                    {collection.shortDescription}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/80">
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="font-semibold">{collection.likeCount}</p>
                      <p>Likes</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="font-semibold">{collection.commentCount}</p>
                      <p>Comments</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2">
                      <p className="font-semibold">{collection.saveCount}</p>
                      <p>Saves</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          )}
        </div>
      </section>

      {userId && (
        <section className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              Manage your collections
            </h3>
            <p className="text-sm text-white/70">
              Reuse the full stylist collection workspace without leaving the studio.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <UserCollectionsScreen userId={userId} variant="embedded" />
          </div>
        </section>
      )}
    </>
  );
}

