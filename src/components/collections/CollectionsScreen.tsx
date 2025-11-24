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

type TabType = "all" | "published" | "drafts" | "saved";

const STALE_TIME = 1000 * 60; // 1 minute
const SKELETON_COUNT = 4;

export function CollectionsScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const userId = useMemo(
    () => (user?.id ? parseInt(user.id, 10) : null),
    [user?.id]
  );
  const isStylist = useMemo(
    () => user?.role?.toUpperCase() === "STYLIST",
    [user?.role]
  );

  // Fetch all collections (for tab "all")
  const allCollectionsQuery = useQuery<CollectionListData>({
    queryKey: [...COLLECTION_QUERY_KEYS.collections, { type: "all" }],
    queryFn: async () => {
      const { data } = await collectionAPI.getCollections();
      return {
        collections: data?.data ?? [],
        count: data?.metaData?.totalCount ?? data?.data?.length ?? 0,
      };
    },
    staleTime: STALE_TIME,
    enabled: activeTab === "all",
  });

  // Fetch stylist's own collections (for tab "published" and "drafts")
  const stylistCollectionsQuery = useQuery<CollectionListData>({
    queryKey: [
      ...COLLECTION_QUERY_KEYS.collections,
      { type: "stylist", userId },
    ],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data } = await collectionAPI.getCollectionsByUserId(userId);
      return {
        collections: data?.data ?? [],
        count: data?.metaData?.totalCount ?? data?.data?.length ?? 0,
      };
    },
    staleTime: STALE_TIME,
    enabled:
      isStylist &&
      (activeTab === "published" || activeTab === "drafts") &&
      !!userId,
  });

  // Fetch saved collections
  const savedCollectionsQuery = useQuery<CollectionListData>({
    queryKey: userId ? COLLECTION_QUERY_KEYS.savedCollections(userId) : [],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const { data } = await collectionAPI.getSavedCollectionsByUserId(userId, {
        takeAll: true,
      });
      return {
        collections: data?.data ?? [],
        count: data?.metaData?.totalCount ?? data?.data?.length ?? 0,
      };
    },
    staleTime: STALE_TIME,
    enabled: activeTab === "saved" && !!userId,
  });

  const filteredCollections = useMemo<CollectionRecord[]>(() => {
    switch (activeTab) {
      case "saved":
        return savedCollectionsQuery.data?.collections ?? [];

      case "all": {
        const collections = allCollectionsQuery.data?.collections ?? [];
        return isStylist
          ? collections
          : collections.filter((c) => c.isPublished);
      }

      case "published":
      case "drafts": {
        const collections = stylistCollectionsQuery.data?.collections ?? [];
        return filterCollectionsByStatus(collections, activeTab);
      }

      default:
        return [];
    }
  }, [
    activeTab,
    allCollectionsQuery.data,
    stylistCollectionsQuery.data,
    savedCollectionsQuery.data,
    isStylist,
  ]);

  const isLoading = useMemo(() => {
    switch (activeTab) {
      case "saved":
        return savedCollectionsQuery.isLoading;
      case "all":
        return allCollectionsQuery.isLoading;
      default:
        return stylistCollectionsQuery.isLoading;
    }
  }, [
    activeTab,
    allCollectionsQuery.isLoading,
    stylistCollectionsQuery.isLoading,
    savedCollectionsQuery.isLoading,
  ]);

  const count = useMemo(() => {
    return activeTab === "saved"
      ? savedCollectionsQuery.data?.count ?? 0
      : filteredCollections.length;
  }, [
    activeTab,
    savedCollectionsQuery.data?.count,
    filteredCollections.length,
  ]);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-20 space-y-5">
      <div className="absolute inset-0 -z-10  blur-3xl" />

      <header>
        <GlassCard
          padding="2rem"
          blur="20px"
          glowColor="rgba(59, 130, 246, 0.4)"
          glowIntensity={20}
          shadowColor="rgba(15, 23, 42, 0.55)"
          className="relative overflow-hidden border border-cyan-500/20 "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0  backdrop-blur-sm" />
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
              {isStylist && (
                <div className="relative z-10">
                  <Button
                    asChild
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:from-cyan-400 hover:to-blue-500"
                  >
                    <Link href="/dashboard/stylist">
                      <Sparkles className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                      Enter Stylist Studio
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </header>

      <section className="space-y-8">
        {/* Tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          <GlassCard
            padding="1rem"
            blur="12px"
            glowColor="rgba(59, 130, 246, 0.4)"
            glowIntensity={20}
            shadowColor="rgba(15, 23, 42, 0.55)"
            className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30  p-1.5 backdrop-blur-lg shadow-lg shadow-cyan-500/10"
          >
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
          </GlassCard>
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
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
