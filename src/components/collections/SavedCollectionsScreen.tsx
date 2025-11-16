"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { collectionAPI, CollectionRecord } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import { CollectionCard } from "./CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Sparkles } from "lucide-react";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";

interface CollectionListData {
  collections: CollectionRecord[];
  count: number;
}

export function SavedCollectionsScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ? parseInt(user.id, 10) : null;

  const query = useQuery<CollectionListData>({
    queryKey: userId ? COLLECTION_QUERY_KEYS.savedCollections(userId) : [],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const { data } = await collectionAPI.getSavedCollectionsByUserId(userId, {
        takeAll: true,
      });
      const collections: CollectionRecord[] = data?.data ?? [];

      return {
        collections,
        count: data?.metaData?.totalCount ?? collections.length,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-20 space-y-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 blur-3xl" />

      <header className="space-y-4">
        <GlassCard
          padding="2rem"
          blur="20px"
          glowColor="rgba(251, 191, 36, 0.4)"
          glowIntensity={20}
          shadowColor="rgba(15, 23, 42, 0.55)"
          className="relative overflow-hidden border border-amber-500/20 bg-slate-950/40"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.55),transparent_60%)] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,119,6,0.55),transparent_65%)] opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-900/55 backdrop-blur-sm" />
          </div>
          <div className="relative space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white backdrop-blur-md font-semibold">
              <Bookmark className="h-3 w-3" />
              Saved Collections
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-3 relative z-10">
                <h1 className="text-4xl font-black leading-tight text-white drop-shadow-lg md:text-5xl">
                  My Saved Collections
                </h1>
                <p className="max-w-2xl text-base text-white/95 leading-relaxed drop-shadow-md">
                  Your curated collection of favorite outfit narratives. Revisit
                  the styles that inspired you and discover new ways to express
                  your personal fashion journey.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </header>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Saved Collections
          </h2>
          <span className="text-sm text-slate-400">
            {query.data?.count ?? 0} saved
            {query.data?.count !== 1 ? " collections" : " collection"}
          </span>
        </div>

        {!userId ? (
          <GlassCard
            padding="3rem"
            blur="18px"
            glowColor="rgba(79, 70, 229, 0.4)"
            glowIntensity={16}
            shadowColor="rgba(15, 23, 42, 0.45)"
            className="border border-slate-700/40 bg-slate-950/60 text-center"
          >
            <h3 className="mb-2 text-xl font-semibold text-white">
              Please login to view saved collections
            </h3>
            <p className="text-slate-400">
              Sign in to see your saved collections and favorite outfit
              narratives.
            </p>
          </GlassCard>
        ) : query.isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-64 rounded-3xl bg-slate-900/40"
              />
            ))}
          </div>
        ) : query.data && query.data.collections.length === 0 ? (
          <GlassCard
            padding="3rem"
            blur="18px"
            glowColor="rgba(79, 70, 229, 0.4)"
            glowIntensity={16}
            shadowColor="rgba(15, 23, 42, 0.45)"
            className="border border-slate-700/40 bg-slate-950/60 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-amber-500/20 border border-amber-500/40">
                <Bookmark className="h-12 w-12 text-amber-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                No saved collections yet
              </h3>
              <p className="text-slate-400 max-w-md">
                Start exploring collections and save your favorites to build your
                personal style library.
              </p>
            </div>
          </GlassCard>
        ) : query.data ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {query.data.collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                canManage={false}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

