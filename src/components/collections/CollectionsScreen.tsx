"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collectionAPI, CollectionRecord } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import { CollectionCard } from "./CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { filterCollectionsByStatus } from "@/lib/collections/utils";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";
import { Bookmark, Globe2, FileText, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CollectionListData {
  collections: CollectionRecord[];
  count: number;
}

export function CollectionsScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "all" | "published" | "drafts" | "saved"
  >("all");
  const userId = user?.id ? parseInt(user.id, 10) : null;

  const isStylist = useMemo(
    () => user?.role?.toUpperCase() === "STYLIST",
    [user?.role]
  );

  // Fetch all collections
  // For stylists, fetch their own collections to get drafts
  // For regular users, fetch all published collections
  const collectionsQuery = useQuery<CollectionListData>({
    queryKey: [
      ...COLLECTION_QUERY_KEYS.collections,
      { role: user?.role, userId: isStylist ? userId : null },
    ],
    queryFn: async () => {
      let collections: CollectionRecord[] = [];
      let totalCount = 0;

      if (isStylist && userId) {
        // For stylists, get their own collections (includes drafts)
        const { data } = await collectionAPI.getCollectionsByUserId(userId);
        collections = data?.data ?? [];
        totalCount = data?.metaData?.totalCount ?? collections.length;
      } else {
        // For regular users, get all published collections
        const { data } = await collectionAPI.getCollections();
        collections = data?.data ?? [];
        collections = collections.filter(
          (collection) => collection.isPublished
        );
        totalCount = data?.metaData?.totalCount ?? collections.length;
      }

      return {
        collections,
        count: totalCount,
      };
    },
    staleTime: 1000 * 60,
    enabled: activeTab !== "saved",
  });

  // Fetch saved collections
  const savedCollectionsQuery = useQuery<CollectionListData>({
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
    enabled: activeTab === "saved" && !!userId,
    staleTime: 1000 * 60,
  });

  const filteredCollections = useMemo<CollectionRecord[]>(() => {
    if (activeTab === "saved") {
      return savedCollectionsQuery.data?.collections ?? [];
    }
    if (!collectionsQuery.data) return [];
    return filterCollectionsByStatus(
      collectionsQuery.data.collections,
      activeTab
    );
  }, [activeTab, collectionsQuery.data, savedCollectionsQuery.data]);

  const isLoading =
    activeTab === "saved"
      ? savedCollectionsQuery.isLoading
      : collectionsQuery.isLoading;

  const count =
    activeTab === "saved"
      ? savedCollectionsQuery.data?.count ?? 0
      : filteredCollections.length;

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
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-900/55 backdrop-blur-sm" />
          </div>
          <div className="relative space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white backdrop-blur-md font-semibold">
              Curated for You
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-3 relative z-10">
                <h1 className="text-4xl font-black leading-tight text-white drop-shadow-lg md:text-5xl">
                  Stylist Collections Gallery
                </h1>
                <p className="max-w-2xl text-base text-white/95 leading-relaxed drop-shadow-md">
                  Explore atmospheric outfit narratives handcrafted by our
                  stylist community. Discover how professionals blend fabric,
                  mood, and silhouette into immersive, wearable stories.
                </p>
              </div>
              {isStylist && userId && (
                <div className="relative z-10 mb-18 px-3">
                  <Link href={`/collections/user/${userId}`}>
                    <Button
                      size="lg"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-indigo-500/90 text-white shadow-2xl shadow-cyan-500/40 hover:from-cyan-500 hover:to-indigo-500 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 font-semibold px-6 py-6"
                    >
                      <Sparkles className="h-5 w-5" />
                      Go to Studio
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </header>

      <section className="space-y-8">
        {/* Tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-slate-900/80 p-1.5 backdrop-blur-lg shadow-lg shadow-cyan-500/10">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 relative",
                activeTab === "all"
                  ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30 scale-105"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <Layers className="h-4 w-4" />
              All
            </button>

            {userId && (
              <button
                onClick={() => setActiveTab("saved")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 relative",
                  activeTab === "saved"
                    ? "bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-white shadow-lg shadow-amber-500/30 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Bookmark className="h-4 w-4" />
                Saved
              </button>
            )}
            {isStylist && (
              <>
                <button
                  onClick={() => setActiveTab("published")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 relative",
                    activeTab === "published"
                      ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30 scale-105"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Globe2 className="h-4 w-4" />
                  Published
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 relative",
                    activeTab === "drafts"
                      ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30 scale-105"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Drafts
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            {activeTab === "saved"
              ? "Saved Collections"
              : activeTab === "drafts"
              ? "Draft collections"
              : activeTab === "published"
              ? "Published collections"
              : "All collections"}
          </h2>
          <span className="text-sm text-slate-400">
            {count} {activeTab === "saved" ? "saved" : "curated"}{" "}
            {count !== 1 ? "collections" : "collection"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-64 rounded-3xl bg-slate-900/40"
              />
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
            <h3 className="mb-2 text-xl font-semibold text-white">
              {activeTab === "saved"
                ? "No saved collections yet"
                : "Nothing to display yet"}
            </h3>
            <p className="text-slate-400">
              {activeTab === "saved"
                ? userId
                  ? "Start exploring collections and save your favorites to build your personal style library."
                  : "Please login to view your saved collections."
                : isStylist
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
