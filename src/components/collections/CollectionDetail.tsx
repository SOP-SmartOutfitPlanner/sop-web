  "use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Layers,
  MessageCircle,
  UserPlus,
  SquareStack,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { collectionAPI } from "@/lib/api";
import type { CollectionRecord, CollectionItemDetail } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/store/auth-store";

interface CollectionDetailProps {
  collectionId: number;
}

function parseColorNames(colorString: string | null): string | undefined {
  if (!colorString) return undefined;
  try {
    const parsed = JSON.parse(colorString) as Array<{ name?: string }>;
    const names = parsed
      .map((entry) => entry?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : undefined;
  } catch (error) {
    console.warn("Failed to parse color string", error);
    return undefined;
  }
}

function renderItemSummary(item: CollectionItemDetail) {
  const colors = parseColorNames(item.color);
  const tags = [
    item.condition && { label: item.condition, tone: "emerald" as const },
    item.pattern && { label: item.pattern, tone: "cyan" as const },
    item.fabric && { label: item.fabric, tone: "violet" as const },
  ].filter(Boolean) as Array<{
    label: string;
    tone: "emerald" | "cyan" | "violet";
  }>;

  const tagClassName = (tone: "emerald" | "cyan" | "violet") =>
    ({
      emerald: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
      cyan: "border-cyan-300/20 bg-cyan-500/10 text-cyan-100",
      violet: "border-violet-300/20 bg-violet-500/10 text-violet-100",
    }[tone]);

  return (
    <div
      key={item.itemId}
      className="flex items-stretch gap-4 rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 transition-all duration-300 hover:border-cyan-400/25 hover:bg-slate-900/60"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_4px_12px_-4px_rgba(56,189,248,0.3)] sm:h-28 sm:w-28">
        {item.imgUrl ? (
          <Image
            src={item.imgUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 120px, 140px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cyan-300/60">
            <Shirt className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white line-clamp-2">
                {item.name}
              </p>
              <p className="text-xs text-slate-400">
                {item.categoryName}
                {colors && <span className="text-slate-500"> • {colors}</span>}
              </p>
            </div>
          </div>
          {item.aiDescription && (
            <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-2 md:text-[13px] md:leading-5">
              {item.aiDescription}
            </p>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
            {tags.map((tag) => (
              <Badge
                key={tag.label}
                className={cn(
                  "border px-2.5 py-1 text-[10px] font-semibold",
                  tagClassName(tag.tone)
                )}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getHeroImage(collection: CollectionRecord): string | undefined {
  if (collection.thumbnailURL) {
    return collection.thumbnailURL;
  }
  const outfitWithImage = collection.outfits?.find((entry) =>
    entry.outfit?.items?.some((item) => item.imgUrl)
  );
  return (
    outfitWithImage?.outfit?.items.find((item) => item.imgUrl)?.imgUrl ??
    undefined
  );
}

export function CollectionDetail({ collectionId }: CollectionDetailProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: async () => {
      const response = await collectionAPI.getCollectionById(collectionId);
      return response.data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return collectionAPI.likeCollection(collectionId, parseInt(user.id, 10));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      const wasLiked = collection?.isLiked;
      toast.success(wasLiked ? "Collection unliked" : "Collection liked successfully");
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return collectionAPI.saveCollection(collectionId, parseInt(user.id, 10));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      const wasSaved = collection?.isSaved;
      toast.success(wasSaved ? "Collection unsaved" : "Collection saved successfully");
    },
    onError: (error) => {
      console.error("Error toggling save:", error);
      toast.error("Failed to update save status");
    },
  });

  const collection = query.data;
  const heroImage = useMemo(
    () => (collection ? getHeroImage(collection) : undefined),
    [collection]
  );
  const outfitsCount = collection?.outfits?.length ?? 0;

  if (query.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-8">
        <Skeleton className="h-48 w-full rounded-3xl bg-slate-900/40" />
        <Skeleton className="h-40 w-full rounded-3xl bg-slate-900/30" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl bg-slate-900/40" />
          <Skeleton className="h-64 rounded-3xl bg-slate-900/40" />
        </div>
      </div>
    );
  }

  if (query.isError || !collection) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24">
        <GlassCard
          padding="2rem"
          blur="18px"
          glowColor="rgba(248, 113, 113, 0.35)"
          glowIntensity={16}
          shadowColor="rgba(15, 23, 42, 0.5)"
          className="border border-red-500/30 bg-red-500/5 text-red-100"
        >
          <h2 className="text-xl font-semibold">Unable to load collection</h2>
          <p className="mt-2 text-sm text-red-200/80">
            Please refresh the page or return to the collections gallery.
          </p>
          <div className="mt-6">
            <Link href="/collections">
              <Button
                variant="outline"
                className="border-red-400/40 text-red-100 hover:bg-red-500/10"
              >
                Back to collections
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const statusBadge = collection.isPublished
    ? {
        label: "Published",
        className:
          "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
      }
    : {
        label: "Draft",
        className: "bg-slate-800/40 text-slate-200 border border-slate-600/40",
      };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-20 space-y-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-500/10 via-slate-950 to-slate-950 blur-3xl" />

      <div className="flex items-center justify-between gap-4">
        <Link href="/collections">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-200 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to collections
          </Button>
        </Link>
        <Badge className={cn("uppercase tracking-wide", statusBadge.className)}>
          {statusBadge.label}
        </Badge>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-slate-950/50">
        {heroImage && (
          <Image
            src={heroImage}
            alt={collection.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/10" />
        <div className="relative flex flex-col gap-10 p-8 md:flex-row md:items-end md:justify-between md:p-12">
          <div className="max-w-3xl space-y-5">
            <Badge
              className={cn(
                "w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.35em]",
                statusBadge.className
              )}
            >
              {statusBadge.label}
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                {collection.title}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
                {collection.shortDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-200/90">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <UserPlus className="h-4 w-4 text-cyan-200" />
                {collection.userDisplayName}
              </div>
              <button
                onClick={() => {
                  if (!user?.id) {
                    toast.error("Please login to like collections");
                    return;
                  }
                  likeMutation.mutate();
                }}
                disabled={likeMutation.isPending}
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-colors",
                    collection.isLiked
                      ? "fill-rose-300 text-rose-300"
                      : "text-rose-300"
                  )}
                />
                {collection.likeCount}
              </button>
              <div className="inline-flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-cyan-200" />
                {collection.commentCount}
              </div>
              <div className="inline-flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-200" />
                {outfitsCount} outfits
              </div>
              <div className="inline-flex items-center gap-2 text-slate-300">
                Published{" "}
                {formatDistanceToNow(new Date(collection.createdDate), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <UserPlus className="h-4 w-4" />
                {collection.isFollowing
                  ? "Following stylist"
                  : "Follow stylist"}
              </Button>
              <Button
                onClick={() => {
                  if (!user?.id) {
                    toast.error("Please login to save collections");
                    return;
                  }
                  saveMutation.mutate();
                }}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/90 via-sky-500/90 to-indigo-500/90 text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4 transition-colors",
                    collection.isSaved && "fill-white"
                  )}
                />
                {collection.isSaved ? "Saved" : "Save collection"}
              </Button>
            </div>
            <div className="text-xs uppercase tracking-[0.35em] text-slate-300/70">
              {collection.isSaved ? "In your wardrobe" : "Discover & curate"}
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <SquareStack className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-semibold">
              Outfits in this collection
            </h2>
          </div>
        </div>

        <div className="space-y-10">
          {collection.outfits.length === 0 && (
            <GlassCard
              padding="2rem"
              blur="18px"
              glowColor="rgba(148, 163, 184, 0.35)"
              glowIntensity={14}
              shadowColor="rgba(15, 23, 42, 0.4)"
              className="border border-slate-700/40 bg-slate-900/50 text-center text-sm text-slate-300"
            >
              No outfits have been added to this collection yet.
            </GlassCard>
          )}
          {collection.outfits.map((entry, index) => {
            const outfit = entry.outfit;
            const items = outfit?.items ?? [];
            const featureImage =
              items.find((item) => item.imgUrl)?.imgUrl ?? heroImage;

            return (
              <GlassCard
                key={`${collection.id}-${index}`}
                padding="1.75rem"
                blur="18px"
                glowColor="rgba(94, 234, 212, 0.25)"
                glowIntensity={14}
                shadowColor="rgba(15, 23, 42, 0.5)"
                className="flex flex-col gap-6 border border-cyan-500/15 bg-slate-950/45"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 text-xs font-bold text-cyan-100">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {outfit?.name ?? `Outfit ${index + 1}`}
                      </h3>
                      {entry.description || outfit?.description ? (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {entry.description || outfit?.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {items.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-700/40 bg-slate-900/50 text-sm text-slate-400">
                      No items listed for this outfit yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {items.map((item) => renderItemSummary(item))}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end text-xs uppercase tracking-wide text-slate-500">
        Updated{" "}
        {formatDistanceToNow(
          new Date(collection.updatedDate ?? collection.createdDate),
          { addSuffix: true }
        )}
      </div>
    </div>
  );
}
