"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collectionAPI, CollectionRecord } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CollectionCard } from "./CollectionCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { RefreshCw, Sparkles } from "lucide-react";

interface CollectionListData {
  collections: CollectionRecord[];
  count: number;
}

const tabs = [
  { id: "all", label: "All", description: "Every curated story" },
  { id: "published", label: "Published", description: "Live for users" },
  { id: "drafts", label: "Drafts", description: "Work in progress" },
];

export function CollectionsScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("all");

  const isStylist = useMemo(
    () => user?.role?.toUpperCase() === "STYLIST",
    [user?.role]
  );

  const query = useQuery<CollectionListData>({
    queryKey: ["collections", { role: user?.role }],
    queryFn: async () => {
      const { data } = await collectionAPI.getCollections();
      const collections: CollectionRecord[] = data?.data ?? [];

      const filteredCollections: CollectionRecord[] = isStylist
        ? collections
        : collections.filter((collection) => collection.isPublished);

      return {
        collections: filteredCollections,
        count: data?.metaData?.totalCount ?? filteredCollections.length,
      };
    },
    staleTime: 1000 * 60,
  });

  const filteredCollections = useMemo<CollectionRecord[]>(() => {
    if (!query.data) return [];

    switch (activeTab) {
      case "published":
        return query.data.collections.filter((collection) => collection.isPublished);
      case "drafts":
        return query.data.collections.filter((collection) => !collection.isPublished);
      default:
        return query.data.collections;
    }
  }, [activeTab, query.data]);

  const visibleTabs = isStylist ? tabs : tabs.filter((tab) => tab.id !== "drafts");

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-20 space-y-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 blur-3xl" />

      <header className="space-y-4">
        <GlassCard
          padding="2rem"
          blur="20px"
          glowColor="rgba(59, 130, 246, 0.4)"
          glowIntensity={20}
          shadowColor="rgba(15, 23, 42, 0.55)"
          className="relative overflow-hidden border border-cyan-500/20 bg-slate-950/40"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.55),transparent_60%)] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(76,29,149,0.55),transparent_65%)] opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-900/15 backdrop-blur-sm" />
            <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
          </div>
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white backdrop-blur-md">
              Curated for You
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                  Stylist Collections Gallery
                </h1>
                <p className="max-w-2xl text-base text-white">
                  Explore atmospheric outfit narratives handcrafted by our stylist community. Discover how professionals blend fabric, mood, and silhouette into immersive, wearable stories.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 border-cyan-300/70 bg-cyan-500/20 text-white shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:bg-cyan-500/35 hover:text-white"
                  disabled={query.isLoading}
                  onClick={() => query.refetch()}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                {isStylist && (
                  <Link href="/collections/stylist" className="inline-flex">
                    <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/90 via-sky-500/90 to-indigo-500/90 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-indigo-500">
                      <Sparkles className="h-4 w-4" />
                      Go to stylist dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-2">
          <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-cyan-500/30 bg-slate-900/80 p-1.5 backdrop-blur-lg">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300",
                  tab.id === activeTab
                    ? "bg-cyan-400/30 text-white shadow-[0_0_24px_rgba(56,189,248,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
                aria-pressed={tab.id === activeTab}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            {activeTab === "drafts"
              ? "Draft collections"
              : activeTab === "published"
              ? "Published collections"
              : "All collections"}
          </h2>
          <span className="text-sm text-slate-400">
            {filteredCollections.length} curated stories
          </span>
        </div>

        {query.isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-3xl bg-slate-900/40" />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <GlassCard
            padding="3rem"
            blur="18px"
            glowColor="rgba(79, 70, 229, 0.4)"
            glowIntensity={16}
            shadowColor="rgba(15, 23, 42, 0.45)"
            className="border border-slate-700/40 bg-slate-950/60 text-center"
          >
            <h3 className="mb-2 text-xl font-semibold text-white">Nothing to display yet</h3>
            <p className="text-slate-400">
              {isStylist
                ? "Your collections will appear here once you create them in the stylist dashboard."
                : "Please check back soon — stylists are assembling fresh looks."}
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                canManage={isStylist}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


