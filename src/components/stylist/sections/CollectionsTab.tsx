"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyPulseChart } from "../components/MonthlyPulseChart";
import {
  StylistCollectionHighlight,
  StylistCollectionsMonthlyStat,
  StylistCollectionsStats,
} from "@/lib/api";
import { Layers } from "lucide-react";
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
      <div className="space-y-6">
        <Skeleton className="h-96 rounded-3xl bg-white/10" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <section>
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
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Top performing collections</h3>
          <p className="text-sm text-white/60">
            Your most engaging collections this period
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(collectionsStats?.topCollections ?? []).length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
              <Layers className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 text-lg font-semibold text-white/60">No collections yet</p>
              <p className="mt-1 text-sm text-white/40">
                Create and publish collections to see them here
              </p>
            </div>
          )}
          {(collectionsStats?.topCollections ?? []).map(
            (collection: StylistCollectionHighlight) => (
              <div
                key={collection.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${collection.thumbnailURL})`,
                    }}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-lg font-bold text-white line-clamp-1">{collection.title}</h4>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        collection.isPublished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {collection.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">
                    {collection.shortDescription}
                  </p>
                  <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{collection.likeCount}</p>
                      <p className="text-xs text-white/60">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{collection.commentCount}</p>
                      <p className="text-xs text-white/60">Comments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{collection.saveCount}</p>
                      <p className="text-xs text-white/60">Saves</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* {userId && (
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
      )} */}
    </>
  );
}

